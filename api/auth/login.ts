import { json, error, corsPreflight, parseBody, getSql } from '../_lib/db';
import { DEMO_USERS, DEMO_TENANT } from '../_lib/demo-users';
import { signAuthToken, verifyPassword, insertAuditLog } from '../_lib/auth';
import type { DbUser } from '../_lib/mappers';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return corsPreflight();
  if (req.method !== 'POST') return error('Method not allowed', 405);

  try {
    const body = await parseBody<{ email?: string; password?: string }>(req);
    const email = String(body.email ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');

    if (!email || !password) return error('Email and password are required', 400);

    let userRecord: any = null;
    let tenantRecord: any = DEMO_TENANT; // Default for demo

    // 1. Try to find the user in the database
    try {
      const sql = getSql();
      const users = await sql`SELECT * FROM users WHERE email = ${email}` as DbUser[];
      if (users.length > 0) {
        const u = users[0];
        userRecord = {
          id: u.id,
          tenantId: u.tenant_id,
          email: u.email,
          firstName: u.first_name,
          lastName: u.last_name || '',
          role: u.role,
        };
        
        // Fetch their tenant — required for DB users
        const tenants = await sql`SELECT * FROM tenants WHERE id = ${u.tenant_id}`;
        if (tenants.length > 0) {
          tenantRecord = tenants[0];
        } else {
          tenantRecord = null;
        }
      }
    } catch {
      // Ignore DB errors (e.g. table doesn't exist yet) and fallback to demo
    }

    // 2. Fallback to DEMO_USERS if not in DB
    if (!userRecord) {
      const cred = DEMO_USERS[email];
      if (!cred) return error('Invalid email or password', 401);
      userRecord = cred.user;
    }

    const valid = await verifyPassword(email, password);
    if (!valid) return error('Invalid email or password', 401);

    const token = await signAuthToken(userRecord);

    try {
      await insertAuditLog({
        tenantId: userRecord.tenantId,
        userId: userRecord.id,
        userName: `${userRecord.firstName} ${userRecord.lastName}`,
        action: 'LOGIN',
        entityType: 'user',
        entityId: userRecord.id,
        entityLabel: userRecord.email,
        details: 'User signed in',
      });
    } catch {
      /* login should succeed even if audit log table is unavailable */
    }

    return json({
      token,
      user: userRecord,
      tenant: tenantRecord,
    });
  } catch (e) {
    return error(e instanceof Error ? e.message : 'Login failed', 500);
  }
}
