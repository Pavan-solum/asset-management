import { useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Chip, IconButton 
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useAppDispatch, useAppSelector } from '../../hooks/storeHooks';
import { fetchLeaveRequests, updateLeaveRequestStatus } from '../../services/api/hr';
import { setLeaveRequests, updateLeaveRequestStatus as setStatusInStore } from '../../store/hrSlice';
import { PageHeader } from '../../components/PageHeader';
import { startLoading, stopLoading } from '../../store/uiSlice';

export function HRPage() {
  const dispatch = useAppDispatch();
  const requests = useAppSelector(s => s.hr.leaveRequests);
  const employees = useAppSelector(s => s.employees.items);
  
  useEffect(() => {
    dispatch(startLoading('Loading HR data...'));
    fetchLeaveRequests()
      .then(data => dispatch(setLeaveRequests(data)))
      .catch(console.error)
      .finally(() => dispatch(stopLoading()));
  }, [dispatch]);

  const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const updated = await updateLeaveRequestStatus(id, status);
      dispatch(setStatusInStore({ id, status, approvedBy: updated.approvedBy || '' }));
    } catch (e) {
      console.error(e);
      alert('Failed to update status');
    }
  };

  const getEmployeeName = (id: string) => {
    const emp = employees.find(e => e.id === id);
    return emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown';
  };

  return (
    <Box>
      <PageHeader title="HR Management & Leave Policies" />
      
      <Paper sx={{ mt: 3, p: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>Pending Leave Requests</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Dates</TableCell>
                <TableCell>Days</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">No leave requests found.</TableCell>
                </TableRow>
              ) : requests.map(req => (
                <TableRow key={req.id}>
                  <TableCell>{getEmployeeName(req.employeeId)}</TableCell>
                  <TableCell>{req.leaveType}</TableCell>
                  <TableCell>{req.startDate} to {req.endDate}</TableCell>
                  <TableCell>{req.daysCount}</TableCell>
                  <TableCell>{req.reason || '-'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={req.status} 
                      color={req.status === 'approved' ? 'success' : req.status === 'rejected' ? 'error' : 'warning'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell align="right">
                    {req.status === 'pending' && (
                      <>
                        <IconButton color="success" onClick={() => handleStatusUpdate(req.id, 'approved')}>
                          <CheckCircleIcon />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleStatusUpdate(req.id, 'rejected')}>
                          <CancelIcon />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
