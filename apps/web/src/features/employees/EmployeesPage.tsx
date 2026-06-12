import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import InventoryIcon from '@mui/icons-material/Inventory2';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/storeHooks';
import { usePermissions } from '../../hooks/storeHooks';
import { getEmployeeName } from '../../utils/format';
import { employeeMatchesSearch } from '../../utils/search';

export function EmployeesPage() {
  const navigate = useNavigate();
  const employees = useAppSelector((s) => s.employees.items);
  const departments = useAppSelector((s) => s.departments.items);
  const assets = useAppSelector((s) => s.assets.items);
  const { can } = usePermissions();
  const [search, setSearch] = useState('');

  const deptMap = useMemo(
    () => Object.fromEntries(departments.map((d) => [d.id, d.name])),
    [departments],
  );

  const filteredEmployees = useMemo(
    () =>
      employees.filter((emp) =>
        employeeMatchesSearch(emp, search, deptMap[emp.departmentId]),
      ),
    [employees, search, deptMap],
  );

  const assetCountByEmployee = useMemo(() => {
    const map: Record<string, number> = {};
    assets.forEach((a) => {
      if (a.assignedEmployeeId) {
        map[a.assignedEmployeeId] = (map[a.assignedEmployeeId] ?? 0) + 1;
      }
    });
    return map;
  }, [assets]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Employees
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {filteredEmployees.length} employees · asset allocation tracking
          </Typography>
        </Box>
        {can('employee:write') && (
          <Button startIcon={<AddIcon />} variant="contained" disabled>
            Add Employee
          </Button>
        )}
      </Box>

      <Card sx={{ mb: 2, p: 2 }}>
        <TextField
          size="small"
          placeholder="Search name, email, department, job title, employee #..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 360 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Card>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee #</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Job Title</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Assets</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEmployees.map((emp) => (
                <TableRow
                  key={emp.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/employees/${emp.id}`)}
                >
                  <TableCell>{emp.employeeNumber}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {getEmployeeName(emp.firstName, emp.lastName)}
                    </Typography>
                  </TableCell>
                  <TableCell>{emp.email}</TableCell>
                  <TableCell>{deptMap[emp.departmentId] ?? '—'}</TableCell>
                  <TableCell>{emp.jobTitle}</TableCell>
                  <TableCell>
                    <Chip
                      label={emp.status}
                      size="small"
                      color={emp.status === 'active' ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={assetCountByEmployee[emp.id] ?? 0} size="small" />
                  </TableCell>
                  <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="View assigned assets">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/employees/${emp.id}`)}
                      >
                        <InventoryIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
