import { useMemo, useState } from 'react';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/storeHooks';
import { PageHeader } from '../../components/PageHeader';
import { EmptyState } from '../../components/EmptyState';
import { formatCurrency, formatDate } from '../../utils/format';
import { CATEGORY_LABELS } from '../../data/demoData';

export function FinancePage() {
  const navigate = useNavigate();
  const assets = useAppSelector((s) => s.assets.items);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const paginated = assets.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const totalPurchaseCost = useMemo(() => assets.reduce((sum, a) => sum + a.purchaseCost, 0), [assets]);
  const totalCurrentValue = useMemo(() => assets.reduce((sum, a) => sum + a.currentValue, 0), [assets]);
  const totalDepreciation = totalPurchaseCost - totalCurrentValue;

  return (
    <Box>
      <PageHeader
        title="Finance"
        subtitle="Manage asset costs, value, and depreciation"
      />

      {assets.length > 0 && (
        <Box sx={{ display: 'flex', gap: 2, mb: 3, mt: 2 }}>
          <Card sx={{ p: 2, flex: 1, borderLeft: '4px solid #1565C0' }}>
            <Typography variant="body2" color="text.secondary">Total Purchase Cost</Typography>
            <Typography variant="h5" fontWeight={700}>{formatCurrency(totalPurchaseCost)}</Typography>
          </Card>
          <Card sx={{ p: 2, flex: 1, borderLeft: '4px solid #2E7D32' }}>
            <Typography variant="body2" color="text.secondary">Current Book Value</Typography>
            <Typography variant="h5" fontWeight={700}>{formatCurrency(totalCurrentValue)}</Typography>
          </Card>
          <Card sx={{ p: 2, flex: 1, borderLeft: '4px solid #D32F2F' }}>
            <Typography variant="body2" color="text.secondary">Total Depreciation</Typography>
            <Typography variant="h5" fontWeight={700}>{formatCurrency(totalDepreciation)}</Typography>
          </Card>
        </Box>
      )}

      <Card>
        {assets.length === 0 ? (
          <EmptyState
            icon={<AttachMoneyIcon />}
            title="No financial data"
            description="Add assets with purchase costs to see financial tracking."
          />
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Asset</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Purchase Date</TableCell>
                    <TableCell align="right">Purchase Cost</TableCell>
                    <TableCell align="right">Current Value</TableCell>
                    <TableCell align="right">Depreciation</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginated.map((asset) => {
                    const depreciation = asset.purchaseCost - asset.currentValue;
                    return (
                      <TableRow
                        key={asset.id}
                        hover
                        sx={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/assets/${asset.id}`)}
                      >
                        <TableCell>
                          <Box component="span" sx={{ fontWeight: 600, fontSize: '0.875rem', display: 'block' }}>
                            {asset.assetTag}
                          </Box>
                          <Box component="span" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                            {asset.name}
                          </Box>
                        </TableCell>
                        <TableCell>{CATEGORY_LABELS[asset.category] || asset.category}</TableCell>
                        <TableCell>{formatDate(asset.purchaseDate) || '—'}</TableCell>
                        <TableCell align="right">{formatCurrency(asset.purchaseCost)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 500 }}>{formatCurrency(asset.currentValue)}</TableCell>
                        <TableCell align="right" sx={{ color: 'error.main' }}>
                          {depreciation > 0 ? `-${formatCurrency(depreciation)}` : '—'}
                        </TableCell>
                        <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                          <Tooltip title="View asset">
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
              count={assets.length}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              rowsPerPageOptions={[10, 25, 50]}
            />
          </>
        )}
      </Card>
    </Box>
  );
}
