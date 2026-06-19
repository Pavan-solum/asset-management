import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string | null;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy: string | null;
  createdAt: string;
}

interface HRState {
  leaveRequests: LeaveRequest[];
}

const initialState: HRState = {
  leaveRequests: [],
};

const hrSlice = createSlice({
  name: 'hr',
  initialState,
  reducers: {
    setLeaveRequests: (state, action: PayloadAction<LeaveRequest[]>) => {
      state.leaveRequests = action.payload;
    },
    addLeaveRequest: (state, action: PayloadAction<LeaveRequest>) => {
      state.leaveRequests.unshift(action.payload);
    },
    updateLeaveRequestStatus: (
      state,
      action: PayloadAction<{ id: string; status: 'approved' | 'rejected'; approvedBy: string }>
    ) => {
      const idx = state.leaveRequests.findIndex(r => r.id === action.payload.id);
      if (idx !== -1) {
        state.leaveRequests[idx].status = action.payload.status;
        state.leaveRequests[idx].approvedBy = action.payload.approvedBy;
      }
    },
  },
});

export const { setLeaveRequests, addLeaveRequest, updateLeaveRequestStatus } = hrSlice.actions;
export default hrSlice.reducer;
