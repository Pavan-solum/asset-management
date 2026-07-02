import { getSql, json, error, corsPreflight, parseBody } from '../_lib/db';
import { requireAuth, hashPassword, verifyPassword, insertAuditLog } from '../_lib/auth';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return corsPreflight();

  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;
  if (req.method !== 'POST') return error('Method not allowed', 405);

  try {
    const body = await parseBody<{ currentPassword?: string; newPassword?: string }>(req);
    const currentPassword = String(body.currentPassword ?? '');
    const newPassword = String(body.newPassword ?? '');

    if (!currentPassword || !newPassword) {
      return error('Current and new password are required', 400);
    }
    if (newPassword.length < 8) {
      return error('New password must be at least 8 characters', 400);
    }

    const email = String(auth.email ?? '').toLowerCase();

    const valid = await verifyPassword(email, currentPassword);
    if (!valid) return error('Current password is incorrect', 401);

    const sql = getSql();
    const passwordHash = await hashPassword(newPassword);
    try {
      await sql`
        INSERT INTO user_passwords (email, password_hash, updated_at)
        VALUES (${email}, ${passwordHash}, NOW())
        ON CONFLICT (email) DO UPDATE SET password_hash = ${passwordHash}, updated_at = NOW()
      `;
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      if (msg.includes('user_passwords')) {
        return error(
          'Password storage is not set up. Run database/supabase/003_user_passwords.sql in Neon, or run: node scripts/migrate-user-passwords.mjs',
          503,
        );
      }
      throw e;
    }

    await insertAuditLog({
      tenantId: auth.tenantId,
      userId: auth.sub,
      userName: `${auth.firstName} ${auth.lastName}`,
      action: 'UPDATE',
      entityType: 'user',
      entityId: auth.sub,
      entityLabel: email,
      details: 'Password changed',
    });

    return json({ success: true });
  } catch (e) {
    return error(e instanceof Error ? e.message : 'Password change failed', 500);
  }
}
