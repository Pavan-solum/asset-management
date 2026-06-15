import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AuditLog, AuditAction } from '../types';
import { DEMO_AUDIT_LOGS } from '../data/demoData';

const auditSlice = createSlice({
  name: 'audit',
  initialState: { items: DEMO_AUDIT_LOGS as AuditLog[] },
  reducers: {
    addAuditLog: (
      state,
      action: PayloadAction<{
        userId: string;
        userName: string;
        action: AuditAction;
        entityType: string;
        entityId: string;
        entityLabel: string;
        details: string;
      }>,
    ) => {
      state.items.unshift({
        ...action.payload,
        id: `audit-${Date.now()}`,
        createdAt: new Date().toISOString(),
      });
    },
    replaceAllAuditLogs: (state, action: PayloadAction<AuditLog[]>) => {
      state.items = action.payload;
    },
  },
});

export const { addAuditLog, replaceAllAuditLogs } = auditSlice.actions;
export default auditSlice.reducer;
