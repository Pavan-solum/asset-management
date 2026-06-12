import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InventoryIcon from '@mui/icons-material/Inventory2';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { useAppSelector } from '../../hooks/storeHooks';
import { StatusChip } from '../../components/StatusChip';
import { formatCurrency, formatDate, getEmployeeName } from '../../utils/format';
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

export function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const employee = useAppSelector((s) => s.employees.items.find((e) => e.id === id));
  const departments = useAppSelector((s) => s.departments.items);
  const assets = useAppSelector((s) =>
    s.assets.items.filter((a) => a.assignedEmployeeId === id),
  );

  if (!employee) {
    return (
      <Box>
        <Alert severity="error">Employee not found</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/employees')} sx={{ mt: 2 }}>
          Back to Employees
        </Button>
      </Box>
    );
  }

  const department = departments.find((d) => d.id === employee.departmentId);

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/employees" underline="hover" color="inherit">
          Employees
        </Link>
        <Typography color="text.primary">
          {getEmployeeName(employee.firstName, employee.lastName)}
        </Typography>
      </Breadcrumbs>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            {getEmployeeName(employee.firstName, employee.lastName)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {employee.employeeNumber} · {employee.jobTitle}
          </Typography>
        </Box>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/employees')}>
          Back
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Employee Details
              </Typography>
              <Divider sx={{ mb: 1 }} />
              <DetailRow label="Email" value={employee.email} />
              <DetailRow label="Department" value={department?.name ?? '—'} />
              <DetailRow label="Hire Date" value={formatDate(employee.hireDate)} />
              <DetailRow
                label="Status"
                value={
                  <Chip
                    label={employee.status}
                    size="small"
                    color={employee.status === 'active' ? 'success' : 'default'}
                    variant="outlined"
                  />
                }
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={7}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <InventoryIcon color="primary" />
                <Typography variant="h6">Assigned Assets ({assets.length})</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {assets.length === 0 ? (
                <Typography color="text.secondary">No assets currently assigned to this employee.</Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Asset Tag</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Value</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {assets.map((asset) => (
                        <TableRow
                          key={asset.id}
                          hover
                          sx={{ cursor: 'pointer' }}
                          onClick={() => navigate(`/assets/${asset.id}`)}
                        >
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {asset.assetTag}
                            </Typography>
                          </TableCell>
                          <TableCell>{asset.name}</TableCell>
                          <TableCell>{CATEGORY_LABELS[asset.category]}</TableCell>
                          <TableCell>
                            <StatusChip status={asset.status} />
                          </TableCell>
                          <TableCell align="right">{formatCurrency(asset.currentValue)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
