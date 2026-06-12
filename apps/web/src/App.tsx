import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';
import { LoginPage } from './features/auth/LoginPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { AssetsPage } from './features/assets/AssetsPage';
import { AssetDetailPage } from './features/assets/AssetDetailPage';
import { AssetLookupPage } from './features/assets/AssetLookupPage';
import { EmployeesPage } from './features/employees/EmployeesPage';
import { EmployeeDetailPage } from './features/employees/EmployeeDetailPage';
import { DepartmentsPage } from './features/departments/DepartmentsPage';
import { VendorsPage } from './features/vendors/VendorsPage';
import { AuditPage } from './features/audit/AuditPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { DevicesPage } from './features/devices/DevicesPage';
import { NetworkDevicesPage } from './features/network/NetworkDevicesPage';
import { NetworkDeviceDetailPage } from './features/network/NetworkDeviceDetailPage';

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route path="/lookup/:id" element={<AssetLookupPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="assets" element={<AssetsPage />} />
        <Route path="assets/:id" element={<AssetDetailPage />} />
        <Route path="devices" element={<DevicesPage />} />
        <Route path="network-devices" element={<NetworkDevicesPage />} />
        <Route path="network-devices/:id" element={<NetworkDeviceDetailPage />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="employees/:id" element={<EmployeeDetailPage />} />
        <Route path="departments" element={<DepartmentsPage />} />
        <Route path="vendors" element={<VendorsPage />} />
        <Route path="audit" element={<AuditPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
