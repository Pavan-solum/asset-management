import { getSql, json, error, corsPreflight, parseBody, DEMO_TENANT_ID } from '../_lib/db';
import { mapDepartment, type DbDepartment } from '../_lib/mappers';
import { requireAuth, insertAuditLog } from '../_lib/auth';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return corsPreflight();

  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const sql = getSql();

  try {
    if (req.method === 'GET') {
      const rows = await sql`
        SELECT * FROM departments WHERE tenant_id = ${DEMO_TENANT_ID} ORDER BY name ASC
      ` as DbDepartment[];
      return json(rows.map(mapDepartment));
    }

    if (req.method === 'POST') {
      const body = await parseBody<Record<string, unknown>>(req);
      const name = String(body.name ?? '').trim();
      if (!name) return error('name is required', 400);

      const id = body.id ? String(body.id) : crypto.randomUUID();
      const rows = await sql`
        INSERT INTO departments (id, tenant_id, name, cost_center)
        VALUES (${id}, ${DEMO_TENANT_ID}, ${name}, ${body.costCenter ? String(body.costCenter) : null})
        RETURNING *
      ` as DbDepartment[];

      await insertAuditLog({
        userId: auth.sub,
        userName: `${auth.firstName} ${auth.lastName}`,
        action: 'CREATE',
        entityType: 'department',
        entityId: id,
        entityLabel: name,
        details: 'Department created',
      });

      return json(mapDepartment(rows[0]), 201);
    }

    return error('Method not allowed', 405);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Request failed';
    if (message.includes('unique')) return error('Department name already exists', 409);
    return error(message, 500);
  }
}
