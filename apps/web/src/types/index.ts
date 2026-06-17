export type AssetCategory =
  | 'laptop'
  | 'desktop'
  | 'server'
  | 'mobile'
  | 'monitor'
  | 'keyboard'
  | 'mouse'
  | 'webcam'
  | 'headset'
  | 'peripheral'
  | 'network'
  | 'other';
export type AssetStatus = 'in_stock' | 'deployed' | 'in_repair' | 'retired' | 'lost' | 'disposed';
export type LifecycleStage = 'procurement' | 'active' | 'maintenance' | 'end_of_life';
export type EmployeeStatus = 'active' | 'terminated' | 'on_leave';
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'ASSIGN' | 'RETURN' | 'LOGIN' | 'LOGOUT';
export type UserRole = 'tenant_admin' | 'it_admin' | 'viewer' | 'employee';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  employeeId?: string;
}

export interface Department {
  id: string;
  name: string;
  costCenter: string;
}

export interface Vendor {
  id: string;
  name: string;
  contactEmail: string;
  website: string;
}

export interface Employee {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  departmentId: string;
  status: EmployeeStatus;
  hireDate: string;
}

export interface AssetAssignment {
  id: string;
  assetId: string;
  employeeId: string;
  assignedAt: string;
  returnedAt?: string;
  assignedBy: string;
  notes?: string;
  returnCondition?: string;
}

export interface OwnershipEvent {
  id: string;
  assetId: string;
  eventType: string;
  description: string;
  performedBy: string;
  createdAt: string;
}

export interface Asset {
  id: string;
  assetTag: string;
  name: string;
  category: AssetCategory;
  manufacturer: string;
  model: string;
  serialNumber: string;
  status: AssetStatus;
  lifecycleStage: LifecycleStage;
  purchaseDate: string;
  purchaseCost: number;
  currentValue: number;
  location: string;
  vendorId: string;
  assignedEmployeeId?: string;
  warrantyExpiresAt: string;
  notes?: string;
  specs?: string;
  department?: string;
  imageUrl?: string;
  createdAt: string;
}

export type AssetRequestType = 'new' | 'replacement' | 'accessory';
export type AssetRequestStatus = 'submitted' | 'approved' | 'rejected' | 'fulfilled';

export interface AssetRequest {
  id: string;
  employeeId: string;
  requestType: AssetRequestType;
  category: AssetCategory;
  description: string;
  neededBy?: string;
  status: AssetRequestStatus;
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  employeeName?: string;
  employeeEmail?: string;
  departmentName?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  entityLabel: string;
  details: string;
  createdAt: string;
}

export interface DemoUserCredential {
  email: string;
  password: string;
  user: User;
}

export const PERMISSIONS = {
  'asset:read': ['tenant_admin', 'it_admin', 'viewer'],
  'asset:write': ['tenant_admin', 'it_admin'],
  'asset:delete': ['tenant_admin'],
  'asset:assign': ['tenant_admin', 'it_admin'],
  'employee:write': ['tenant_admin', 'it_admin'],
  'employee:delete': ['tenant_admin'],
  'vendor:write': ['tenant_admin', 'it_admin'],
  'audit:read': ['tenant_admin', 'it_admin', 'viewer'],
  'settings:write': ['tenant_admin'],
  'request:create': ['employee'],
  'request:read-own': ['employee'],
  'request:read': ['tenant_admin', 'it_admin'],
  'request:review': ['tenant_admin', 'it_admin'],
} as const;

export type Permission = keyof typeof PERMISSIONS;

export type NetworkDeviceType =
  | 'cctv'
  | 'wifi_router'
  | 'switch'
  | 'gateway'
  | 'firewall'
  | 'access_point';

export type NetworkDeviceStatus = 'online' | 'offline' | 'warning' | 'maintenance';

export interface NetworkDevice {
  id: string;
  deviceTag: string;
  name: string;
  type: NetworkDeviceType;
  manufacturer: string;
  model: string;
  serialNumber: string;
  ipAddress: string;
  macAddress: string;
  location: string;
  status: NetworkDeviceStatus;
  firmwareVersion: string;
  lastSeenAt: string;
  uptimePercent: number;
  vlan?: string;
  notes?: string;
}

/** Categories employees can request */
export const REQUEST_CATEGORIES: AssetCategory[] = [
  'laptop',
  'desktop',
  'mobile',
  'monitor',
  'keyboard',
  'mouse',
  'webcam',
  'headset',
  'peripheral',
  'other',
];

/** Categories shown under the Devices menu (peripherals) */
export const PERIPHERAL_CATEGORIES: AssetCategory[] = [
  'monitor',
  'keyboard',
  'mouse',
  'webcam',
  'headset',
];
