import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Vendor } from '../types';
import { DEMO_TENANT, DEMO_VENDORS } from '../data/demoData';

const vendorsSlice = createSlice({
  name: 'vendors',
  initialState: { items: [] as Vendor[] },
  reducers: {
    addVendor: (state, action: PayloadAction<Omit<Vendor, 'id' | 'tenantId'>>) => {
      state.items.push({ ...action.payload, id: `vendor-${Date.now()}`, tenantId: DEMO_TENANT.id });
    },
    updateVendor: (state, action: PayloadAction<Vendor>) => {
      const idx = state.items.findIndex((v) => v.id === action.payload.id);
      if (idx >= 0) state.items[idx] = action.payload;
    },
    deleteVendor: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((v) => v.id !== action.payload);
    },
    replaceAllVendors: (state, action: PayloadAction<Vendor[]>) => {
      state.items = action.payload;
    },
  },
});

export const { addVendor, updateVendor, deleteVendor, replaceAllVendors } = vendorsSlice.actions;
export default vendorsSlice.reducer;
