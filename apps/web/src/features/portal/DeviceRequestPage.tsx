import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useAppDispatch, useAppSelector, useAuthUser } from '../../hooks/storeHooks';
import { isApiEnabled } from '../../services/api/config';
import { createAssetRequest, fetchAssetRequests } from '../../services/api/requests';
import { addRequest, replaceAllRequests } from '../../store/requestsSlice';
import {
  CATEGORY_LABELS,
  DEMO_DEPARTMENTS,
  DEMO_EMPLOYEES,
  DEMO_TENANT,
  REQUEST_STATUS_COLORS,
  REQUEST_STATUS_LABELS,
  REQUEST_TYPE_LABELS,
} from '../../data/demoData';
import { REQUEST_CATEGORIES, type AssetRequestType } from '../../types';
import { LoadingButton } from '../../components/Loader';
import { ApiError } from '../../services/api/client';

const REQUEST_TYPES: AssetRequestType[] = ['new', 'replacement', 'accessory'];

export function DeviceRequestPage() {
  const dispatch = useAppDispatch();
  const user = useAuthUser();
  const allRequests = useAppSelector((s) => s.requests.items);
  const departments = useAppSelector((s) => s.departments.items);
  const employees = useAppSelector((s) => s.employees.items);

  const [requestType, setRequestType] = useState<AssetRequestType>('new');
  const [category, setCategory] = useState(REQUEST_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [neededBy, setNeededBy] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const employeeProfile = useMemo(() => {
    if (!user?.employeeId) {
      return employees.find((e) => e.email.toLowerCase() === user?.email.toLowerCase());
    }
    return employees.find((e) => e.id === user.employeeId) ?? DEMO_EMPLOYEES.find((e) => e.id === user.employeeId);
  }, [employees, user]);

  const deptMap = useMemo(() => {
    const source = departments.length > 0 ? departments : DEMO_DEPARTMENTS;
    return Object.fromEntries(source.map((d) => [d.id, d.name]));
  }, [departments]);

  const myRequests = useMemo(() => {
    const employeeId = user?.employeeId ?? employeeProfile?.id;
    if (!employeeId) return allRequests.filter((r) => r.employeeEmail === user?.email);
    return allRequests.filter((r) => r.employeeId === employeeId);
  }, [allRequests, user, employeeProfile]);

  const loadRequests = useCallback(async () => {
    if (!isApiEnabled()) return;
    setFetching(true);
    try {
      const data = await fetchAssetRequests();
      dispatch(replaceAllRequests(data));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to load your requests');
    } finally {
      setFetching(false);
    }
  }, [dispatch]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!description.trim()) {
      setError('Please describe what you need and why.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        requestType,
        category,
        description: description.trim(),
        neededBy: neededBy || undefined,
      };

      if (isApiEnabled()) {
        const created = await createAssetRequest(payload);
        dispatch(addRequest(created));
      } else {
        dispatch(
          addRequest({
            id: `req-${Date.now()}`,
            tenantId: DEMO_TENANT.id,
            employeeId: user?.employeeId ?? employeeProfile?.id ?? 'unknown',
            requestType,
            category,
            description: description.trim(),
            neededBy: neededBy || undefined,
            status: 'submitted',
            createdAt: new Date().toISOString(),
            employeeName: user ? `${user.firstName} ${user.lastName}` : undefined,
            employeeEmail: user?.email,
            departmentName: employeeProfile ? deptMap[employeeProfile.departmentId] : undefined,
          }),
        );
      }

      setDescription('');
      setNeededBy('');
      setSuccess('Your request has been submitted. IT will review it shortly.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Request a Device or Accessory
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Submit a request for new equipment, a replacement, or accessories. IT will review and follow up.
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Your details
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mb: 1 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Name
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {user?.firstName} {user?.lastName}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {user?.email}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Department
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {employeeProfile ? deptMap[employeeProfile.departmentId] ?? '—' : '—'}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent component="form" onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" onClose={() => setSuccess(null)}>
                {success}
              </Alert>
            )}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth required>
                <InputLabel>Request type</InputLabel>
                <Select
                  label="Request type"
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value as AssetRequestType)}
                >
                  {REQUEST_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {REQUEST_TYPE_LABELS[type]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  label="Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as typeof category)}
                >
                  {REQUEST_CATEGORIES.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {CATEGORY_LABELS[cat]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <TextField
              label="Business justification"
              placeholder="Describe what you need and why it is required for your work…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              multiline
              minRows={4}
              fullWidth
            />

            <TextField
              label="Needed by (optional)"
              type="date"
              value={neededBy}
              onChange={(e) => setNeededBy(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ maxWidth: 280 }}
            />

            <Box>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={loading}
                startIcon={<SendIcon />}
                sx={{ minWidth: 160 }}
              >
                Submit request
              </LoadingButton>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
        My requests
      </Typography>

      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Needed by</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Submitted</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fetching && myRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    Loading…
                  </TableCell>
                </TableRow>
              ) : myRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No requests yet. Submit your first request above.
                  </TableCell>
                </TableRow>
              ) : (
                myRequests.map((req) => (
                  <TableRow key={req.id} hover>
                    <TableCell>{REQUEST_TYPE_LABELS[req.requestType]}</TableCell>
                    <TableCell>{CATEGORY_LABELS[req.category] ?? req.category}</TableCell>
                    <TableCell sx={{ maxWidth: 280 }}>
                      <Typography variant="body2" noWrap title={req.description}>
                        {req.description}
                      </Typography>
                    </TableCell>
                    <TableCell>{req.neededBy ?? '—'}</TableCell>
                    <TableCell>
                      <Chip
                        label={REQUEST_STATUS_LABELS[req.status]}
                        size="small"
                        color={REQUEST_STATUS_COLORS[req.status]}
                      />
                    </TableCell>
                    <TableCell>{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
