import { Chip } from '@mui/material';
import type { AssetStatus } from '../types';
import { STATUS_COLORS, STATUS_LABELS } from '../data/demoData';

export function StatusChip({ status }: { status: AssetStatus | string }) {
  return (
    <Chip
      label={STATUS_LABELS[status] ?? status}
      color={STATUS_COLORS[status] ?? 'default'}
      size="small"
      variant="outlined"
    />
  );
}
