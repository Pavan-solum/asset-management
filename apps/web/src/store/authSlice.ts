import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Tenant, User } from '../types';
import { DEMO_TENANT, DEMO_USERS } from '../data/demoData';
import { resolveDemoUser } from '../utils/userDisplay';
import { storeToken } from '../services/api/auth';

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  tenant: Tenant | null;
  token: string | null;
  error: string | null;
  credentials: Record<string, string>;
  requirePasswordSetup: boolean;
  pendingUserEmail: string | null;
}

const defaultState: AuthState = {
  isAuthenticated: false,
  user: null,
  tenant: null,
  token: null,
  error: null,
  credentials: {},
  requirePasswordSetup: false,
  pendingUserEmail: null,
};

const savedAuth = sessionStorage.getItem('assetly_auth_state');
const initialState: AuthState = savedAuth ? JSON.parse(savedAuth) : defaultState;

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ email: string; password?: string }>) => {
      const email = action.payload.email.toLowerCase();
      const cred = DEMO_USERS[email];
      const providedPassword = action.payload.password;
      
      // Clear previous setup state
      state.requirePasswordSetup = false;
      state.pendingUserEmail = null;

      if (cred) {
        if (cred.password !== providedPassword) {
          state.error = 'Invalid email or password';
          state.isAuthenticated = false;
          return;
        }
        state.user = cred.user;
      } else {
        // Dynamic user flow
        if (!state.credentials) {
          state.credentials = {};
        }
        const savedPassword = state.credentials[email];
        
        if (!savedPassword) {
          // First time logging in (no password set)
          state.requirePasswordSetup = true;
          state.pendingUserEmail = email;
          state.error = null;
          state.isAuthenticated = false;
          return;
        }
        
        if (savedPassword !== providedPassword && providedPassword !== 'Demo@123456') {
          state.error = 'Invalid email or password';
          state.isAuthenticated = false;
          return;
        }

        // Create a mock user on the fly based on the email
        const nameParts = email.split('@')[0].split('.');
        const firstName = nameParts[0] ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1) : 'Demo';
        const lastName = nameParts[1] ? nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1) : 'User';
        
        state.user = {
          id: `usr-${Date.now()}`,
          tenantId: DEMO_TENANT.id,
          firstName,
          lastName,
          email: action.payload.email,
          role: 'employee',
        };
      }

      state.isAuthenticated = true;
      state.tenant = DEMO_TENANT;
      state.token = null;
      state.error = null;
    },
    setPasswordAndLogin: (state, action: PayloadAction<string>) => {
      if (!state.pendingUserEmail) return;
      
      const email = state.pendingUserEmail;
      
      if (!state.credentials) {
        state.credentials = {};
      }
      // Save the new password
      state.credentials[email.toLowerCase()] = action.payload;
      
      // Auto login with the newly created user
      const nameParts = email.split('@')[0].split('.');
      const firstName = nameParts[0] ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1) : 'Demo';
      const lastName = nameParts[1] ? nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1) : 'User';
      
      state.user = {
        id: `usr-${Date.now()}`,
        tenantId: DEMO_TENANT.id,
        firstName,
        lastName,
        email,
        role: 'employee',
      };
      
      state.requirePasswordSetup = false;
      state.pendingUserEmail = null;
      state.isAuthenticated = true;
      state.tenant = DEMO_TENANT;
      state.token = null;
      state.error = null;
    },
    setSession: (
      state,
      action: PayloadAction<{ user: User; tenant: Tenant; token: string }>,
    ) => {
      state.isAuthenticated = true;
      state.requirePasswordSetup = false;
      state.pendingUserEmail = null;
      state.user = resolveDemoUser(action.payload.user);
      state.tenant = action.payload.tenant;
      state.token = action.payload.token;
      state.error = null;
      storeToken(action.payload.token);
      sessionStorage.setItem('assetly_auth_state', JSON.stringify(state));
    },
    setPendingSession: (
      state,
      action: PayloadAction<{ user: User; tenant: Tenant; token: string }>,
    ) => {
      // Not yet authenticated — waiting for user to set their password
      state.isAuthenticated = false;
      state.requirePasswordSetup = true;
      state.pendingUserEmail = action.payload.user.email;
      state.user = resolveDemoUser(action.payload.user);
      state.tenant = action.payload.tenant;
      state.token = action.payload.token;
      state.error = null;
      storeToken(action.payload.token);
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.tenant = null;
      state.token = null;
      state.error = null;
      storeToken(null);
      sessionStorage.removeItem('assetly_auth_state');
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoginError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isAuthenticated = false;
    },
  },
});

export const { login, setPasswordAndLogin, setSession, setPendingSession, logout, clearError, setLoginError } = authSlice.actions;
export default authSlice.reducer;
