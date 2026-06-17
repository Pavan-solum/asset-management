import { getSql, json, error, corsPreflight, DEMO_TENANT_ID } from './_lib/db';
import {
  mapAsset,
  mapEmployee,
  mapDepartment,
  mapVendor,
  type DbAsset,
  type DbEmployee,
  type DbDepartment,
  type DbVendor,
} from './_lib/mappers';
import { requireAuth } from './_lib/auth';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return corsPreflight();

  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;
  if (req.method !== 'GET') return error('Method not allowed', 405);

  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get('q') ?? '').trim();
    if (q.length < 2) return json({ assets: [], employees: [], departments: [], vendors: [] });

    const pattern = `%${q}%`;
    const sql = getSql();

    const [assets, employees, departments, vendors] = await Promise.all([
      sql`
        SELECT * FROM assets
        WHERE tenant_id = ${DEMO_TENANT_ID}
          AND (
            asset_tag ILIKE ${pattern} OR name ILIKE ${pattern}
            OR serial_number ILIKE ${pattern} OR manufacturer ILIKE ${pattern}
            OR model ILIKE ${pattern} OR location ILIKE ${pattern}
          )
        ORDER BY created_at DESC LIMIT 10
      ` as Promise<DbAsset[]>,
      sql`
        SELECT * FROM employees
        WHERE tenant_id = ${DEMO_TENANT_ID}
          AND (
            first_name ILIKE ${pattern} OR last_name ILIKE ${pattern}
            OR email ILIKE ${pattern} OR employee_number ILIKE ${pattern}
            OR job_title ILIKE ${pattern}
          )
        ORDER BY created_at DESC LIMIT 10
      ` as Promise<DbEmployee[]>,
      sql`
        SELECT * FROM departments
        WHERE tenant_id = ${DEMO_TENANT_ID}
          AND (name ILIKE ${pattern} OR cost_center ILIKE ${pattern})
        ORDER BY name ASC LIMIT 5
      ` as Promise<DbDepartment[]>,
      sql`
        SELECT * FROM vendors
        WHERE tenant_id = ${DEMO_TENANT_ID}
          AND (name ILIKE ${pattern} OR contact_email ILIKE ${pattern})
        ORDER BY name ASC LIMIT 5
      ` as Promise<DbVendor[]>,
    ]);

    return json({
      assets: assets.map(mapAsset),
      employees: employees.map(mapEmployee),
      departments: departments.map(mapDepartment),
      vendors: vendors.map(mapVendor),
    });
  } catch (e) {
    return error(e instanceof Error ? e.message : 'Search failed', 500);
  }
}
