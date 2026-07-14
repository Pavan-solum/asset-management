import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { NetworkDevice } from '../types';

const networkDevicesSlice = createSlice({
  name: 'networkDevices',
  initialState: { items: [] as NetworkDevice[] },
  reducers: {
    replaceAllNetworkDevices: (state, action: PayloadAction<NetworkDevice[]>) => {
      state.items = action.payload;
    },
  },
});

export const { replaceAllNetworkDevices } = networkDevicesSlice.actions;
export default networkDevicesSlice.reducer;
