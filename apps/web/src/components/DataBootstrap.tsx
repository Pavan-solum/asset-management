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
  const data = await fetchSync();
  hydrateFromSync(dispatch, data);
}

export function DataBootstrap() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const syncedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(!isApiEnabled());

  useEffect(() => {
    if (!isApiEnabled() || !isAuthenticated || syncedRef.current) return;

    let cancelled = false;

    (async () => {
      try {
        const healthy = await checkApiHealth();
        if (!healthy) {
          setError('Backend unavailable. Check DATABASE_URL and run database migrations.');
          setReady(true);
          return;
        }

        const data = await fetchSync();
        if (cancelled) return;

        hydrateFromSync(dispatch, data);
        syncedRef.current = true;
        setReady(true);
      } catch (e) {
        const msg = e instanceof ApiError ? e.message : 'Failed to load data from server';
        setError(msg);
        setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [dispatch, isAuthenticated]);

  if (!isApiEnabled()) return null;

  return (
    <>
      {!ready && (
        <Snackbar open anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert severity="info" variant="filled" sx={{ width: '100%' }}>
            Loading data from database…
          </Alert>
        </Snackbar>
      )}
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
