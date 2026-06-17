import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { getSql, error, DEMO_TENANT_ID } from './db';
import { DEMO_USERS } from './demo-users';

const secret = () =>
  new TextEncoder().encode(process.env.JWT_SECRET ?? 'assetly-dev-secret-change-in-production');

export interface AuthUser extends JWTPayload {
  sub: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  employeeId?: string;
}

export async function hashPassword(password: string): Promise<string> {
  const pepper = process.env.JWT_SECRET ?? 'assetly-dev-secret-change-in-production';
  const data = new TextEncoder().encode(`${password}:${pepper}`);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)));
}

export async function verifyPassword(email: string, password: string): Promise<boolean> {
  const normalized = email.toLowerCase();
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT password_hash FROM user_passwords WHERE email = ${normalized}
    ` as { password_hash: string }[];

    if (rows.length > 0) {
      return (await hashPassword(password)) === rows[0].password_hash;
    }
  } catch {
    /* user_passwords table may not exist yet — fall back to demo credentials */
  }

  const cred = DEMO_USERS[normalized];
  return Boolean(cred && cred.password === password);
}

export async function signAuthToken(user: {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  employeeId?: string;
}): Promise<string> {
  return new SignJWT({
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    ...(user.employeeId ? { employeeId: user.employeeId } : {}),
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(secret());
}

export async function verifyAuthToken(req: Request): Promise<AuthUser | null> {
  const header = req.headers.get('Authorization');
  if (!header?.startsWith('Bearer ')) return null;
  try {
    const { payload } = await jwtVerify(header.slice(7), secret());
    return payload as AuthUser;
  } catch {
    return null;
  }
}

export async function requireAuth(req: Request): Promise<AuthUser | Response> {
  const user = await verifyAuthToken(req);
  if (!user?.sub) return error('Unauthorized', 401);
  return user;
}

export function canReviewRequests(role: string | undefined): boolean {
  return role === 'tenant_admin' || role === 'it_admin';
}

export function isPublicApiRoute(pathname: string, method: string): boolean {
  if (pathname === '/api/health') return true;
  if (pathname === '/api/auth/login' && method === 'POST') return true;
  if (method === 'GET' && /^\/api\/assets\/[^/]+$/.test(pathname)) {
    const segment = pathname.split('/').pop();
    if (segment && segment !== 'import') return true;
  }
  return false;
}

export async function insertAuditLog(
  audit: {
    userId?: string;
    userName?: string;
    action: string;
    entityType?: string;
    entityId?: string;
    entityLabel?: string;
    details?: string;
  },
): Promise<void> {
  const sql = getSql();
  await sql`
    INSERT INTO audit_logs (tenant_id, user_id, user_name, action, entity_type, entity_id, entity_label, details)
    VALUES (
      ${DEMO_TENANT_ID},
      ${audit.userId ?? null},
      ${audit.userName ?? null},
      ${audit.action},
      ${audit.entityType ?? null},
      ${audit.entityId ?? null},
      ${audit.entityLabel ?? null},
      ${audit.details ?? null}
    )
  `;
}
