import { Box, Card, CardContent, Typography, Alert, Chip } from '@mui/material';
import DevicesIcon from '@mui/icons-material/Devices';
import { useParams } from 'react-router-dom';
import { useAppSelector } from '../../hooks/storeHooks';
import { StatusChip } from '../../components/StatusChip';
import { formatCurrency, formatDate, getEmployeeName } from '../../utils/format';
import { CATEGORY_LABELS, DEMO_TENANT } from '../../data/demoData';

export function AssetLookupPage() {
  const { id } = useParams<{ id: string }>();
  const asset = useAppSelector((s) => s.assets.items.find((a) => a.id === id));
  const employees = useAppSelector((s) => s.employees.items);
  const vendors = useAppSelector((s) => s.vendors.items);

  if (!asset) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: 2,
        }}
      >
        <Alert severity="warning">Asset not found. Scan a valid QR code.</Alert>
      </Box>
    );
  }

  const employee = asset.assignedEmployeeId
    ? employees.find((e) => e.id === asset.assignedEmployeeId)
    : null;
  const vendor = vendors.find((v) => v.id === asset.vendorId);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        py: 4,
        px: 2,
      }}
    >
      <Box sx={{ maxWidth: 480, mx: 'auto' }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              bgcolor: 'primary.main',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 1,
            }}
          >
            <DevicesIcon sx={{ color: 'white' }} />
          </Box>
          <Typography variant="h6" fontWeight={700}>
            {DEMO_TENANT.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Asset Lookup
          </Typography>
        </Box>

        <Card>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  {asset.assetTag}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {asset.name}
                </Typography>
              </Box>
              <StatusChip status={asset.status} />
            </Box>

            <Chip label={CATEGORY_LABELS[asset.category]} size="small" sx={{ mb: 2 }} />

            <Box sx={{ display: 'grid', gap: 1.5 }}>
              <Row label="Serial" value={asset.serialNumber} />
              <Row label="Manufacturer" value={`${asset.manufacturer} ${asset.model}`} />
              <Row label="Location" value={asset.location} />
              <Row label="Vendor" value={vendor?.name ?? '—'} />
              <Row
                label="Assigned To"
                value={employee ? getEmployeeName(employee.firstName, employee.lastName) : 'Unassigned'}
              />
              <Row label="Warranty Until" value={formatDate(asset.warrantyExpiresAt)} />
              <Row label="Current Value" value={formatCurrency(asset.currentValue)} />
            </Box>
          </CardContent>
        </Card>

        <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={2}>
          IT Asset Platform · Mobile QR Lookup Demo
        </Typography>
      </Box>
    </Box>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500}>
        {value}
      </Typography>
    </Box>
  );
}
