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
  'admin@assetly.com': {
    password: 'admin@assetly',
    user: {
      id: 'user-sysadmin',
      email: 'admin@assetly.com',
      firstName: 'Platform',
      lastName: 'Admin',
      role: 'platform_admin',
    },
  },
};
