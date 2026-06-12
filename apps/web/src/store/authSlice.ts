import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Tenant, User } from '../types';
import { DEMO_TENANT, DEMO_USERS } from '../data/demoData';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  tenant: Tenant | null;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  tenant: null,
  error: null,
};

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
      state.error = null;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.tenant = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { login, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
