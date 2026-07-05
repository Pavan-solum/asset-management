import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { HRLayout } from './components/layout/HRLayout';
import { ExecDocsLayout } from './components/layout/ExecDocsLayout';
import { EmployeePortalLayout } from './components/layout/EmployeePortalLayout';
import { DataBootstrap } from './components/DataBootstrap';
import { GlobalLoadingBar } from './components/Loader';
import { ProtectedRoute, PublicRoute, AdminRoute, EmployeeRoute, SystemAdminRoute, ModuleRoute } from './components/ProtectedRoute';
import { LoginPage } from './features/auth/LoginPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { HRPage } from './features/hr/HRPage';
import { LeavesPage } from './features/hr/leaves/LeavesPage';
import { AttendancePage } from './features/hr/attendance/AttendancePage';
import { OnboardingPage } from './features/hr/onboarding/OnboardingPage';
import { PerformancePage } from './features/hr/performance/PerformancePage';
import { HRPoliciesPage } from './features/hr/policies/HRPoliciesPage';
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
import { SystemAdminLayout } from './components/layout/SystemAdminLayout';
import { OrganizationsPage } from './features/system-admin/OrganizationsPage';
import { CreateOrganizationPage } from './features/system-admin/CreateOrganizationPage';
import { EditOrganizationPage } from './features/system-admin/EditOrganizationPage';
import { SystemAdminUsersPage } from './features/system-admin/SystemAdminUsersPage';
import { CreateUserPage } from './features/system-admin/CreateUserPage';
import { EditUserPage } from './features/system-admin/EditUserPage';
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
              <ModuleRoute module="module:hr">
                <HRLayout />
              </ModuleRoute>
            </AdminRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<HRPage />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="employees/:id" element={<EmployeeDetailPage />} />
        <Route path="departments" element={<DepartmentsPage />} />
        <Route path="leaves" element={<LeavesPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="onboarding" element={<OnboardingPage />} />
        <Route path="performance" element={<PerformancePage />} />
        <Route path="policies" element={<HRPoliciesPage />} />
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
        
        {/* Assets & IT Module */}
        <Route path="assets" element={<ModuleRoute module="module:assets"><AssetsPage /></ModuleRoute>} />
        <Route path="assets/new" element={<ModuleRoute module="module:assets"><NewAssetPage /></ModuleRoute>} />
        <Route path="assets/:id" element={<ModuleRoute module="module:assets"><AssetDetailPage /></ModuleRoute>} />
        <Route path="devices" element={<ModuleRoute module="module:assets"><DevicesPage /></ModuleRoute>} />
        <Route path="network-devices" element={<ModuleRoute module="module:assets"><NetworkDevicesPage /></ModuleRoute>} />
        <Route path="network-devices/:id" element={<ModuleRoute module="module:assets"><NetworkDeviceDetailPage /></ModuleRoute>} />
        <Route path="endpoints" element={<ModuleRoute module="module:assets"><EndpointsPage /></ModuleRoute>} />
        <Route path="software" element={<ModuleRoute module="module:assets"><SoftwarePage /></ModuleRoute>} />
        <Route path="lifecycle" element={<ModuleRoute module="module:assets"><LifecyclePage /></ModuleRoute>} />
        <Route path="maintenance" element={<ModuleRoute module="module:assets"><MaintenancePage /></ModuleRoute>} />
        <Route path="mobile" element={<ModuleRoute module="module:assets"><MobilePage /></ModuleRoute>} />

        {/* Finance Module */}
        <Route path="finance" element={<ModuleRoute module="module:finance"><FinancePage /></ModuleRoute>} />

        {/* Shared / General admin routes (visible to multiple admins depending on permissions) */}
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="employees/:id" element={<EmployeeDetailPage />} />
        <Route path="departments" element={<DepartmentsPage />} />
        <Route path="vendors" element={<VendorsPage />} />
        <Route path="requests" element={<RequestsPage />} />
        <Route path="audit" element={<AuditPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
      </Route>

      <Route
        path="/system-admin"
        element={
          <ProtectedRoute>
            <SystemAdminRoute>
              <SystemAdminLayout />
            </SystemAdminRoute>
          </ProtectedRoute>
        }
      >
        <Route path="organizations" element={<OrganizationsPage />} />
        <Route path="organizations/new" element={<CreateOrganizationPage />} />
        <Route path="organizations/:id/edit" element={<EditOrganizationPage />} />
        <Route path="users" element={<SystemAdminUsersPage />} />
        <Route path="users/new" element={<CreateUserPage />} />
        <Route path="users/:id/edit" element={<EditUserPage />} />
      </Route>

      <Route
        path="/exec-docs"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <ModuleRoute module="module:docs">
                <ExecDocsLayout />
              </ModuleRoute>
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
