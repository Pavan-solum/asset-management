import { getTenantSql, json, error, corsPreflight, DEMO_TENANT_ID } from '../../_lib/db';
import { requireAuth } from '../../_lib/auth';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return corsPreflight();
  if (req.method !== 'GET') return error('Method not allowed', 405);

  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.indexOf('endpoints') + 1];

    if (!id) return error('Endpoint ID is required', 400);

    const vulnerableParam = url.searchParams.get('vulnerable');
    const sql = await getTenantSql(tenantId);
    const tenantId = auth.tenantId || DEMO_TENANT_ID;

    // Verify the endpoint belongs to this tenant
    const [ep] = await sql`SELECT id FROM endpoints WHERE id = ${id} AND tenant_id = ${tenantId} LIMIT 1`;
    if (!ep) return error('Endpoint not found', 404);

    let apps;
    if (vulnerableParam === 'true') {
      apps = await sql`
        SELECT id, app_name, version, publisher, install_date, cve_count, cve_ids
        FROM endpoint_installed_apps
        WHERE endpoint_id = ${id} AND cve_count > 0
        ORDER BY app_name ASC
      `;
    } else {
      apps = await sql`
        SELECT id, app_name, version, publisher, install_date, cve_count, cve_ids
        FROM endpoint_installed_apps
        WHERE endpoint_id = ${id}
        ORDER BY app_name ASC
      `;
    }

    return json({ apps });
  } catch (e) {
    return error(e instanceof Error ? e.message : 'Failed to fetch installed apps', 500);
  }
}
