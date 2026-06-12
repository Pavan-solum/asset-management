import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { NetworkDevice } from '../types';
import { generateDemoNetworkDevices } from '../data/demoData';

const networkDevicesSlice = createSlice({
  name: 'networkDevices',
  initialState: { items: generateDemoNetworkDevices() },
  reducers: {
    addNetworkDevice: (state, action: PayloadAction<Omit<NetworkDevice, 'id' | 'deviceTag'>>) => {
      const num = state.items.length + 1;
      state.items.push({
        ...action.payload,
        id: `net-${Date.now()}`,
        deviceTag: `NET-${String(num).padStart(3, '0')}`,
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
