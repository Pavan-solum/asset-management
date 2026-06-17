import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Breadcrumbs,
  Link,
  Divider,
  List,
  ListItem,
  ListItemText,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import QrCodeIcon from '@mui/icons-material/QrCode';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { useAppSelector } from '../../hooks/storeHooks';
import { usePermissions } from '../../hooks/storeHooks';
import { StatusChip } from '../../components/StatusChip';
import { AssetQrPanel } from '../../components/AssetQrPanel';
import { AssignAssetDialog, ReturnAssetDialog } from './AssignAssetDialog';
import { AssetEditDialog } from './AssetEditDialog';
import { formatCurrency, formatDate, formatDateTime, getEmployeeName } from '../../utils/format';
import { CATEGORY_LABELS } from '../../data/demoData';

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Grid container spacing={2} sx={{ py: 1 }}>
      <Grid item xs={4}>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Grid>
      <Grid item xs={8}>
        <Typography variant="body2" fontWeight={500}>
          {value}
        </Typography>
      </Grid>
    </Grid>
  );
}

export function AssetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { can } = usePermissions();
  const asset = useAppSelector((s) => s.assets.items.find((a) => a.id === id));
  const employees = useAppSelector((s) => s.employees.items);
  const vendors = useAppSelector((s) => s.vendors.items);
  const history = useAppSelector((s) => s.assets.ownershipHistory.filter((h) => h.assetId === id));
  const assignments = useAppSelector((s) => s.assets.assignments.filter((a) => a.assetId === id));

  const [assignOpen, setAssignOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [showQr, setShowQr] = useState(false);

  if (!asset) {
    return (
      <Box>
        <Alert severity="error">Asset not found</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/assets')} sx={{ mt: 2 }}>
          Back to Assets
        </Button>
      </Box>
    );
  }

  const employee = asset.assignedEmployeeId
    ? employees.find((e) => e.id === asset.assignedEmployeeId)
    : null;
  const vendor = vendors.find((v) => v.id === asset.vendorId);

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/assets" underline="hover" color="inherit">
          Assets
        </Link>
        <Typography color="text.primary">{asset.assetTag}</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            {asset.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 1, alignItems: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              {asset.assetTag}
            </Typography>
            <StatusChip status={asset.status} />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button startIcon={<QrCodeIcon />} variant="outlined" onClick={() => setShowQr(!showQr)}>
            QR Code
          </Button>
          {can('asset:write') && (
            <Button startIcon={<EditIcon />} variant="outlined" onClick={() => setEditOpen(true)}>
              Edit
            </Button>
          )}
          {can('asset:assign') && asset.status !== 'deployed' && (
            <Button startIcon={<AssignmentIndIcon />} variant="contained" onClick={() => setAssignOpen(true)}>
              Assign
            </Button>
          )}
          {can('asset:assign') && asset.status === 'deployed' && (
            <Button startIcon={<KeyboardReturnIcon />} variant="contained" color="warning" onClick={() => setReturnOpen(true)}>
              Return
            </Button>
          )}
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/assets')}>
            Back
          </Button>
        </Box>
      </Box>

      {showQr && (
        <Card sx={{ mb: 3, py: 3 }}>
          <CardContent>
            <AssetQrPanel
              assetId={asset.id}
              assetTag={asset.assetTag}
              size={180}
              showDownload
              caption="Scan to open asset lookup page"
            />
          </CardContent>
        </Card>
      )}

      <Grid container spacing={2}>
        {asset.imageUrl && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Device Image
                </Typography>
                <Box
                  component="img"
                  src={asset.imageUrl}
                  alt={asset.name}
                  sx={{ maxHeight: 280, maxWidth: '100%', borderRadius: 2, objectFit: 'contain' }}
                />
              </CardContent>
            </Card>
          </Grid>
        )}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Asset Details
              </Typography>
              <Divider sx={{ mb: 1 }} />
              <DetailRow label="Category" value={CATEGORY_LABELS[asset.category]} />
              <DetailRow label="Manufacturer" value={asset.manufacturer} />
              <DetailRow label="Model" value={asset.model} />
              <DetailRow label="Serial Number" value={asset.serialNumber} />
              <DetailRow label="Location" value={asset.location} />
              {asset.department && <DetailRow label="Department" value={asset.department} />}
              <DetailRow label="Vendor" value={vendor?.name ?? '—'} />
              <DetailRow label="Lifecycle" value={asset.lifecycleStage} />
              {asset.specs && <DetailRow label="Specs" value={asset.specs} />}
              <DetailRow
                label="Assigned To"
                value={
                  employee ? (
                    <Link component={RouterLink} to={`/employees/${employee.id}`} underline="hover">
                      {getEmployeeName(employee.firstName, employee.lastName)}
                    </Link>
                  ) : (
                    'Unassigned'
                  )
                }
              />
              {asset.notes && <DetailRow label="Notes" value={asset.notes} />}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Financial
              </Typography>
              <Divider sx={{ mb: 1 }} />
              <DetailRow label="Purchase Date" value={formatDate(asset.purchaseDate)} />
              <DetailRow label="Purchase Cost" value={formatCurrency(asset.purchaseCost)} />
              <DetailRow label="Current Value" value={formatCurrency(asset.currentValue)} />
              <DetailRow
                label="Depreciation"
                value={`${Math.round((1 - asset.currentValue / asset.purchaseCost) * 100)}%`}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Warranty
              </Typography>
              <Divider sx={{ mb: 1 }} />
              <DetailRow label="Expires" value={formatDate(asset.warrantyExpiresAt)} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ownership History
              </Typography>
              <List dense>
                {history.length === 0 ? (
                  <Typography color="text.secondary" variant="body2">
                    No history yet
                  </Typography>
                ) : (
                  history.map((h) => (
                    <ListItem key={h.id} sx={{ px: 0 }}>
                      <ListItemText
                        primary={h.eventType}
                        secondary={`${h.description} · ${h.performedBy} · ${formatDateTime(h.createdAt)}`}
                      />
                    </ListItem>
                  ))
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Assignment Records
              </Typography>
              <List dense>
                {assignments.map((a) => {
                  const emp = employees.find((e) => e.id === a.employeeId);
                  return (
                    <ListItem key={a.id} sx={{ px: 0 }}>
                      <ListItemText
                        primary={emp ? getEmployeeName(emp.firstName, emp.lastName) : 'Unknown'}
                        secondary={`${formatDateTime(a.assignedAt)}${a.returnedAt ? ` → ${formatDateTime(a.returnedAt)}` : ' (active)'}`}
                      />
                    </ListItem>
                  );
                })}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <AssignAssetDialog
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        assetId={asset.id}
        assetTag={asset.assetTag}
      />
      <ReturnAssetDialog
        open={returnOpen}
        onClose={() => setReturnOpen(false)}
        assetId={asset.id}
        assetTag={asset.assetTag}
      />
      <AssetEditDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        asset={asset}
        onDeleted={() => navigate('/assets')}
      />
    </Box>
  );
}
