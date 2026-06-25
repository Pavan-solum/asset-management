import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const envStr = readFileSync(resolve(process.cwd(), '.env'), 'utf-8');
for (const line of envStr.split('\n')) {
  if (line.trim() && !line.startsWith('#') && line.includes('=')) {
    const [k, ...v] = line.split('=');
    process.env[k.trim()] = v.join('=').trim();
  }
}

async function run() {
  const sql = neon(process.env.DATABASE_URL);
  const DEMO_TENANT_ID = '11111111-1111-1111-1111-111111111111';
  const rows = await sql`
      SELECT *
      FROM endpoints
      WHERE tenant_id = ${DEMO_TENANT_ID}
      ORDER BY last_seen_at DESC
  `;
  console.log(rows);
}
run();
