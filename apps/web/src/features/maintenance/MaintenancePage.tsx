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
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BuildIcon from '@mui/icons-material/Build';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/storeHooks';
import { StatusChip } from '../../components/StatusChip';
import { PageHeader } from '../../components/PageHeader';
import { EmptyState } from '../../components/EmptyState';
import { getEmployeeName } from '../../utils/format';
import { CATEGORY_LABELS } from '../../data/demoData';

export function MaintenancePage() {
  const navigate = useNavigate();
  const assets = useAppSelector((s) => s.assets.items);
  const employees = useAppSelector((s) => s.employees.items);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const employeeMap = useMemo(
    () => Object.fromEntries(employees.map((e) => [e.id, e])),
    [employees],
  );

  const filtered = useMemo(() => {
    return assets.filter((a) => a.status === 'in_repair' || a.lifecycleStage === 'maintenance');
  }, [assets]);

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <PageHeader
        title="Maintenance"
        subtitle={`${filtered.length} assets currently in maintenance or repair`}
      />

      <Card sx={{ mt: 2 }}>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<BuildIcon />}
            title="No assets in maintenance"
            description="When assets are marked as 'in_repair' or their lifecycle stage is 'maintenance', they will appear here."
          />
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 'calc(100vh - 240px)' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Asset</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Assigned To</TableCell>
                    <TableCell>Lifecycle Stage</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginated.map((asset) => {
                    const emp = asset.assignedEmployeeId ? employeeMap[asset.assignedEmployeeId] : null;
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
                        <TableCell>
                          <StatusChip status={asset.status} />
                        </TableCell>
                        <TableCell>
                          {emp ? getEmployeeName(emp.firstName, emp.lastName) : '—'}
                        </TableCell>
                        <TableCell sx={{ textTransform: 'capitalize' }}>
                          {asset.lifecycleStage.replace('_', ' ')}
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
              count={filtered.length}
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
