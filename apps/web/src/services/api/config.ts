/** API base URL — empty string = same origin (/api on Vercel) */
export const API_BASE = import.meta.env.VITE_API_URL ?? '';

/** When true, app loads/saves data via Postgres backend (Neon/Supabase) */
export function isApiEnabled(): boolean {
  return import.meta.env.VITE_USE_API === 'true';
}

export function apiUrl(path: string): string {
  const base = API_BASE.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}
