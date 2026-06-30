import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Chip,
  alpha,
} from '@mui/material';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import RoomOutlinedIcon from '@mui/icons-material/RoomOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import { MeetingData } from './MeetingCard';

interface ViewAgendaModalProps {
  open: boolean;
  onClose: () => void;
  meeting: MeetingData | null;
}

interface AgendaItem {
  id: string;
  time: string;
  topic: string;
  speaker: string;
  completed: boolean;
}

export function ViewAgendaModal({ open, onClose, meeting }: ViewAgendaModalProps) {
  const [items, setItems] = useState<AgendaItem[]>([
    { id: '1', time: '09:00 - 09:15 AM', topic: 'Welcome & Executive Summary', speaker: 'CEO / Board Chair', completed: true },
    { id: '2', time: '09:15 - 09:45 AM', topic: 'Q3 Financial Review & Performance KPIs', speaker: 'CFO', completed: false },
    { id: '3', time: '09:45 - 10:15 AM', topic: 'Product Development & Strategic Expansion Plan', speaker: 'VP of Product', completed: false },
    { id: '4', time: '10:15 - 10:30 AM', topic: 'Compliance & Governance Sign-off Roundtable', speaker: 'General Counsel', completed: false },
  ]);

  const handleToggleComplete = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  if (!meeting) return null;

  const isVirtual = meeting.location.toLowerCase().includes('virtual') || meeting.location.toLowerCase().includes('online') || meeting.location.toLowerCase().includes('video');

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: { borderRadius: 3, p: 1 },
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 800, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h6" fontWeight={800} sx={{ fontSize: '1.25rem', lineHeight: 1.2 }}>
            {meeting.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Agenda & Briefing Materials
          </Typography>
        </Box>
        <Chip
          label={meeting.status}
          size="small"
          color={meeting.status === 'CONFIRMED' ? 'primary' : meeting.status === 'COMPLETED' ? 'success' : 'default'}
          sx={{ fontWeight: 700, borderRadius: '6px', fontSize: '0.7rem' }}
        />
      </DialogTitle>

      <DialogContent dividers sx={{ borderColor: 'divider', py: 2.5 }}>
        {/* Info row */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarTodayOutlinedIcon color="action" fontSize="small" />
            <Typography variant="body2" fontWeight={600} color="text.secondary">
              {meeting.date} &bull; {meeting.time}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isVirtual ? (
              <VideocamOutlinedIcon color="action" fontSize="small" />
            ) : (
              <RoomOutlinedIcon color="action" fontSize="small" />
            )}
            <Typography variant="body2" fontWeight={600} color="text.secondary">
              {meeting.location}
            </Typography>
          </Box>
        </Box>

        {/* Section: Timeline Items */}
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.05em', mb: 1.5 }}>
          SCHEDULED TOPICS
        </Typography>

        <List disablePadding sx={{ mb: 4 }}>
          {items.map((item, index) => (
            <Box key={item.id}>
              {index > 0 && <Divider variant="inset" component="li" sx={{ borderColor: 'divider', opacity: 0.5 }} />}
              <ListItem
                secondaryAction={
                  <Checkbox
                    edge="end"
                    checked={item.completed}
                    onChange={() => handleToggleComplete(item.id)}
                    color="success"
                  />
                }
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  transition: 'background-color 0.2s',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: item.completed ? 'success.main' : 'text.disabled' }}>
                  <CheckCircleOutlineIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{
                        textDecoration: item.completed ? 'line-through' : 'none',
                        color: item.completed ? 'text.secondary' : 'text.primary',
                      }}
                    >
                      {item.topic}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                      Time: {item.time} &bull; Presenter: <strong>{item.speaker}</strong>
                    </Typography>
                  }
                />
              </ListItem>
            </Box>
          ))}
        </List>

        {/* Section: Documents */}
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.05em', mb: 1.5 }}>
          ASSOCIATED DOCUMENTS
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {[
            { name: 'Board_Q4_Briefing_v2.pdf', size: '2.4 MB', type: 'PDF' },
            { name: 'Financial_Projections_FY25.xlsx', size: '1.2 MB', type: 'XLSX' },
          ].map((doc, idx) => (
            <Box
              key={idx}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1.5,
                borderRadius: 2.5,
                bgcolor: (theme) => alpha(theme.palette.text.primary, 0.02),
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                <InsertDriveFileOutlinedIcon color="primary" fontSize="small" />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600} noWrap sx={{ fontSize: '0.85rem' }}>
                    {doc.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {doc.type} &bull; {doc.size}
                  </Typography>
                </Box>
              </Box>
              <Button
                size="small"
                variant="outlined"
                sx={{
                  borderRadius: '16px',
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  px: 2,
                }}
              >
                View
              </Button>
            </Box>
          ))}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, pt: 1.5 }}>
        <Button
          onClick={onClose}
          variant="contained"
          color="primary"
          sx={{
            borderRadius: '20px',
            px: 4,
            fontWeight: 700,
            textTransform: 'none',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? '#1E88E5' : '#0D47A1',
            '&:hover': {
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? '#1565C0' : '#0A192F',
            },
          }}
        >
          Dismiss
        </Button>
      </DialogActions>
    </Dialog>
  );
}
