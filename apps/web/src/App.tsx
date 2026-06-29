import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { HRLayout } from './components/layout/HRLayout';
import { ExecDocsLayout } from './components/layout/ExecDocsLayout';
import { EmployeePortalLayout } from './components/layout/EmployeePortalLayout';
import { DataBootstrap } from './components/DataBootstrap';
import { GlobalLoadingBar } from './components/Loader';
import { ProtectedRoute, PublicRoute, AdminRoute, EmployeeRoute } from './components/ProtectedRoute';
import { LoginPage } from './features/auth/LoginPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { HRPage } from './features/hr/HRPage';
import { LandingPage } from './features/portal/LandingPage';
import { AssetsPage } from './features/assets/AssetsPage';
import { AssetDetailPage } from './features/assets/AssetDetailPage';
import { NewAssetPage } from './features/assets/NewAssetPage';
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
import { DeviceRequestPage } from './features/portal/DeviceRequestPage';
import { RequestsPage } from './features/requests/RequestsPage';
import { EndpointsPage } from './features/endpoints/EndpointsPage';
import { LifecyclePage } from './features/lifecycle/LifecyclePage';
import { FinancePage } from './features/finance/FinancePage';
import { SoftwarePage } from './features/software/SoftwarePage';
import { MaintenancePage } from './features/maintenance/MaintenancePage';
import { AnalyticsPage } from './features/analytics/AnalyticsPage';
import { MobilePage } from './features/mobile/MobilePage';
import { DashboardPage as ExeDocsDashboardPage } from './features/exe-docs/dashboard/DashboardPage';
import { LibraryPage } from './features/exe-docs/library/LibraryPage';
import { FinancePage as ExecDocsFinancePage } from './features/exe-docs/finance/FinancePage';
import { MeetingsPage } from './features/exe-docs/meetings/MeetingsPage';
import { CompliancePage } from './features/exe-docs/compliance/CompliancePage';

export default function App() {
  return (
    <>
      <GlobalLoadingBar />
      <DataBootstrap />
      <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route path="/" element={<LandingPage />} />
      <Route path="/lookup/:id" element={<AssetLookupPage />} />
      <Route
        element={
          <ProtectedRoute>
            <EmployeeRoute>
              <EmployeePortalLayout />
            </EmployeeRoute>
          </ProtectedRoute>
        }
      >
        <Route path="portal" element={<DeviceRequestPage />} />
      </Route>
      <Route path="/hr"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <HRLayout />
            </AdminRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<HRPage />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="employees/:id" element={<EmployeeDetailPage />} />
        <Route path="departments" element={<DepartmentsPage />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <AdminRoute>
              <AppLayout />
            </AdminRoute>
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="assets" element={<AssetsPage />} />
        <Route path="assets/new" element={<NewAssetPage />} />
        <Route path="assets/:id" element={<AssetDetailPage />} />
        <Route path="devices" element={<DevicesPage />} />
        <Route path="network-devices" element={<NetworkDevicesPage />} />
        <Route path="network-devices/:id" element={<NetworkDeviceDetailPage />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="employees/:id" element={<EmployeeDetailPage />} />
        <Route path="departments" element={<DepartmentsPage />} />
        <Route path="vendors" element={<VendorsPage />} />
        <Route path="requests" element={<RequestsPage />} />
        <Route path="endpoints" element={<EndpointsPage />} />
        <Route path="audit" element={<AuditPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="lifecycle" element={<LifecyclePage />} />
        <Route path="finance" element={<FinancePage />} />
        <Route path="software" element={<SoftwarePage />} />
        <Route path="maintenance" element={<MaintenancePage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="mobile" element={<MobilePage />} />
      </Route>

      <Route
        path="/exec-docs"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <ExecDocsLayout />
            </AdminRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<ExeDocsDashboardPage />} />
        <Route path="library" element={<LibraryPage />} />
        <Route path="finance" element={<ExecDocsFinancePage />} />
        <Route path="meetings" element={<MeetingsPage />} />
        <Route path="compliance" element={<CompliancePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}
