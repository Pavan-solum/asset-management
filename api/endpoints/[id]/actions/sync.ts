import { getSql, json, error, corsPreflight, DEMO_TENANT_ID } from '../../../_lib/db';
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

    const sql = getSql();
    const [inserted] = await sql`
      INSERT INTO endpoint_commands (endpoint_id, command, status)
      VALUES (${id}, 'sync', 'pending')
      RETURNING id, created_at
    `;

    return json({
      job_id: inserted.id,
      status: 'queued',
      sync_requested_at: inserted.created_at
    });
  } catch (e) {
    return error(e instanceof Error ? e.message : 'Failed to request sync', 500);
  }
}
