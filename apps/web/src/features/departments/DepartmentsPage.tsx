import { Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import { useAppSelector } from '../../hooks/storeHooks';
import { PageHeader } from '../../components/PageHeader';

export function DepartmentsPage() {
  const departments = useAppSelector((s) => s.departments.items);
  const employees = useAppSelector((s) => s.employees.items);

  const countByDept = employees.reduce<Record<string, number>>((acc, e) => {
    acc[e.departmentId] = (acc[e.departmentId] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <Box>
      <PageHeader
        title="Departments"
        subtitle="Organizational structure and cost centers"
        breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Departments' }]}
      />

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <BusinessIcon fontSize="inherit" sx={{ opacity: 0.6 }} />
                    Department
                  </Box>
                </TableCell>
                <TableCell>Cost Center</TableCell>
                <TableCell align="right">Employees</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {departments.map((dept) => (
                <TableRow key={dept.id} hover>
                  <TableCell>
                    <Box component="span" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      {dept.name}
                    </Box>
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
