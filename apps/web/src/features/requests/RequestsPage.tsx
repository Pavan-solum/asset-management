import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { useAppDispatch, useAppSelector } from '../../hooks/storeHooks';
import { usePermissions } from '../../hooks/storeHooks';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { PageHeader } from '../../components/PageHeader';
import { SearchField } from '../../components/SearchField';
import { EmptyState } from '../../components/EmptyState';
import { isApiEnabled } from '../../services/api/config';
import { fetchAssetRequests, reviewAssetRequest } from '../../services/api/requests';
import { replaceAllRequests, updateRequest } from '../../store/requestsSlice';
import {
  CATEGORY_LABELS,
  REQUEST_STATUS_COLORS,
  REQUEST_STATUS_LABELS,
  REQUEST_TYPE_LABELS,
} from '../../data/demoData';
import type { AssetRequest, AssetRequestStatus } from '../../types';
import { LoadingButton } from '../../components/Loader';
import { ApiError } from '../../services/api/client';

type StatusFilter = 'all' | AssetRequestStatus;

export function RequestsPage() {
  const dispatch = useAppDispatch();
  const requests = useAppSelector((s) => s.requests.items);
  const { can } = usePermissions();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewTarget, setReviewTarget] = useState<AssetRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewAction, setReviewAction] = useState<'approved' | 'rejected' | 'fulfilled' | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadRequests = useCallback(async () => {
    if (!isApiEnabled()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAssetRequests();
      dispatch(replaceAllRequests(data));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return requests.filter((req) => {
      if (statusFilter !== 'all' && req.status !== statusFilter) return false;
      if (!q) return true;
      const haystack = [
        req.employeeName,
        req.employeeEmail,
        req.departmentName,
        req.description,
        REQUEST_TYPE_LABELS[req.requestType],
        CATEGORY_LABELS[req.category],
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [requests, search, statusFilter]);

  const openReview = (req: AssetRequest, action: 'approved' | 'rejected' | 'fulfilled') => {
    setReviewTarget(req);
    setReviewAction(action);
    setReviewNotes(req.reviewNotes ?? '');
  };

  const closeReview = () => {
    setReviewTarget(null);
    setReviewAction(null);
    setReviewNotes('');
  };

  const handleReviewSubmit = async () => {
    if (!reviewTarget || !reviewAction) return;
    setSubmitting(true);
    setError(null);
    try {
      if (isApiEnabled()) {
        const updated = await reviewAssetRequest(reviewTarget.id, reviewAction, reviewNotes || undefined);
        dispatch(updateRequest(updated));
      } else {
        dispatch(
          updateRequest({
            ...reviewTarget,
            status: reviewAction,
            reviewNotes: reviewNotes || undefined,
            reviewedBy: 'Pavan',
            reviewedAt: new Date().toISOString(),
          }),
        );
      }
      closeReview();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to update request');
    } finally {
      setSubmitting(false);
    }
  };

  if (!can('request:review')) {
    return (
      <Box>
        <PageHeader title="Device Requests" breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Requests' }]} />
        <Alert severity="warning">You do not have permission to review device requests.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Device Requests"
        subtitle={`${filtered.length} request${filtered.length === 1 ? '' : 's'} · employee equipment requests`}
        breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Requests' }]}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 2, p: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <SearchField
            placeholder="Search employee, department, description…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1 }}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            >
              <MenuItem value="all">All statuses</MenuItem>
              {Object.entries(REQUEST_STATUS_LABELS).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Card>

      <Card>
        {loading && requests.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>Loading requests…</Box>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<AssignmentIcon />}
            title="No requests found"
            description="Employee device requests will appear here for review."
          />
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Needed by</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((req) => (
                  <TableRow key={req.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {req.employeeName ?? '—'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {req.employeeEmail}
                      </Typography>
                    </TableCell>
                    <TableCell>{req.departmentName ?? '—'}</TableCell>
                    <TableCell>{REQUEST_TYPE_LABELS[req.requestType]}</TableCell>
                    <TableCell>{CATEGORY_LABELS[req.category] ?? req.category}</TableCell>
                    <TableCell sx={{ maxWidth: 240 }}>
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
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        {req.status === 'submitted' && (
                          <>
                            <Tooltip title="Approve">
                              <Button
                                size="small"
                                color="success"
                                startIcon={<CheckCircleIcon />}
                                onClick={() => openReview(req, 'approved')}
                              >
                                Approve
                              </Button>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <Button
                                size="small"
                                color="error"
                                startIcon={<CancelIcon />}
                                onClick={() => openReview(req, 'rejected')}
                              >
                                Reject
                              </Button>
                            </Tooltip>
                          </>
                        )}
                        {req.status === 'approved' && (
                          <Tooltip title="Mark as fulfilled">
                            <Button
                              size="small"
                              startIcon={<DoneAllIcon />}
                              onClick={() => openReview(req, 'fulfilled')}
                            >
                              Fulfill
                            </Button>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      <Dialog open={Boolean(reviewTarget)} onClose={closeReview} maxWidth="sm" fullWidth>
        <DialogTitle>
          {reviewAction === 'approved' && 'Approve request'}
          {reviewAction === 'rejected' && 'Reject request'}
          {reviewAction === 'fulfilled' && 'Mark request fulfilled'}
        </DialogTitle>
        <DialogContent>
          {reviewTarget && (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {reviewTarget.employeeName} · {REQUEST_TYPE_LABELS[reviewTarget.requestType]} ·{' '}
                {CATEGORY_LABELS[reviewTarget.category]}
              </Typography>
              <Typography variant="body2">{reviewTarget.description}</Typography>
              <TextField
                label="Notes for employee (optional)"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                multiline
                minRows={3}
                fullWidth
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeReview}>Cancel</Button>
          <LoadingButton
            variant="contained"
            color={reviewAction === 'rejected' ? 'error' : 'primary'}
            loading={submitting}
            onClick={handleReviewSubmit}
          >
            Confirm
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
