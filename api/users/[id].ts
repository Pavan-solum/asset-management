import { getSql, json, error, corsPreflight, parseBody } from '../_lib/db';
import { mapUser, type DbUser } from '../_lib/mappers';
import { requireAuth, insertAuditLog } from '../_lib/auth';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return corsPreflight();

  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  if (auth.role !== 'platform_admin' && auth.role !== 'tenant_admin') {
    return error('Forbidden', 403);
  }

  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();
  if (!id || id === 'users') return error('Invalid user ID', 400);

  const sql = getSql();

  try {
    if (req.method === 'PATCH') {
      const body = await parseBody<Record<string, unknown>>(req);
      
      const rows = await sql`
        UPDATE users
        SET 
          first_name = COALESCE(${body.firstName ? String(body.firstName) : null}, first_name),
          last_name = COALESCE(${body.lastName ? String(body.lastName) : null}, last_name),
          role = COALESCE(${body.role ? String(body.role) : null}, role),
          tenant_id = COALESCE(${body.tenantId ? String(body.tenantId) : null}, tenant_id)
        WHERE id = ${id}
        RETURNING *
      ` as DbUser[];

      if (rows.length === 0) return error('User not found', 404);

      await insertAuditLog({
        userId: auth.sub,
        userName: `${auth.firstName} ${auth.lastName}`,
        action: 'UPDATE',
        entityType: 'user',
        entityId: id,
        entityLabel: rows[0].email,
        details: `Updated user ${rows[0].email}`,
      });

      return json(mapUser(rows[0]));
    }

    if (req.method === 'DELETE') {
      const rows = await sql`
        DELETE FROM users WHERE id = ${id} RETURNING email, first_name
      ` as { email: string; first_name: string }[];

      if (rows.length === 0) return error('User not found', 404);

      // Optionally delete password, though it won't hurt to leave it or we can delete it via trigger.
      await sql`DELETE FROM user_passwords WHERE email = ${rows[0].email}`;

      await insertAuditLog({
        userId: auth.sub,
        userName: `${auth.firstName} ${auth.lastName}`,
        action: 'DELETE',
        entityType: 'user',
        entityId: id,
        entityLabel: rows[0].email,
        details: `Deleted user ${rows[0].email}`,
      });

      return json({ success: true, id });
    }

    return error('Method not allowed', 405);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Request failed';
    return error(message, 500);
  }
}
