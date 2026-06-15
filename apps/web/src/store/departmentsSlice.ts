import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Department } from '../types';
import { DEMO_DEPARTMENTS } from '../data/demoData';

const departmentsSlice = createSlice({
  name: 'departments',
  initialState: { items: DEMO_DEPARTMENTS },
  reducers: {
    addDepartment: (state, action: PayloadAction<Omit<Department, 'id'>>) => {
      state.items.push({ ...action.payload, id: `dept-${Date.now()}` });
    },
    updateDepartment: (state, action: PayloadAction<Department>) => {
      const idx = state.items.findIndex((d) => d.id === action.payload.id);
      if (idx >= 0) state.items[idx] = action.payload;
    },
    deleteDepartment: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((d) => d.id !== action.payload);
    },
    replaceAllDepartments: (state, action: PayloadAction<Department[]>) => {
      state.items = action.payload;
    },
  },
});

export const { addDepartment, updateDepartment, deleteDepartment, replaceAllDepartments } =
  departmentsSlice.actions;
export default departmentsSlice.reducer;
