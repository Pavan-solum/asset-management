import { getTenantSql, json, error, corsPreflight, parseBody, DEMO_TENANT_ID } from '../_lib/db';
import { mapEmployee, type DbEmployee } from '../_lib/mappers';
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
        SELECT * FROM employees WHERE tenant_id = ${auth.tenantId || DEMO_TENANT_ID} ORDER BY created_at DESC
      ` as DbEmployee[];
      return json(rows.map(mapEmployee));
    }

    if (req.method === 'POST') {
      const body = await parseBody<Record<string, unknown>>(req);
      const firstName = String(body.firstName ?? '').trim();
      const lastName = String(body.lastName ?? '').trim();
      const email = String(body.email ?? '').trim().toLowerCase();
      if (!firstName || !lastName || !email) {
        return error('firstName, lastName, and email are required', 400);
      }

      const id = body.id && String(body.id) ? String(body.id) : crypto.randomUUID();
      const rows = await sql`
        INSERT INTO employees (
          id, tenant_id, employee_number, first_name, last_name, email,
          job_title, department_id, status, hire_date
        ) VALUES (
          ${id}, ${auth.tenantId || DEMO_TENANT_ID},
          ${body.employeeNumber ? String(body.employeeNumber) : null},
          ${firstName}, ${lastName}, ${email},
          ${body.jobTitle ? String(body.jobTitle) : null},
          ${body.departmentId ? String(body.departmentId) : null},
          ${body.status ? String(body.status) : 'active'},
          ${body.hireDate ? String(body.hireDate) : null}
        )
        RETURNING *
      ` as DbEmployee[];

      await insertAuditLog({
        userId: auth.sub,
        userName: `${auth.firstName} ${auth.lastName}`,
        action: 'CREATE',
        entityType: 'employee',
        entityId: id,
        entityLabel: `${firstName} ${lastName}`,
        details: `Created employee ${email}`,
      });

      return json(mapEmployee(rows[0]), 201);
    }

    return error('Method not allowed', 405);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Request failed';
    if (message.includes('unique') || message.includes('duplicate')) {
      return error('Employee email already exists', 409);
    }
    return error(message, 500);
  }
}
