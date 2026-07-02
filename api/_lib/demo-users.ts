const COMPANY_EMAIL_DOMAIN = 'solumtechnologies.com';

/** Demo credentials — keep in sync with apps/web/src/data/demoData.ts */
export const DEMO_USERS: Record<
  string,
  {
    password: string;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      employeeId?: string;
    };
  }
> = {
  'sysadmin@assetly.com': {
    password: 'Demo@123456',
    user: {
      id: 'user-sysadmin',
      email: 'sysadmin@assetly.com',
      firstName: 'Platform',
      lastName: 'Admin',
      role: 'platform_admin',
    },
  },
  'admin@solumtechnologies.com': {
    password: 'Demo@123456',
    user: {
      id: 'user-admin',
      email: 'admin@solumtechnologies.com',
      firstName: 'Vasanth',
      lastName: '',
      role: 'tenant_admin',
    },
  },
  'itadmin@solumtechnologies.com': {
    password: 'Demo@123456',
    user: {
      id: 'user-itadmin',
      email: 'itadmin@solumtechnologies.com',
      firstName: 'Pavan',
      lastName: '',
      role: 'it_admin',
    },
  },
  'viewer@solumtechnologies.com': {
    password: 'Demo@123456',
    user: {
      id: 'user-viewer',
      email: 'viewer@solumtechnologies.com',
      firstName: 'Lisa',
      lastName: 'Viewer',
      role: 'viewer',
    },
  },
  'sarah.chen@solumtechnologies.com': {
    password: 'Demo@123456',
    user: {
      id: 'user-employee-sarah',
      email: 'sarah.chen@solumtechnologies.com',
      firstName: 'Sarah',
      lastName: 'Chen',
      role: 'employee',
      employeeId: '44444444-4444-4444-4444-444444444401',
    },
  },
};

export const DEMO_TENANT = {
  id: '11111111-1111-1111-1111-111111111111',
  name: 'Solum Technologies',
  slug: 'solum-technologies',
  plan: 'Professional',
};
