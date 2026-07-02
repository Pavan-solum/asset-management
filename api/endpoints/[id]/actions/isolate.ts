import { getTenantSql, json, error, corsPreflight, DEMO_TENANT_ID } from '../../../_lib/db';
import { requireAuth } from '../../../_lib/auth';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return corsPreflight();
  if (req.method !== 'POST') return error('Method not allowed', 405);

  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.indexOf('endpoints') + 1];

    if (!id) return error('Endpoint ID is required', 400);

    const sql = await getTenantSql(tenantId);
    const tenantId = auth.tenantId || DEMO_TENANT_ID;

    // Verify the endpoint belongs to this tenant before queuing a command
    const [ep] = await sql`SELECT id FROM endpoints WHERE id = ${id} AND tenant_id = ${tenantId} LIMIT 1`;
    if (!ep) return error('Endpoint not found', 404);

    const [inserted] = await sql`
      INSERT INTO endpoint_commands (endpoint_id, command, status)
      VALUES (${id}, 'isolate', 'pending')
      RETURNING id, created_at
    `;

    return json({
      job_id: inserted.id,
      status: 'queued',
      isolation_status: 'isolated',
      isolated_at: inserted.created_at
    });
  } catch (e) {
    return error(e instanceof Error ? e.message : 'Failed to isolate device', 500);
  }
}
