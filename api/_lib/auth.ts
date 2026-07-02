import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { getSql, error, DEMO_TENANT_ID } from './db';
import { DEMO_USERS } from './demo-users';

const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_PREFIX = 'pbkdf2v1:';

const secret = () =>
  new TextEncoder().encode(process.env.JWT_SECRET ?? 'assetly-dev-secret-change-in-production');

export interface AuthUser extends JWTPayload {
  sub: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  tenantId?: string;
  employeeId?: string;
}

export async function hashPassword(password: string): Promise<string> {
  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const saltHex = Array.from(saltBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: saltBytes, iterations: PBKDF2_ITERATIONS },
    keyMaterial,
    256,
  );
  const hashHex = Array.from(new Uint8Array(bits))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return `${PBKDF2_PREFIX}${saltHex}:${hashHex}`;
}

async function verifyPbkdf2Hash(password: string, stored: string): Promise<boolean> {
  const inner = stored.slice(PBKDF2_PREFIX.length);
  const colonIdx = inner.indexOf(':');
  if (colonIdx === -1) return false;
  const saltHex = inner.slice(0, colonIdx);
  const expectedHex = inner.slice(colonIdx + 1);
  const saltBytes = new Uint8Array(
    (saltHex.match(/.{2}/g) ?? []).map(b => parseInt(b, 16)),
  );
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: saltBytes, iterations: PBKDF2_ITERATIONS },
    keyMaterial,
    256,
  );
  const hashHex = Array.from(new Uint8Array(bits))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return hashHex === expectedHex;
}

async function legacySha256Hash(password: string): Promise<string> {
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
      const stored = rows[0].password_hash;
      if (stored.startsWith(PBKDF2_PREFIX)) {
        return verifyPbkdf2Hash(password, stored);
      }
      // Legacy SHA-256 hash — auto-upgrade on next password change
      return (await legacySha256Hash(password)) === stored;
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
  tenantId?: string;
  employeeId?: string;
}): Promise<string> {
  return new SignJWT({
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    ...(user.tenantId ? { tenantId: user.tenantId } : {}),
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
    tenantId?: string;
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
  const tenantId = audit.tenantId ?? DEMO_TENANT_ID;
  await sql`
    INSERT INTO audit_logs (tenant_id, user_id, user_name, action, entity_type, entity_id, entity_label, details)
    VALUES (
      ${tenantId},
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
