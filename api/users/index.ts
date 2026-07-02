import { getSql, json, error, corsPreflight, parseBody } from '../_lib/db';
import { mapUser, type DbUser } from '../_lib/mappers';
import { requireAuth, insertAuditLog, hashPassword } from '../_lib/auth';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return corsPreflight();

  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  // Only Platform Admins or Tenant Admins can manage users
  if (auth.role !== 'platform_admin' && auth.role !== 'tenant_admin') {
    return error('Forbidden', 403);
  }

  const sql = getSql();

  try {
    if (req.method === 'GET') {
      let rows;
      if (auth.role === 'platform_admin') {
        rows = await sql`SELECT * FROM users ORDER BY created_at DESC` as DbUser[];
      } else {
        rows = await sql`SELECT * FROM users WHERE tenant_id = ${auth.tenantId || ''} ORDER BY created_at DESC` as DbUser[];
      }
      return json(rows.map(mapUser));
    }

    if (req.method === 'POST') {
      const body = await parseBody<Record<string, unknown>>(req);
      const email = String(body.email ?? '').trim().toLowerCase();
      const firstName = String(body.firstName ?? '').trim();
      const lastName = String(body.lastName ?? '').trim();
      const role = String(body.role ?? 'viewer').trim();
      const tenantId = String(body.tenantId ?? '');

      if (!email || !firstName || !tenantId) {
        return error('email, firstName, and tenantId are required', 400);
      }

      const id = body.id && String(body.id) ? String(body.id) : crypto.randomUUID();
      
      const rows = await sql`
        INSERT INTO users (
          id, tenant_id, email, first_name, last_name, role
        ) VALUES (
          ${id}, ${tenantId}, ${email}, ${firstName}, ${lastName}, ${role}
        )
        RETURNING *
      ` as DbUser[];

      // Insert default password for the new user
      const hashed = await hashPassword('Demo@123456');
      await sql`
        INSERT INTO user_passwords (email, password_hash)
        VALUES (${email}, ${hashed})
        ON CONFLICT (email) DO UPDATE SET password_hash = ${hashed}
      `;

      await insertAuditLog({
        userId: auth.sub,
        userName: `${auth.firstName} ${auth.lastName}`,
        action: 'CREATE',
        entityType: 'user',
        entityId: id,
        entityLabel: email,
        details: `Created user ${email} with role ${role}`,
      });

      return json(mapUser(rows[0]), 201);
    }

    return error('Method not allowed', 405);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Request failed';
    if (message.includes('unique') || message.includes('duplicate')) {
      return error('User email already exists', 409);
    }
    return error(message, 500);
  }
}
