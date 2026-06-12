import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  TextField,
  Typography,
  InputAdornment,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppSelector } from '../../hooks/storeHooks';
import { usePermissions } from '../../hooks/storeHooks';
import { StatusChip } from '../../components/StatusChip';
import { formatCurrency, formatDate, daysUntil, getEmployeeName } from '../../utils/format';
import { assetMatchesSearch } from '../../utils/search';
import { CATEGORY_LABELS, STATUS_LABELS } from '../../data/demoData';
import { AssetFormDialog } from './AssetFormDialog';
import { AssetImportDialog } from './AssetImportDialog';

export function AssetsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const warrantyFilter = searchParams.get('warranty');
  const assets = useAppSelector((s) => s.assets.items);
  const employees = useAppSelector((s) => s.employees.items);
  const vendors = useAppSelector((s) => s.vendors.items);
  const { can } = usePermissions();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const employeeMap = useMemo(
    () => Object.fromEntries(employees.map((e) => [e.id, e])),
    [employees],
  );
  const vendorMap = useMemo(
    () => Object.fromEntries(vendors.map((v) => [v.id, v.name])),
    [vendors],
  );

  const filtered = useMemo(() => {
    return assets.filter((a) => {
      const assignee = a.assignedEmployeeId ? employeeMap[a.assignedEmployeeId] : undefined;
      const matchSearch = assetMatchesSearch(a, search, {
        assigneeName: assignee ? getEmployeeName(assignee.firstName, assignee.lastName) : undefined,
        vendorName: vendorMap[a.vendorId],
        categoryLabel: CATEGORY_LABELS[a.category],
        statusLabel: STATUS_LABELS[a.status],
      });
      const matchStatus = statusFilter === 'all' || a.status === statusFilter;
      const matchWarranty =
        !warrantyFilter ||
        (daysUntil(a.warrantyExpiresAt) <= Number(warrantyFilter) && daysUntil(a.warrantyExpiresAt) >= 0);
      return matchSearch && matchStatus && matchWarranty;
    });
  }, [assets, search, statusFilter, warrantyFilter, employeeMap, vendorMap]);

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const exportCsv = () => {
    const headers = ['Asset Tag', 'Name', 'Status', 'Category', 'Serial', 'Assignee', 'Warranty'];
    const rows = filtered.map((a) => [
      a.assetTag,
      a.name,
      a.status,
      a.category,
      a.serialNumber,
      a.assignedEmployeeId ? getEmployeeName(employeeMap[a.assignedEmployeeId].firstName, employeeMap[a.assignedEmployeeId].lastName) : '',
      a.warrantyExpiresAt,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'assets-export.csv';
    link.click();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Assets
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {filtered.length} assets
            {warrantyFilter && ` · warranty expiring within ${warrantyFilter} days`}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button startIcon={<FileDownloadIcon />} variant="outlined" onClick={exportCsv}>
            Export CSV
          </Button>
          {can('asset:write') && (
            <>
              <Button startIcon={<UploadFileIcon />} variant="outlined" onClick={() => setImportOpen(true)}>
                Import Excel
              </Button>
              <Button startIcon={<AddIcon />} variant="contained" onClick={() => setFormOpen(true)}>
                Add Asset
              </Button>
            </>
          )}
        </Box>
      </Box>

      <Card sx={{ mb: 2, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search tag, name, serial, category, status, assignee, location..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            sx={{ minWidth: 280 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            size="small"
            label="Status"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="deployed">Deployed</MenuItem>
            <MenuItem value="in_stock">In Stock</MenuItem>
            <MenuItem value="in_repair">In Repair</MenuItem>
            <MenuItem value="retired">Retired</MenuItem>
          </TextField>
          {warrantyFilter && (
            <Chip
              label={`Warranty ≤ ${warrantyFilter} days`}
              onDelete={() => navigate('/assets')}
              color="warning"
            />
          )}
        </Box>
      </Card>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Asset Tag</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Assignee</TableCell>
                <TableCell>Warranty</TableCell>
                <TableCell align="right">Value</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((asset) => {
                const emp = asset.assignedEmployeeId ? employeeMap[asset.assignedEmployeeId] : null;
                const warrantyDays = daysUntil(asset.warrantyExpiresAt);
                return (
                  <TableRow key={asset.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/assets/${asset.id}`)}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {asset.assetTag}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{asset.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {[asset.manufacturer, asset.serialNumber].filter(Boolean).join(' · ') || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>{CATEGORY_LABELS[asset.category]}</TableCell>
                    <TableCell>
                      <StatusChip status={asset.status} />
                    </TableCell>
                    <TableCell>
                      {emp ? getEmployeeName(emp.firstName, emp.lastName) : '—'}
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color={warrantyDays <= 30 ? 'warning.main' : 'text.primary'}
                      >
                        {formatDate(asset.warrantyExpiresAt)}
                      </Typography>
                      {warrantyDays <= 90 && warrantyDays >= 0 && (
                        <Typography variant="caption" color="warning.main">
                          {warrantyDays}d left
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">{formatCurrency(asset.currentValue)}</TableCell>
                    <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                      <Tooltip title="View details">
                        <IconButton size="small" onClick={() => navigate(`/assets/${asset.id}`)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </Card>

      <AssetFormDialog open={formOpen} onClose={() => setFormOpen(false)} />
      <AssetImportDialog open={importOpen} onClose={() => setImportOpen(false)} />
    </Box>
  );
}
