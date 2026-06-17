import { json, error, corsPreflight, parseBody } from '../_lib/db';
import { DEMO_USERS, DEMO_TENANT } from '../_lib/demo-users';
import { signAuthToken, verifyPassword, insertAuditLog } from '../_lib/auth';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return corsPreflight();
  if (req.method !== 'POST') return error('Method not allowed', 405);

  try {
    const body = await parseBody<{ email?: string; password?: string }>(req);
    const email = String(body.email ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');

    if (!email || !password) return error('Email and password are required', 400);

    const cred = DEMO_USERS[email];
    if (!cred) return error('Invalid email or password', 401);

    const valid = await verifyPassword(email, password);
    if (!valid) return error('Invalid email or password', 401);

    const token = await signAuthToken(cred.user);

    try {
      await insertAuditLog({
        userId: cred.user.id,
        userName: `${cred.user.firstName} ${cred.user.lastName}`,
        action: 'LOGIN',
        entityType: 'user',
        entityId: cred.user.id,
        entityLabel: cred.user.email,
        details: 'User signed in',
      });
    } catch {
      /* login should succeed even if audit log table is unavailable */
    }

    return json({
      token,
      user: cred.user,
      tenant: DEMO_TENANT,
    });
  } catch (e) {
    return error(e instanceof Error ? e.message : 'Login failed', 500);
  }
}
