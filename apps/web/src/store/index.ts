import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import assetsReducer from './assetsSlice';
import employeesReducer from './employeesSlice';
import departmentsReducer from './departmentsSlice';
import vendorsReducer from './vendorsSlice';
import hrReducer from './hrSlice';
import auditReducer from './auditSlice';

import networkDevicesReducer from './networkDevicesSlice';
import uiReducer from './uiSlice';
import requestsReducer from './requestsSlice';
import tenantsReducer from './tenantsSlice';
import usersReducer from './usersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    assets: assetsReducer,
    employees: employeesReducer,
    departments: departmentsReducer,
    vendors: vendorsReducer,
    hr: hrReducer,
    audit: auditReducer,
    networkDevices: networkDevicesReducer,
    ui: uiReducer,
    requests: requestsReducer,
    tenants: tenantsReducer,
    users: usersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
