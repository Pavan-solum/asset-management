import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Employee } from '../types';

const employeesSlice = createSlice({
  name: 'employees',
  initialState: { items: [] as Employee[] },
  reducers: {
    replaceAllEmployees: (state, action: PayloadAction<Employee[]>) => {
      state.items = action.payload;
    },
    addEmployee: (state, action: PayloadAction<Omit<Employee, 'id'>>) => {
      state.items.push({ ...action.payload, id: `emp-${Date.now()}` });
    },
    updateEmployee: (state, action: PayloadAction<Employee>) => {
      const idx = state.items.findIndex((e) => e.id === action.payload.id);
      if (idx >= 0) state.items[idx] = action.payload;
    },
    deleteEmployee: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((e) => e.id !== action.payload);
    },
  },
});

export const { replaceAllEmployees, addEmployee, updateEmployee, deleteEmployee } =
  employeesSlice.actions;
export default employeesSlice.reducer;
