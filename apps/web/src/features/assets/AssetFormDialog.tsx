import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../hooks/storeHooks';
import { addAsset } from '../../store/assetsSlice';
import { addAuditLog } from '../../store/auditSlice';
import { LoadingButton } from '../../components/Loader';
import { withMinDelay } from '../../hooks/useAsyncAction';
import type { AssetCategory, AssetStatus, LifecycleStage } from '../../types';

interface Props {
  open: boolean;
  onClose: () => void;
}

const defaultForm = {
  assetTag: '',
  name: '',
  category: 'laptop' as AssetCategory,
  manufacturer: '',
  model: '',
  serialNumber: '',
  status: 'in_stock' as AssetStatus,
  lifecycleStage: 'procurement' as LifecycleStage,
  purchaseDate: new Date().toISOString().split('T')[0],
  purchaseCost: 1299,
  currentValue: 1299,
  repairCost: 0,
  location: 'HQ',
  vendorId: 'vendor-dell',
  warrantyExpiresAt: '',
  notes: '',
};

export function AssetFormDialog({ open, onClose }: Props) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const vendors = useAppSelector((s) => s.vendors.items);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.assetTag || !form.name || loading) return;
    setLoading(true);
    try {
      await withMinDelay(
        Promise.resolve().then(() => {
          dispatch(addAsset(form));
          dispatch(
            addAuditLog({
              userId: user!.id,
              userName: `${user!.firstName} ${user!.lastName}`,
              action: 'CREATE',
              entityType: 'asset',
              entityId: 'new',
              entityLabel: form.assetTag,
              details: `Created ${form.name}`,
            }),
          );
        }),
      );
      setForm(defaultForm);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="md" fullWidth>
      <DialogTitle>Add New Asset</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="Asset Tag"
              value={form.assetTag}
              onChange={(e) => handleChange('assetTag', e.target.value)}
              placeholder="LAP-051"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="Name"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label="Category"
              value={form.category}
              onChange={(e) => handleChange('category', e.target.value)}
            >
              {[
                'laptop', 'desktop', 'server', 'mobile',
                'monitor', 'keyboard', 'mouse', 'webcam', 'headset',
                'peripheral', 'network', 'other',
              ].map((c) => (
                <MenuItem key={c} value={c}>
                  {c.replace('_', ' ')}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Manufacturer"
              value={form.manufacturer}
              onChange={(e) => handleChange('manufacturer', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Model"
              value={form.model}
              onChange={(e) => handleChange('model', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Serial Number"
              value={form.serialNumber}
              onChange={(e) => handleChange('serialNumber', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Vendor"
              value={form.vendorId}
              onChange={(e) => handleChange('vendorId', e.target.value)}
            >
              {vendors.map((v) => (
                <MenuItem key={v.id} value={v.id}>
                  {v.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              type="number"
              label="Purchase Cost"
              value={form.purchaseCost}
              onChange={(e) => {
                const cost = Number(e.target.value);
                handleChange('purchaseCost', cost);
                handleChange('currentValue', cost);
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              type="date"
              label="Purchase Date"
              InputLabelProps={{ shrink: true }}
              value={form.purchaseDate}
              onChange={(e) => handleChange('purchaseDate', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              type="date"
              label="Warranty Expires"
              InputLabelProps={{ shrink: true }}
              value={form.warrantyExpiresAt}
              onChange={(e) => handleChange('warrantyExpiresAt', e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Location"
              value={form.location}
              onChange={(e) => handleChange('location', e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Notes"
              value={form.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <LoadingButton
          variant="contained"
          onClick={() => void handleSubmit()}
          disabled={!form.assetTag || !form.name}
          loading={loading}
          loadingLabel="Creating…"
        >
          Create Asset
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
