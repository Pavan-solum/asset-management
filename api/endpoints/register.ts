import { getSql, json, error, corsPreflight } from '../_lib/db';

export const config = { runtime: 'edge' };

/** Validate agent registration requests using a shared secret set via AGENT_SECRET env var. */
function verifyAgentToken(req: Request): boolean {
  const secret = process.env.AGENT_SECRET;
  if (!secret) return true; // Not configured — allow in dev, set AGENT_SECRET in prod
  return req.headers.get('X-Agent-Token') === secret;
}

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return corsPreflight();
  if (req.method !== 'POST') return error('Method not allowed', 405);

  if (!verifyAgentToken(req)) return error('Unauthorized', 401);

  try {
    const body = await req.json() as any;
    const { tenant_id, hostname, os_version, ip_address, mac_address, cpu_model, ram_total_gb, storage_total_gb, windows_updates, installed_apps } = body;

    if (!tenant_id || !hostname) {
      return error('tenant_id and hostname are required', 400);
    }

    const sql = getSql();
    
    // Check if endpoint exists
    const [existing] = await sql`
      SELECT id FROM endpoints 
      WHERE tenant_id = ${tenant_id} AND mac_address = ${mac_address}
      LIMIT 1
    `;

    let endpointId;

    if (existing) {
      // Update existing
      await sql`
        UPDATE endpoints 
        SET 
          hostname = ${hostname},
          os_version = ${os_version},
          ip_address = ${ip_address},
          last_seen_at = CURRENT_TIMESTAMP,
          status = 'active',
          cpu_model = ${cpu_model || null},
          ram_total_gb = ${ram_total_gb || null},
          storage_total_gb = ${storage_total_gb || null},
          windows_updates = ${windows_updates ? JSON.stringify(windows_updates) : null}
        WHERE id = ${existing.id}
      `;
      endpointId = existing.id;
    } else {
      // Insert new
      const [inserted] = await sql`
        INSERT INTO endpoints (
          tenant_id, hostname, os_version, ip_address, mac_address, status, last_seen_at, cpu_model, ram_total_gb, storage_total_gb, windows_updates
        )
        VALUES (
          ${tenant_id}, ${hostname}, ${os_version}, ${ip_address}, ${mac_address}, 'active', NOW(), ${cpu_model || null}, ${ram_total_gb || null}, ${storage_total_gb || null}, ${windows_updates ? JSON.stringify(windows_updates) : null}
        )
        RETURNING id
      `;
      endpointId = inserted.id;
    }

    if (Array.isArray(installed_apps)) {
      await sql`DELETE FROM endpoint_installed_apps WHERE endpoint_id = ${endpointId}`;
      if (installed_apps.length > 0) {
        for (const a of installed_apps) {
          try {
            await sql`
              INSERT INTO endpoint_installed_apps (endpoint_id, app_name, version, publisher, install_date, cve_count, cve_ids)
              VALUES (${endpointId}, ${a.app_name}, ${a.version}, ${a.publisher}, ${a.install_date}, ${a.cve_count}, ARRAY[]::TEXT[])
            `;
          } catch(e) {}
        }
      }
    }

    return json({ status: 'success', endpoint: { id: endpointId } });
  } catch (e) {
    console.error('Registration API error:', e);
    return error(e instanceof Error ? e.message : 'Registration failed', 500);
  }
}
