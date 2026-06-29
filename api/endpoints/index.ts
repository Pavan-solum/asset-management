import { getSql, json, error, corsPreflight, DEMO_TENANT_ID } from '../_lib/db';
import { requireAuth } from '../_lib/auth';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return corsPreflight();
  if (req.method !== 'GET') return error('Method not allowed', 405);

  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  try {
    const sql = getSql();
    const endpoints = await sql`
      SELECT id, hostname, os_version, ip_address, mac_address, status, last_seen_at,
             cpu_model, ram_total_gb, storage_total_gb, windows_updates,
             firewall_status, defender_status, antivirus_updated_at, active_ports
      FROM endpoints
      WHERE tenant_id = ${DEMO_TENANT_ID}
      ORDER BY last_seen_at DESC
    `;

    return json({ endpoints });
  } catch (e) {
    return error(e instanceof Error ? e.message : 'Failed to fetch endpoints', 500);
  }
}
