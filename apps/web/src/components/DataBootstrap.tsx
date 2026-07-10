import { useEffect, useRef, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../hooks/storeHooks';
import { isApiEnabled } from '../services/api/config';
import { checkApiHealth, ApiError } from '../services/api/client';
import { fetchSync, importInventory as importInventoryApi } from '../services/api/assets';
import { importInventory as setInventory } from '../store/assetsSlice';
import { replaceAllEmployees } from '../store/employeesSlice';
import { replaceAllDepartments } from '../store/departmentsSlice';
import { replaceAllVendors } from '../store/vendorsSlice';
import { replaceAllAuditLogs } from '../store/auditSlice';
import { replaceAllRequests } from '../store/requestsSlice';
import { replaceAllNetworkDevices } from '../store/networkDevicesSlice';
import { fetchAssetRequests } from '../services/api/requests';
import { setBootstrapReady, startLoading, stopLoading } from '../store/uiSlice';
import {
  generateDemoAssets,
  generateDemoAssignments,
  generateDemoOwnershipHistory,
  generateDemoNetworkDevices,
  DEMO_EMPLOYEES,
  DEMO_DEPARTMENTS,
  DEMO_VENDORS,
  DEMO_AUDIT_LOGS,
  DEMO_ASSET_REQUESTS,
} from '../data/demoData';
import type { AppDispatch } from '../store';

function hydrateFromSync(dispatch: AppDispatch, data: Awaited<ReturnType<typeof fetchSync>>) {
  dispatch(
    setInventory({
      items: data.assets,
      assignments: data.assignments,
      ownershipHistory: data.ownershipHistory,
    }),
  );
  dispatch(replaceAllEmployees(data.employees));
  dispatch(replaceAllDepartments(data.departments));
  dispatch(replaceAllVendors(data.vendors));
  dispatch(replaceAllAuditLogs(data.auditLogs));
}

export async function reloadFromApi(dispatch: AppDispatch): Promise<void> {
  dispatch(startLoading('Refreshing data…'));
  try {
    const data = await fetchSync();
    hydrateFromSync(dispatch, data);
  } finally {
    dispatch(stopLoading());
  }
}

function seedDemoData(dispatch: AppDispatch) {
  const assets = generateDemoAssets();
  const assignments = generateDemoAssignments(assets);
  const ownershipHistory = generateDemoOwnershipHistory(assets);
  dispatch(setInventory({ items: assets, assignments, ownershipHistory }));
  dispatch(replaceAllEmployees(DEMO_EMPLOYEES));
  dispatch(replaceAllDepartments(DEMO_DEPARTMENTS));
  dispatch(replaceAllVendors(DEMO_VENDORS));
  dispatch(replaceAllAuditLogs(DEMO_AUDIT_LOGS));
  dispatch(replaceAllRequests(DEMO_ASSET_REQUESTS));
  dispatch(replaceAllNetworkDevices(generateDemoNetworkDevices()));
}

export function DataBootstrap() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const role = useAppSelector((s) => s.auth.user?.role);
  const assetsCount = useAppSelector((s) => s.assets.items.length);
  const syncedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const isEmployee = role === 'employee';

  // Seed demo data in non-API mode when logged in and store is empty
  useEffect(() => {
    if (!isApiEnabled() && isAuthenticated && !syncedRef.current && assetsCount === 0) {
      seedDemoData(dispatch);
      syncedRef.current = true;
    }
  }, [dispatch, isAuthenticated, assetsCount]);

  useEffect(() => {
    if (!isAuthenticated) {
      syncedRef.current = false;
      dispatch(setBootstrapReady(!isApiEnabled()));
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (!isApiEnabled() || !isAuthenticated || syncedRef.current) return;

    if (isEmployee) {
      dispatch(setBootstrapReady(true));
      syncedRef.current = true;
      return;
    }

    let cancelled = false;

    (async () => {
      dispatch(setBootstrapReady(false));
      dispatch(startLoading('Loading your workspace…'));
      try {
        const health = await checkApiHealth();
        if (!health.ok) {
          setError(health.message ?? 'Backend unavailable.');
          return;
        }

        const data = await fetchSync();
        if (cancelled) return;

        hydrateFromSync(dispatch, data);

        if (role === 'tenant_admin' || role === 'it_admin') {
          try {
            const requests = await fetchAssetRequests();
            if (!cancelled) dispatch(replaceAllRequests(requests));
          } catch {
            /* requests load is non-blocking */
          }
        }

        syncedRef.current = true;
      } catch (e) {
        const msg = e instanceof ApiError ? e.message : 'Failed to load data from server';
        setError(msg);
      } finally {
        dispatch(stopLoading());
        if (!cancelled) {
          dispatch(setBootstrapReady(true));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [dispatch, isAuthenticated, isEmployee, role]);

  if (!isApiEnabled()) return null;

  return (
    <>
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={8000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="warning" onClose={() => setError(null)} variant="filled">
          {error}
        </Alert>
      </Snackbar>
    </>
  );
}

export { importInventoryApi, fetchSync };
export { createAsset } from '../services/api/assets';
