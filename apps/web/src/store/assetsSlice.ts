import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Asset, AssetAssignment, OwnershipEvent } from '../types';
import { DEMO_TENANT } from '../data/demoData';

interface AssetsState {
  items: Asset[];
  assignments: AssetAssignment[];
  ownershipHistory: OwnershipEvent[];
}

const assetsSlice = createSlice({
  name: 'assets',
  initialState: {
    items: [],
    assignments: [],
    ownershipHistory: [],
  } as AssetsState,
  reducers: {
    addAsset: {
      reducer(state, action: PayloadAction<Asset>) {
        state.items.unshift(action.payload);
      },
      prepare(asset: Omit<Asset, 'id' | 'createdAt' | 'tenantId'>) {
        const id = `asset-${Date.now()}`;
        return {
          payload: {
            ...asset,
            id,
            tenantId: DEMO_TENANT.id,
            createdAt: new Date().toISOString(),
          },
        };
      },
    },
    updateAsset: (state, action: PayloadAction<Asset>) => {
      const idx = state.items.findIndex((a) => a.id === action.payload.id);
      if (idx >= 0) state.items[idx] = action.payload;
    },
    deleteAsset: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((a) => a.id !== action.payload);
    },
    assignAsset: (
      state,
      action: PayloadAction<{
        assetId: string;
        employeeId: string;
        assignedBy: string;
        notes?: string;
      }>,
    ) => {
      const { assetId, employeeId, assignedBy, notes } = action.payload;
      const asset = state.items.find((a) => a.id === assetId);
      if (!asset) return;

      state.assignments
        .filter((a) => a.assetId === assetId && !a.returnedAt)
        .forEach((a) => {
          a.returnedAt = new Date().toISOString();
        });

      state.assignments.push({
        id: `assign-${Date.now()}`,
        tenantId: DEMO_TENANT.id,
        assetId,
        employeeId,
        assignedAt: new Date().toISOString(),
        assignedBy,
        notes,
      });

      asset.status = 'deployed';
      asset.assignedEmployeeId = employeeId;

      state.ownershipHistory.unshift({
        id: `hist-${Date.now()}`,
        tenantId: DEMO_TENANT.id,
        assetId,
        eventType: 'ASSIGNED',
        description: 'Asset assigned to employee',
        performedBy: assignedBy,
        createdAt: new Date().toISOString(),
      });
    },
    importInventory: (
      state,
      action: PayloadAction<{
        items: Asset[];
        assignments: AssetAssignment[];
        ownershipHistory: OwnershipEvent[];
      }>,
    ) => {
      state.items = action.payload.items;
      state.assignments = action.payload.assignments;
      state.ownershipHistory = action.payload.ownershipHistory;
    },
    bulkImportAssets: (
      state,
      action: PayloadAction<
        {
          asset: Omit<Asset, 'id' | 'createdAt' | 'tenantId'>;
          assignedBy?: string;
        }[]
      >,
    ) => {
      action.payload.forEach(({ asset, assignedBy }, i) => {
        const id = `asset-import-${Date.now()}-${i}`;
        state.items.unshift({
          ...asset,
          id,
          tenantId: DEMO_TENANT.id,
          createdAt: new Date().toISOString(),
        });

        if (asset.assignedEmployeeId && assignedBy) {
          state.assignments.push({
            id: `assign-${id}`,
            tenantId: DEMO_TENANT.id,
            assetId: id,
            employeeId: asset.assignedEmployeeId,
            assignedAt: new Date().toISOString(),
            assignedBy,
            notes: 'Imported from Excel',
          });
          state.ownershipHistory.unshift({
            id: `hist-${id}`,
            tenantId: DEMO_TENANT.id,
            assetId: id,
            eventType: 'ASSIGNED',
            description: 'Assigned during Excel import',
            performedBy: assignedBy,
            createdAt: new Date().toISOString(),
          });
        }
      });
    },
    returnAsset: (
      state,
      action: PayloadAction<{
        assetId: string;
        performedBy: string;
        returnCondition?: string;
      }>,
    ) => {
      const { assetId, performedBy, returnCondition } = action.payload;
      const asset = state.items.find((a) => a.id === assetId);
      if (!asset) return;

      const active = state.assignments.find((a) => a.assetId === assetId && !a.returnedAt);
      if (active) {
        active.returnedAt = new Date().toISOString();
        active.returnCondition = returnCondition;
      }

      asset.status = 'in_stock';
      asset.assignedEmployeeId = undefined;

      state.ownershipHistory.unshift({
        id: `hist-${Date.now()}`,
        tenantId: DEMO_TENANT.id,
        assetId,
        eventType: 'RETURNED',
        description: returnCondition ? `Returned — ${returnCondition}` : 'Asset returned',
        performedBy,
        createdAt: new Date().toISOString(),
      });
    },
  },
});

export const {
  addAsset,
  updateAsset,
  deleteAsset,
  assignAsset,
  returnAsset,
  bulkImportAssets,
  importInventory,
} = assetsSlice.actions;
export default assetsSlice.reducer;
