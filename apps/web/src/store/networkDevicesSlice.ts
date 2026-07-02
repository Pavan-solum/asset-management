import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { NetworkDevice } from '../types';
import { DEMO_TENANT, generateDemoNetworkDevices } from '../data/demoData';

const networkDevicesSlice = createSlice({
  name: 'networkDevices',
  initialState: { items: [] as NetworkDevice[] },
  reducers: {
    addNetworkDevice: (state, action: PayloadAction<Omit<NetworkDevice, 'id' | 'deviceTag' | 'tenantId'>>) => {
      const id = `net-${Date.now()}`;
      state.items.push({
        ...action.payload,
        id,
        tenantId: DEMO_TENANT.id,
        deviceTag: `NET-${Date.now().toString().slice(-4)}`,
      });
    },
    updateNetworkDevice: (state, action: PayloadAction<NetworkDevice>) => {
      const idx = state.items.findIndex((d) => d.id === action.payload.id);
      if (idx >= 0) state.items[idx] = action.payload;
    },
  },
});

export const { addNetworkDevice, updateNetworkDevice } = networkDevicesSlice.actions;
export default networkDevicesSlice.reducer;
