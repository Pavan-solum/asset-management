import { getSql, json, error, corsPreflight, parseBody, DEMO_TENANT_ID } from '../_lib/db';
import { mapAsset, type DbAsset } from '../_lib/mappers';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return corsPreflight();

  const url = new URL(req.url);
  const parts = url.pathname.split('/').filter(Boolean);
  const id = parts[parts.length - 1];

  if (!id || id === 'assets') return error('Asset id required', 400);

  const sql = getSql();

  try {
    if (req.method === 'GET') {
      const rows = await sql`
        SELECT * FROM assets WHERE id = ${id} AND tenant_id = ${DEMO_TENANT_ID}
      ` as DbAsset[];
      if (rows.length === 0) return error('Asset not found', 404);
      return json(mapAsset(rows[0]));
    }

    if (req.method === 'PATCH') {
      const body = await parseBody<Record<string, unknown>>(req);
      const rows = await sql`
        UPDATE assets SET
          name = COALESCE(${body.name ? String(body.name) : null}, name),
          status = COALESCE(${body.status ? String(body.status) : null}, status),
          assigned_employee_id = ${body.assignedEmployeeId !== undefined ? (body.assignedEmployeeId ? String(body.assignedEmployeeId) : null) : null},
          location = COALESCE(${body.location ? String(body.location) : null}, location),
          notes = COALESCE(${body.notes ? String(body.notes) : null}, notes),
          updated_at = NOW()
        WHERE id = ${id} AND tenant_id = ${DEMO_TENANT_ID}
        RETURNING *
      ` as DbAsset[];
      if (rows.length === 0) return error('Asset not found', 404);
      return json(mapAsset(rows[0]));
    }

    if (req.method === 'DELETE') {
      await sql`DELETE FROM ownership_history WHERE asset_id = ${id} AND tenant_id = ${DEMO_TENANT_ID}`;
      await sql`DELETE FROM asset_assignments WHERE asset_id = ${id} AND tenant_id = ${DEMO_TENANT_ID}`;
      await sql`DELETE FROM assets WHERE id = ${id} AND tenant_id = ${DEMO_TENANT_ID}`;
      return json({ success: true });
    }

    return error('Method not allowed', 405);
  } catch (e) {
    return error(e instanceof Error ? e.message : 'Request failed', 500);
  }
}
