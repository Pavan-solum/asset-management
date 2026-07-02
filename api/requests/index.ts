import { getTenantSql, json, error, corsPreflight, parseBody, DEMO_TENANT_ID } from '../_lib/db';
import { mapAssetRequest, type DbAssetRequest } from '../_lib/mappers';
import { requireAuth, canReviewRequests, insertAuditLog, type AuthUser } from '../_lib/auth';

export const config = { runtime: 'edge' };

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

async function resolveEmployeeId(auth: AuthUser): Promise<string | Response> {
  const sql = await getTenantSql(auth.tenantId || DEMO_TENANT_ID);

  if (auth.employeeId && isUuid(auth.employeeId)) {
    return auth.employeeId;
  }

  try {
    const rows = (await sql`
      SELECT id FROM employees
      WHERE tenant_id = ${auth.tenantId || DEMO_TENANT_ID} AND lower(email) = ${auth.email.toLowerCase()}
      LIMIT 1
    `) as { id: string }[];

    if (rows.length > 0) return rows[0].id;
  } catch {
    return error('Employee record not found for this account', 403);
  }

  return error('Employee record not found for this account', 403);
}

async function fetchRequests(tenantId: string, employeeId?: string): Promise<DbAssetRequest[]> {
  const sql = await getTenantSql(tenantId);

  if (employeeId) {
    return (await sql`
      SELECT
        r.*,
        e.first_name AS employee_first_name,
        e.last_name AS employee_last_name,
        e.email AS employee_email,
        d.name AS department_name
      FROM asset_requests r
      JOIN employees e ON e.id = r.employee_id
      LEFT JOIN departments d ON d.id = e.department_id
      WHERE r.tenant_id = ${tenantId} AND r.employee_id = ${employeeId}
      ORDER BY r.created_at DESC
    `) as DbAssetRequest[];
  }

  return (await sql`
    SELECT
      r.*,
      e.first_name AS employee_first_name,
      e.last_name AS employee_last_name,
      e.email AS employee_email,
      d.name AS department_name
    FROM asset_requests r
    JOIN employees e ON e.id = r.employee_id
    LEFT JOIN departments d ON d.id = e.department_id
    WHERE r.tenant_id = ${tenantId}
    ORDER BY r.created_at DESC
  `) as DbAssetRequest[];
}

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return corsPreflight();

  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  try {
    if (req.method === 'GET') {
      if (canReviewRequests(auth.role)) {
        const rows = await fetchRequests(auth.tenantId || DEMO_TENANT_ID);
        return json(rows.map(mapAssetRequest));
      }

      if (auth.role === 'employee') {
        const employeeId = await resolveEmployeeId(auth);
        if (employeeId instanceof Response) return employeeId;
        const rows = await fetchRequests(auth.tenantId || DEMO_TENANT_ID, employeeId);
        return json(rows.map(mapAssetRequest));
      }

      return error('Forbidden', 403);
    }

    if (req.method === 'POST') {
      if (auth.role !== 'employee') {
        return error('Only employees can submit device requests', 403);
      }

      const employeeId = await resolveEmployeeId(auth);
        if (employeeId instanceof Response) return employeeId;

        const body = await parseBody<Record<string, unknown>>(req);
      const requestType = String(body.requestType ?? '').trim();
      const category = String(body.category ?? '').trim();
      const description = String(body.description ?? '').trim();
      const neededBy = body.neededBy ? String(body.neededBy) : null;

      if (!requestType || !category || !description) {
        return error('requestType, category, and description are required', 400);
      }

      if (!['new', 'replacement', 'accessory'].includes(requestType)) {
        return error('Invalid requestType', 400);
      }

      const sql = await getTenantSql(auth.tenantId || DEMO_TENANT_ID);
      const rows = (await sql`
        INSERT INTO asset_requests (
          tenant_id, employee_id, request_type, category, description, needed_by
        ) VALUES (
          ${auth.tenantId || DEMO_TENANT_ID}, ${employeeId}, ${requestType}, ${category}, ${description}, ${neededBy}
        )
        RETURNING *
      `) as DbAssetRequest[];

      const created = rows[0];

      try {
        await insertAuditLog({
          userId: auth.sub,
          userName: `${auth.firstName} ${auth.lastName}`,
          action: 'CREATE',
          entityType: 'asset_request',
          entityId: created.id,
          entityLabel: `${requestType} — ${category}`,
          details: description.slice(0, 200),
        });
      } catch {
        /* non-blocking */
      }

      return json(mapAssetRequest(created), 201);
    }

    return error('Method not allowed', 405);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Request failed';
    if (message.includes('asset_requests') && message.includes('does not exist')) {
      return error('Database migration needed. Run database/supabase/004_asset_requests.sql', 500);
    }
    return error(message, 500);
  }
}
