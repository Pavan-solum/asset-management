import { getTenantSql, json, error, corsPreflight, parseBody, DEMO_TENANT_ID } from '../_lib/db';
import { mapEmployee, type DbEmployee } from '../_lib/mappers';
import { requireAuth, insertAuditLog } from '../_lib/auth';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return corsPreflight();

  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const url = new URL(req.url);
  const id = url.pathname.split('/').filter(Boolean).pop();
  if (!id || id === 'employees') return error('Employee id required', 400);

  const sql = await getTenantSql(auth.tenantId || DEMO_TENANT_ID);

  try {
    if (req.method === 'GET') {
      const rows = await sql`
        SELECT * FROM employees WHERE id = ${id} AND tenant_id = ${auth.tenantId || DEMO_TENANT_ID}
      ` as DbEmployee[];
      if (rows.length === 0) return error('Employee not found', 404);
      return json(mapEmployee(rows[0]));
    }

    if (req.method === 'PATCH') {
      const body = await parseBody<Record<string, unknown>>(req);
      const rows = await sql`
        UPDATE employees SET
          employee_number = COALESCE(${body.employeeNumber != null ? String(body.employeeNumber) : null}, employee_number),
          first_name = COALESCE(${body.firstName ? String(body.firstName) : null}, first_name),
          last_name = COALESCE(${body.lastName ? String(body.lastName) : null}, last_name),
          email = COALESCE(${body.email ? String(body.email).toLowerCase() : null}, email),
          job_title = COALESCE(${body.jobTitle != null ? String(body.jobTitle) : null}, job_title),
          department_id = COALESCE(${
            body.departmentId !== undefined
              ? body.departmentId
                ? String(body.departmentId)
                : null
              : null
          }, department_id),
          status = COALESCE(${body.status ? String(body.status) : null}, status),
          hire_date = COALESCE(${body.hireDate != null ? String(body.hireDate) : null}, hire_date)
        WHERE id = ${id} AND tenant_id = ${auth.tenantId || DEMO_TENANT_ID}
        RETURNING *
      ` as DbEmployee[];
      if (rows.length === 0) return error('Employee not found', 404);

      const emp = mapEmployee(rows[0]);
      await insertAuditLog({
        userId: auth.sub,
        userName: `${auth.firstName} ${auth.lastName}`,
        action: 'UPDATE',
        entityType: 'employee',
        entityId: id,
        entityLabel: `${emp.firstName} ${emp.lastName}`,
        details: 'Employee updated',
      });
      return json(emp);
    }

    if (req.method === 'DELETE') {
      await sql`DELETE FROM employees WHERE id = ${id} AND tenant_id = ${auth.tenantId || DEMO_TENANT_ID}`;
      await insertAuditLog({
        userId: auth.sub,
        userName: `${auth.firstName} ${auth.lastName}`,
        action: 'DELETE',
        entityType: 'employee',
        entityId: id,
        entityLabel: id,
        details: 'Employee deleted',
      });
      return json({ success: true });
    }

    return error('Method not allowed', 405);
  } catch (e) {
    return error(e instanceof Error ? e.message : 'Request failed', 500);
  }
}
