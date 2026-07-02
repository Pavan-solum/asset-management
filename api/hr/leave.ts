import { getTenantSql, json, error, corsPreflight, parseBody, DEMO_TENANT_ID } from '../_lib/db';
import { requireAuth, insertAuditLog } from '../_lib/auth';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return corsPreflight();

  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const sql = await getTenantSql(auth.tenantId || DEMO_TENANT_ID);

  try {
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const employeeId = url.searchParams.get('employeeId');

      let rows;
      if (employeeId) {
        rows = await sql`
          SELECT * FROM hr_leave_requests 
          WHERE tenant_id = ${auth.tenantId || DEMO_TENANT_ID} AND employee_id = ${employeeId} AND deleted_at IS NULL
          ORDER BY created_at DESC
        ` as Record<string, any>[];
      } else {
        rows = await sql`
          SELECT * FROM hr_leave_requests 
          WHERE tenant_id = ${auth.tenantId || DEMO_TENANT_ID} AND deleted_at IS NULL
          ORDER BY created_at DESC
        ` as Record<string, any>[];
      }

      return json(rows.map((row) => ({
        id: row.id,
        employeeId: row.employee_id,
        leaveType: row.leave_type,
        startDate: row.start_date,
        endDate: row.end_date,
        daysCount: row.days_count,
        reason: row.reason,
        status: row.status,
        approvedBy: row.approved_by,
        createdAt: row.created_at,
      })));
    }

    if (req.method === 'POST') {
      const body = await parseBody<Record<string, unknown>>(req);
      const employeeId = String(body.employeeId ?? '').trim();
      const leaveType = String(body.leaveType ?? '').trim();
      const startDate = String(body.startDate ?? '').trim();
      const endDate = String(body.endDate ?? '').trim();
      const daysCount = Number(body.daysCount ?? 0);
      const reason = body.reason ? String(body.reason) : null;

      if (!employeeId || !leaveType || !startDate || !endDate || daysCount <= 0) {
        return error('Missing required fields for leave request', 400);
      }

      const id = crypto.randomUUID();
      const rows = await sql`
        INSERT INTO hr_leave_requests (
          id, tenant_id, employee_id, leave_type, start_date, end_date, days_count, reason, status
        ) VALUES (
          ${id}, ${auth.tenantId || DEMO_TENANT_ID}, ${employeeId}, ${leaveType}, ${startDate}, ${endDate}, ${daysCount}, ${reason}, 'pending'
        )
        RETURNING *
      ` as Record<string, any>[];

      await insertAuditLog({
        userId: auth.sub,
        userName: `${auth.firstName} ${auth.lastName}`,
        action: 'CREATE',
        entityType: 'leave_request',
        entityId: id,
        entityLabel: `Leave Request (${leaveType})`,
        details: `Created leave request for ${daysCount} days`,
      });

      const row = rows[0];
      return json({
        id: row.id,
        employeeId: row.employee_id,
        leaveType: row.leave_type,
        startDate: row.start_date,
        endDate: row.end_date,
        daysCount: row.days_count,
        reason: row.reason,
        status: row.status,
        approvedBy: row.approved_by,
        createdAt: row.created_at,
      }, 201);
    }

    return error('Method not allowed', 405);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Request failed';
    return error(message, 500);
  }
}
