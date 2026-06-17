import { DEMO_USERS } from '../data/demoData';
import type { User, UserRole } from '../types';

const ROLE_LABELS: Record<UserRole, string> = {
  tenant_admin: 'Tenant Admin',
  it_admin: 'IT Admin',
  viewer: 'Viewer',
  employee: 'Employee',
};

/** Apply demo account profile from demoData when logging in via API. */
export function resolveDemoUser(user: User): User {
  const cred = DEMO_USERS[user.email.toLowerCase()];
  if (!cred) return user;
  return {
    ...user,
    firstName: cred.user.firstName,
    lastName: cred.user.lastName,
    role: cred.user.role,
    employeeId: cred.user.employeeId,
  };
}

export function getUserDisplayName(user: Pick<User, 'firstName' | 'lastName'> | null | undefined): string {
  if (!user) return '';
  return [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
}

export function getUserInitials(user: Pick<User, 'firstName' | 'lastName'> | null | undefined): string {
  if (!user) return '?';
  const first = user.firstName?.trim() ?? '';
  const last = user.lastName?.trim() ?? '';
  if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
  if (first.length >= 2) return first.slice(0, 2).toUpperCase();
  return first[0]?.toUpperCase() ?? '?';
}

export function getRoleLabel(role: UserRole | undefined): string {
  if (!role) return '';
  return ROLE_LABELS[role] ?? role.replace(/_/g, ' ');
}
