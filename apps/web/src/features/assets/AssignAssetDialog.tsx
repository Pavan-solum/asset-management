import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../hooks/storeHooks';
import { assignAsset, returnAsset } from '../../store/assetsSlice';
import { addAuditLog } from '../../store/auditSlice';
import { getEmployeeName } from '../../utils/format';

interface AssignProps {
  open: boolean;
  onClose: () => void;
  assetId: string;
  assetTag: string;
}

export function AssignAssetDialog({ open, onClose, assetId, assetTag }: AssignProps) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const employees = useAppSelector((s) => s.employees.items);
  const [employeeId, setEmployeeId] = useState('');
  const [notes, setNotes] = useState('');

  const handleAssign = () => {
    if (!employeeId || !user) return;
    const emp = employees.find((e) => e.id === employeeId)!;
    dispatch(
      assignAsset({
        assetId,
        employeeId,
        assignedBy: `${user.firstName} ${user.lastName}`,
        notes,
      }),
    );
    dispatch(
      addAuditLog({
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        action: 'ASSIGN',
        entityType: 'asset',
        entityId: assetId,
        entityLabel: assetTag,
        details: `Assigned to ${getEmployeeName(emp.firstName, emp.lastName)}`,
      }),
    );
    setEmployeeId('');
    setNotes('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Assign Asset {assetTag}</DialogTitle>
      <DialogContent>
        <TextField
          select
          fullWidth
          label="Employee"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          sx={{ mt: 1, mb: 2 }}
        >
          {employees
            .filter((e) => e.status === 'active')
            .map((e) => (
              <MenuItem key={e.id} value={e.id}>
                {getEmployeeName(e.firstName, e.lastName)} ({e.employeeNumber})
              </MenuItem>
            ))}
        </TextField>
        <TextField
          fullWidth
          multiline
          rows={2}
          label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleAssign} disabled={!employeeId}>
          Assign
        </Button>
      </DialogActions>
    </Dialog>
  );
}

interface ReturnProps {
  open: boolean;
  onClose: () => void;
  assetId: string;
  assetTag: string;
}

export function ReturnAssetDialog({ open, onClose, assetId, assetTag }: ReturnProps) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const [condition, setCondition] = useState('Good condition');

  const handleReturn = () => {
    if (!user) return;
    dispatch(
      returnAsset({
        assetId,
        performedBy: `${user.firstName} ${user.lastName}`,
        returnCondition: condition,
      }),
    );
    dispatch(
      addAuditLog({
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        action: 'RETURN',
        entityType: 'asset',
        entityId: assetId,
        entityLabel: assetTag,
        details: `Returned — ${condition}`,
      }),
    );
    setCondition('Good condition');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Return Asset {assetTag}</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Return Condition"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="warning" onClick={handleReturn}>
          Process Return
        </Button>
      </DialogActions>
    </Dialog>
  );
}
