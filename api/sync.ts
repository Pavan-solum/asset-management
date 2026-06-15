import { getSql, json, error, corsPreflight, DEMO_TENANT_ID } from './_lib/db';
import {
  mapAsset,
  mapEmployee,
  mapDepartment,
  mapVendor,
  mapAssignment,
  mapOwnershipEvent,
  mapAuditLog,
  type DbAsset,
  type DbEmployee,
  type DbDepartment,
  type DbVendor,
  type DbAssignment,
  type DbOwnershipEvent,
  type DbAuditLog,
} from './_lib/mappers';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return corsPreflight();
  if (req.method !== 'GET') return error('Method not allowed', 405);

  try {
    const sql = getSql();

    const [assets, employees, departments, vendors, assignments, ownershipHistory, auditLogs] =
      (await Promise.all([
        sql`SELECT * FROM assets WHERE tenant_id = ${DEMO_TENANT_ID} ORDER BY created_at DESC`,
        sql`SELECT * FROM employees WHERE tenant_id = ${DEMO_TENANT_ID} ORDER BY created_at DESC`,
        sql`SELECT * FROM departments WHERE tenant_id = ${DEMO_TENANT_ID} ORDER BY name ASC`,
        sql`SELECT * FROM vendors WHERE tenant_id = ${DEMO_TENANT_ID} ORDER BY name ASC`,
        sql`SELECT * FROM asset_assignments WHERE tenant_id = ${DEMO_TENANT_ID} ORDER BY assigned_at DESC`,
        sql`SELECT * FROM ownership_history WHERE tenant_id = ${DEMO_TENANT_ID} ORDER BY created_at DESC`,
        sql`SELECT * FROM audit_logs WHERE tenant_id = ${DEMO_TENANT_ID} ORDER BY created_at DESC LIMIT 200`,
      ])) as [
        DbAsset[],
        DbEmployee[],
        DbDepartment[],
        DbVendor[],
        DbAssignment[],
        DbOwnershipEvent[],
        DbAuditLog[],
      ];

    return json({
      assets: assets.map(mapAsset),
      employees: employees.map(mapEmployee),
      departments: departments.map(mapDepartment),
      vendors: vendors.map(mapVendor),
      assignments: assignments.map(mapAssignment),
      ownershipHistory: ownershipHistory.map(mapOwnershipEvent),
      auditLogs: auditLogs.map(mapAuditLog),
    });
  } catch (e) {
    return error(e instanceof Error ? e.message : 'Sync failed', 500);
  }
}
