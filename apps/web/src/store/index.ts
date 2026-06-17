import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import assetsReducer from './assetsSlice';
import employeesReducer from './employeesSlice';
import departmentsReducer from './departmentsSlice';
import vendorsReducer from './vendorsSlice';
import auditReducer from './auditSlice';

import networkDevicesReducer from './networkDevicesSlice';
import uiReducer from './uiSlice';
import requestsReducer from './requestsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    assets: assetsReducer,
    employees: employeesReducer,
    departments: departmentsReducer,
    vendors: vendorsReducer,
    audit: auditReducer,
    networkDevices: networkDevicesReducer,
    ui: uiReducer,
    requests: requestsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
