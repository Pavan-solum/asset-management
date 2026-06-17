import { useEffect, useState } from 'react';
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
import { addEmployee, updateEmployee } from '../../store/employeesSlice';
import { addAuditLog } from '../../store/auditSlice';
import { LoadingButton } from '../../components/Loader';
import { reloadFromApi } from '../../components/DataBootstrap';
import { isApiEnabled } from '../../services/api/config';
import { createEmployee, updateEmployee as updateEmployeeApi } from '../../services/api/entities';
import type { Employee, EmployeeStatus } from '../../types';

interface Props {
  open: boolean;
  onClose: () => void;
  employee?: Employee;
}

export function EmployeeFormDialog({ open, onClose, employee }: Props) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const departments = useAppSelector((s) => s.departments.items);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    employeeNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    jobTitle: '',
    departmentId: '',
    status: 'active' as EmployeeStatus,
    hireDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (open && employee) {
      setForm({
        employeeNumber: employee.employeeNumber,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        jobTitle: employee.jobTitle,
        departmentId: employee.departmentId,
        status: employee.status,
        hireDate: employee.hireDate,
      });
    } else if (open) {
      setForm({
        employeeNumber: '',
        firstName: '',
        lastName: '',
        email: '',
        jobTitle: '',
        departmentId: departments[0]?.id ?? '',
        status: 'active',
        hireDate: new Date().toISOString().split('T')[0],
      });
    }
  }, [open, employee, departments]);

  const handleSave = async () => {
    if (!user || loading || !form.firstName || !form.email) return;
    setLoading(true);
    const userName = `${user.firstName} ${user.lastName}`;
    try {
      if (isApiEnabled()) {
        if (employee) {
          await updateEmployeeApi(employee.id, form);
        } else {
          await createEmployee({ ...form, id: crypto.randomUUID() });
        }
        await reloadFromApi(dispatch);
      } else if (employee) {
        dispatch(updateEmployee({ ...employee, ...form }));
      } else {
        dispatch(addEmployee(form));
      }
      if (!isApiEnabled()) {
        dispatch(
          addAuditLog({
            userId: user.id,
            userName,
            action: employee ? 'UPDATE' : 'CREATE',
            entityType: 'employee',
            entityId: employee?.id ?? 'new',
            entityLabel: `${form.firstName} ${form.lastName}`,
            details: employee ? 'Employee updated' : 'Employee created',
          }),
        );
      }
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{employee ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="First name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Employee #" value={form.employeeNumber} onChange={(e) => setForm({ ...form, employeeNumber: e.target.value })} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Job title" value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField select fullWidth label="Department" value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })}>
              {departments.map((d) => (
                <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth type="date" label="Hire date" InputLabelProps={{ shrink: true }} value={form.hireDate} onChange={(e) => setForm({ ...form, hireDate: e.target.value })} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <LoadingButton variant="contained" onClick={() => void handleSave()} loading={loading} disabled={!form.firstName || !form.email}>
          Save
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
