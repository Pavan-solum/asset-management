import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Tenant, User } from '../types';
import { DEMO_TENANT, DEMO_USERS } from '../data/demoData';
import { resolveDemoUser } from '../utils/userDisplay';
import { storeToken } from '../services/api/auth';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  tenant: Tenant | null;
  token: string | null;
  error: string | null;
}

const defaultState: AuthState = {
  isAuthenticated: false,
  user: null,
  tenant: null,
  token: null,
  error: null,
};

const savedAuth = sessionStorage.getItem('assetly_auth_state');
const initialState: AuthState = savedAuth ? JSON.parse(savedAuth) : defaultState;

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ email: string; password: string }>) => {
      const cred = DEMO_USERS[action.payload.email.toLowerCase()];
      if (!cred || cred.password !== action.payload.password) {
        state.error = 'Invalid email or password';
        state.isAuthenticated = false;
        return;
      }
      state.isAuthenticated = true;
      state.user = cred.user;
      state.tenant = DEMO_TENANT;
      state.token = null;
      state.error = null;
      sessionStorage.setItem('assetly_auth_state', JSON.stringify(state));
    },
    setSession: (
      state,
      action: PayloadAction<{ user: User; tenant: Tenant; token: string }>,
    ) => {
      state.isAuthenticated = true;
      state.user = resolveDemoUser(action.payload.user);
      state.tenant = action.payload.tenant;
      state.token = action.payload.token;
      state.error = null;
      storeToken(action.payload.token);
      sessionStorage.setItem('assetly_auth_state', JSON.stringify(state));
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

export const { login, setSession, logout, clearError, setLoginError } = authSlice.actions;
export default authSlice.reducer;
