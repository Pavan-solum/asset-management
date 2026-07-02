import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AuditLog, AuditAction } from '../types';
import { DEMO_AUDIT_LOGS, DEMO_TENANT } from '../data/demoData';

const auditSlice = createSlice({
  name: 'audit',
  initialState: { items: [] as AuditLog[] },
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
        tenantId: DEMO_TENANT.id,
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
