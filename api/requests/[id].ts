import { getSql, json, error, corsPreflight, parseBody, DEMO_TENANT_ID } from '../_lib/db';
import { mapAssetRequest, type DbAssetRequest } from '../_lib/mappers';
import { requireAuth, canReviewRequests, insertAuditLog } from '../_lib/auth';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return corsPreflight();

  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  if (!canReviewRequests(auth.role)) {
    return error('Forbidden', 403);
  }

  const url = new URL(req.url);
  const parts = url.pathname.split('/').filter(Boolean);
  const id = parts[parts.length - 1];
  if (!id || id === 'requests') return error('Request id is required', 400);

  const sql = getSql();

  try {
    if (req.method === 'PATCH') {
      const body = await parseBody<{ status?: string; reviewNotes?: string }>(req);
      const status = String(body.status ?? '').trim();
      const reviewNotes = body.reviewNotes ? String(body.reviewNotes).trim() : null;

      if (!['approved', 'rejected', 'fulfilled'].includes(status)) {
        return error('status must be approved, rejected, or fulfilled', 400);
      }

      const existing = (await sql`
        SELECT
          r.*,
          e.first_name AS employee_first_name,
          e.last_name AS employee_last_name,
          e.email AS employee_email,
          d.name AS department_name
        FROM asset_requests r
        JOIN employees e ON e.id = r.employee_id
        LEFT JOIN departments d ON d.id = e.department_id
        WHERE r.tenant_id = ${DEMO_TENANT_ID} AND r.id = ${id}
      `) as DbAssetRequest[];

      if (existing.length === 0) return error('Request not found', 404);

      const current = existing[0];
      if (current.status !== 'submitted' && status !== 'fulfilled') {
        return error('Only submitted requests can be approved or rejected', 409);
      }
      if (current.status !== 'approved' && status === 'fulfilled') {
        return error('Only approved requests can be marked fulfilled', 409);
      }

      const reviewer = `${auth.firstName} ${auth.lastName}`;
      const rows = (await sql`
        UPDATE asset_requests
        SET
          status = ${status},
          review_notes = ${reviewNotes},
          reviewed_by = ${reviewer},
          reviewed_at = NOW()
        WHERE tenant_id = ${DEMO_TENANT_ID} AND id = ${id}
        RETURNING *
      `) as DbAssetRequest[];

      const updated = {
        ...rows[0],
        employee_first_name: current.employee_first_name,
        employee_last_name: current.employee_last_name,
        employee_email: current.employee_email,
        department_name: current.department_name,
      };

      try {
        await insertAuditLog({
          userId: auth.sub,
          userName: reviewer,
          action: 'UPDATE',
          entityType: 'asset_request',
          entityId: id,
          entityLabel: `${current.request_type} — ${current.category}`,
          details: `Status changed to ${status}${reviewNotes ? `: ${reviewNotes}` : ''}`,
        });
      } catch {
        /* non-blocking */
      }

      return json(mapAssetRequest(updated));
    }

    return error('Method not allowed', 405);
  } catch (e) {
    return error(e instanceof Error ? e.message : 'Request failed', 500);
  }
}
