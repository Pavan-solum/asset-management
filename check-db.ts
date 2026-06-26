import { neon } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const sql = neon(url);
const DEMO_TENANT_ID = '11111111-1111-1111-1111-111111111111';
const employeeId = '44444444-4444-4444-4444-444444444401';

async function main() {
  try {
    const rawRequests = await sql`SELECT * FROM asset_requests WHERE employee_id = ${employeeId}`;
    console.log('--- RAW REQUESTS FOR EMP ---');
    console.log(JSON.stringify(rawRequests, null, 2));

    const rows = await sql`
      SELECT
        r.*,
        e.first_name AS employee_first_name,
        e.last_name AS employee_last_name,
        e.email AS employee_email,
        d.name AS department_name
      FROM asset_requests r
      JOIN employees e ON e.id = r.employee_id
      LEFT JOIN departments d ON d.id = e.department_id
      WHERE r.tenant_id = ${DEMO_TENANT_ID} AND r.employee_id = ${employeeId}
      ORDER BY r.created_at DESC
    `;

    console.log('--- QUERY ROWS ---');
    console.log(JSON.stringify(rows, null, 2));
  } catch (error) {
    console.error('Error querying DB:', error);
  }
}

main();
