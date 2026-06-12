import { Box, Card, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useAppSelector } from '../../hooks/storeHooks';

export function DepartmentsPage() {
  const departments = useAppSelector((s) => s.departments.items);
  const employees = useAppSelector((s) => s.employees.items);

  const countByDept = employees.reduce<Record<string, number>>((acc, e) => {
    acc[e.departmentId] = (acc[e.departmentId] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Departments
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Organizational structure and cost centers
      </Typography>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Department</TableCell>
                <TableCell>Cost Center</TableCell>
                <TableCell align="right">Employees</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {departments.map((dept) => (
                <TableRow key={dept.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {dept.name}
                    </Typography>
                  </TableCell>
                  <TableCell>{dept.costCenter}</TableCell>
                  <TableCell align="right">{countByDept[dept.id] ?? 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
