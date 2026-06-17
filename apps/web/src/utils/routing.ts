import type { UserRole } from '../types';

export function isEmployeeRole(role: UserRole | undefined): boolean {
  return role === 'employee';
}

export function getHomeRouteForRole(role: UserRole | undefined): string {
  return isEmployeeRole(role) ? '/portal' : '/';
}
