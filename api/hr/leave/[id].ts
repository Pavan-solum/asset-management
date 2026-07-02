import { getTenantSql, json, error, corsPreflight, parseBody, DEMO_TENANT_ID } from '../../_lib/db';
import { requireAuth, insertAuditLog } from '../../_lib/auth';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return corsPreflight();

  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const url = new URL(req.url);
  const segments = url.pathname.split('/');
  const id = segments[segments.length - 1];
  if (!id || id === 'leave') return error('ID required', 400);

  const sql = await getTenantSql(auth.tenantId || DEMO_TENANT_ID);

  try {
    if (req.method === 'PUT') {
      const body = await parseBody<Record<string, unknown>>(req);
      const status = String(body.status ?? '').trim();
      
      if (!['approved', 'rejected'].includes(status)) {
        return error('Invalid status update', 400);
      }

      const rows = await sql`
        UPDATE hr_leave_requests
        SET status = ${status}, approved_by = ${auth.sub}, updated_at = NOW()
        WHERE id = ${id} AND tenant_id = ${auth.tenantId || DEMO_TENANT_ID}
        RETURNING *
      ` as Record<string, any>[];

      if (rows.length === 0) return error('Not found', 404);

      await insertAuditLog({
        userId: auth.sub,
        userName: `${auth.firstName} ${auth.lastName}`,
        action: 'UPDATE',
        entityType: 'leave_request',
        entityId: id,
        entityLabel: `Leave Request Status`,
        details: `Marked leave request as ${status}`,
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
      });
    }

    if (req.method === 'DELETE') {
      const rows = await sql`
        UPDATE hr_leave_requests
        SET deleted_at = NOW(), updated_at = NOW()
        WHERE id = ${id} AND tenant_id = ${auth.tenantId || DEMO_TENANT_ID}
        RETURNING *
      ` as Record<string, any>[];

      if (rows.length === 0) return error('Not found', 404);

      await insertAuditLog({
        userId: auth.sub,
        userName: `${auth.firstName} ${auth.lastName}`,
        action: 'DELETE',
        entityType: 'leave_request',
        entityId: id,
        details: 'Deleted leave request',
      });

      return json({ success: true });
    }

    return error('Method not allowed', 405);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Request failed';
    return error(message, 500);
  }
}
