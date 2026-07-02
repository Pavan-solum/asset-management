import { getTenantSql, json, error, corsPreflight, parseBody, DEMO_TENANT_ID } from '../_lib/db';
import { mapVendor, type DbVendor } from '../_lib/mappers';
import { requireAuth, insertAuditLog } from '../_lib/auth';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return corsPreflight();

  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const sql = await getTenantSql(auth.tenantId || DEMO_TENANT_ID);

  try {
    if (req.method === 'GET') {
      const rows = await sql`
        SELECT * FROM vendors WHERE tenant_id = ${auth.tenantId || DEMO_TENANT_ID} ORDER BY name ASC
      ` as DbVendor[];
      return json(rows.map(mapVendor));
    }

    if (req.method === 'POST') {
      const body = await parseBody<Record<string, unknown>>(req);
      const name = String(body.name ?? '').trim();
      if (!name) return error('name is required', 400);

      const id = body.id ? String(body.id) : crypto.randomUUID();
      const rows = await sql`
        INSERT INTO vendors (id, tenant_id, name, contact_email, website)
        VALUES (
          ${id}, ${auth.tenantId || DEMO_TENANT_ID}, ${name},
          ${body.contactEmail ? String(body.contactEmail) : null},
          ${body.website ? String(body.website) : null}
        )
        RETURNING *
      ` as DbVendor[];

      await insertAuditLog({
        userId: auth.sub,
        userName: `${auth.firstName} ${auth.lastName}`,
        action: 'CREATE',
        entityType: 'vendor',
        entityId: id,
        entityLabel: name,
        details: 'Vendor created',
      });

      return json(mapVendor(rows[0]), 201);
    }

    return error('Method not allowed', 405);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Request failed';
    if (message.includes('unique')) return error('Vendor name already exists', 409);
    return error(message, 500);
  }
}
