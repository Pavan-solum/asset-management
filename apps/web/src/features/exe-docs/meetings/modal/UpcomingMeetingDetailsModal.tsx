import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Chip,
  Button,
  Grid,
  TextField,
  IconButton,
  Avatar,
  Paper,
  alpha,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import RoomOutlinedIcon from '@mui/icons-material/RoomOutlined';
import AddIcon from '@mui/icons-material/Add';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CloudDoneOutlinedIcon from '@mui/icons-material/CloudDoneOutlined';
import { MeetingData } from './MeetingCard';

interface UpcomingMeetingDetailsModalProps {
  open: boolean;
  onClose: () => void;
  meeting: MeetingData | null;
  onSave: (meeting: MeetingData) => void;
  onStatusChange?: (id: string, newStatus: 'CONFIRMED' | 'TENTATIVE' | 'COMPLETED') => void;
}

export function UpcomingMeetingDetailsModal({
  open,
  onClose,
  meeting,
  onSave,
  onStatusChange,
}: UpcomingMeetingDetailsModalProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [agendaItems, setAgendaItems] = useState<string[]>([]);
  const [attendees, setAttendees] = useState([
    { name: 'Sarah Jenkins', role: 'Chairperson', status: 'Present', color: 'success.main' },
    { name: 'Marcus Halloway', role: 'Legal Counsel', status: 'Pending', color: 'text.secondary' },
    { name: 'David Chen', role: 'CFO', status: 'Absent', color: 'error.main' },
  ]);

  const [files, setFiles] = useState([
    { name: 'Q3_Performance_Report.pdf', size: '2.4 MB', updated: 'Updated 2 days ago', type: 'pdf' },
    { name: '2024_Strategic_Goals.docx', size: '1.1 MB', updated: 'Updated yesterday', type: 'docx' },
  ]);

  useEffect(() => {
    if (meeting) {
      setTitle(meeting.title);
      setDate(meeting.date);
      setTime(meeting.time);
      setLocation(meeting.location);
      setAgendaItems(
        meeting.participants && meeting.participants.length > 0
          ? [
              'Q3 Performance Recap & Key Learnings',
              'Q4 Strategic Roadmap & Resource Allocation',
              'Risk Assessment & Mitigation Strategies',
            ]
          : ['Q3 Performance Recap & Key Learnings', 'Q4 Strategic Roadmap & Resource Allocation']
      );
    }
  }, [meeting, open]);

  if (!meeting) return null;

  const handleMarkAsCompleted = () => {
    if (onStatusChange) {
      onStatusChange(meeting.id, 'COMPLETED');
    }
    onClose();
  };

  const handleSaveChanges = () => {
    onSave({
      ...meeting,
      title,
      date,
      time,
      location,
    });
    onClose();
  };

  const handleAddAgendaItem = () => {
    setAgendaItems((prev) => [...prev, 'New Agenda Item']);
  };

  const inputFieldStyle = {
    mt: 1,
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      bgcolor: (theme: any) => theme.palette.mode === 'dark' ? '#1E293B' : '#F8FAFC',
      '& fieldset': {
        borderColor: (theme: any) => theme.palette.mode === 'dark' ? '#334155' : '#E2E8F0',
      },
      '&:hover fieldset': {
        borderColor: (theme: any) => theme.palette.mode === 'dark' ? '#475569' : '#CBD5E1',
      },
      '&.Mui-focused fieldset': {
        borderColor: 'primary.main',
      },
    },
  };

  const labelStyle = {
    fontWeight: 700,
    fontSize: '0.75rem',
    color: 'text.secondary',
  };

  const sectionCardStyle = {
    p: 3,
    borderRadius: 3,
    border: '1px solid',
    borderColor: (theme: any) => theme.palette.mode === 'dark' ? '#334155' : '#E2E8F0',
    bgcolor: 'background.paper',
    boxShadow: 'none',
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      scroll="body"
      slotProps={{
        paper: {
          sx: {
            borderRadius: '16px',
            bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0B0F14' : '#F8FAFC',
            backgroundImage: 'none',
          },
        },
      }}
    >
      {/* Close button top right */}
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 16,
          top: 16,
          color: 'text.secondary',
          bgcolor: (theme) => alpha(theme.palette.text.primary, 0.04),
          '&:hover': { bgcolor: 'action.hover' },
          zIndex: 10,
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ p: { xs: 3, md: 5 } }}>
        {/* Top Header Row */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
            <Chip
              label="Upcoming"
              size="small"
              icon={
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    ml: 1,
                  }}
                />
              }
              sx={{
                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(21, 101, 192, 0.15)' : 'rgba(21, 101, 192, 0.08)',
                color: 'primary.main',
                fontWeight: 700,
                fontSize: '0.65rem',
                borderRadius: '4px',
                '& .MuiChip-icon': { ml: 0.5, mr: -0.5 },
              }}
            />
            <Chip
              label={`Scheduled for ${date}`}
              size="small"
              sx={{
                bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1E293B' : '#E2E8F0',
                color: 'text.secondary',
                fontWeight: 700,
                fontSize: '0.65rem',
                borderRadius: '4px',
              }}
            />
          </Box>

           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em' }}>
              {title}
            </Typography>
          </Box>
        </Box>

        {/* Layout Grid */}
        <Grid container spacing={4}>
          {/* Left Column (Meeting Details & Agenda Items) */}
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {/* Meeting Details Card */}
              <Paper sx={sectionCardStyle}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <InfoOutlinedIcon sx={{ color: '#0D47A1' }} />
                    <Typography variant="h6" fontWeight={800}>
                      Meeting Details
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Meeting ID: #REV-2024-Q4
                  </Typography>
                </Box>

                <Grid container spacing={2.5}>
                  {/* Meeting Title Input */}
                  <Grid item xs={12}>
                    <Typography sx={labelStyle}>Meeting Title</Typography>
                    <TextField
                      fullWidth
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      sx={inputFieldStyle}
                    />
                  </Grid>

                  {/* Date Input */}
                  <Grid item xs={12} sm={6}>
                    <Typography sx={labelStyle}>Date</Typography>
                    <TextField
                      fullWidth
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <CalendarTodayOutlinedIcon
                            sx={{ color: 'text.secondary', fontSize: '1.1rem' }}
                          />
                        ),
                      }}
                      sx={inputFieldStyle}
                    />
                  </Grid>

                  {/* Time Input */}
                  <Grid item xs={12} sm={6}>
                    <Typography sx={labelStyle}>Time</Typography>
                    <TextField
                      fullWidth
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <AccessTimeOutlinedIcon
                            sx={{ color: 'text.secondary', fontSize: '1.1rem' }}
                          />
                        ),
                      }}
                      sx={inputFieldStyle}
                    />
                  </Grid>

                  {/* Location Input */}
                  <Grid item xs={12}>
                    <Typography sx={labelStyle}>Location</Typography>
                    <TextField
                      fullWidth
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <RoomOutlinedIcon
                            sx={{ color: 'text.secondary', fontSize: '1.1rem' }}
                          />
                        ),
                      }}
                      sx={inputFieldStyle}
                    />
                  </Grid>
                </Grid>
              </Paper>

              {/* Agenda Items Card */}
              <Paper sx={sectionCardStyle}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <ListAltIcon sx={{ color: '#0D47A1' }} />
                    <Typography variant="h6" fontWeight={800}>
                      Agenda Items
                    </Typography>
                  </Box>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={handleAddAgendaItem}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 700,
                      color: 'primary.main',
                      p: 0,
                      '&:hover': { bgcolor: 'transparent' },
                    }}
                  >
                    Add Item
                  </Button>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {agendaItems.map((item, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: 2,
                        borderRadius: 2.5,
                        bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1E293B' : '#F8FAFC',
                        border: '1px solid',
                        borderColor: (theme) => theme.palette.mode === 'dark' ? '#334155' : '#E2E8F0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      <Chip
                        label={String(index + 1).padStart(2, '0')}
                        size="small"
                        sx={{
                          bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0F172A' : '#E2E8F0',
                          color: 'text.secondary',
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          borderRadius: '4px',
                          height: 22,
                        }}
                      />
                      <Typography variant="body2" fontWeight={600} sx={{ color: 'text.primary' }}>
                        {item}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Box>
          </Grid>

          {/* Right Column (Attendees & Attachments) */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {/* Attendees Card */}
              <Paper sx={sectionCardStyle}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                  <Typography variant="subtitle1" fontWeight={800}>
                    Attendees
                  </Typography>
                  <Chip
                    label="3 INVITEES"
                    size="small"
                    sx={{
                      bgcolor: 'action.hover',
                      color: 'text.secondary',
                      fontWeight: 700,
                      fontSize: '0.62rem',
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2.5 }}>
                  {attendees.map((attendee) => (
                    <Box
                      key={attendee.name}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            bgcolor: 'primary.light',
                          }}
                        >
                          {attendee.name.split(' ').map((n) => n[0]).join('')}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.85rem' }}>
                            {attendee.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {attendee.role}
                          </Typography>
                        </Box>
                      </Box>

                      <Typography variant="caption" fontWeight={700} sx={{ color: attendee.color }}>
                        {attendee.status}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<PeopleOutlinedIcon />}
                  sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                    borderColor: (theme) => theme.palette.mode === 'dark' ? '#334155' : '#CBD5E1',
                    color: 'text.primary',
                    fontWeight: 700,
                    '&:hover': { borderColor: 'text.primary', bgcolor: 'action.hover' },
                  }}
                >
                  Manage Invitees
                </Button>
              </Paper>

              {/* Attachments Card */}
              <Paper sx={sectionCardStyle}>
                <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2.5 }}>
                  Attachments
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3.5 }}>
                  {files.map((file, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1E293B' : '#F1F5F9',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Box
                        sx={{
                          bgcolor: file.type === 'pdf' ? 'error.main' : 'primary.main',
                          borderRadius: 1,
                          p: 0.75,
                          display: 'flex',
                          color: '#FFFFFF',
                        }}
                      >
                        <InsertDriveFileIcon fontSize="small" />
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          noWrap
                          sx={{ fontWeight: 700, fontSize: '0.8rem', color: 'text.primary' }}
                        >
                          {file.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem' }}>
                          {file.size} - {file.updated}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>

                {/* Dashed upload box */}
                <Box
                  sx={{
                    border: '1px dashed',
                    borderColor: 'primary.main',
                    borderRadius: 2.5,
                    p: 3,
                    textAlign: 'center',
                    cursor: 'pointer',
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
                    '&:hover': {
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
                    },
                  }}
                >
                  <CloudUploadOutlinedIcon sx={{ color: 'primary.main', fontSize: '1.75rem', mb: 1 }} />
                  <Typography variant="body2" fontWeight={700} sx={{ color: 'text.primary', mb: 0.5 }}>
                    Drop files here to upload
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    PDF, DOCX, XLSX (Max 50MB)
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <Divider />

      {/* Dialog Actions Footer */}
      <DialogActions sx={{ px: { xs: 3, md: 5 }, py: 2.5, display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
          <CloudDoneOutlinedIcon fontSize="small" />
          <Typography variant="caption" fontWeight={600}>
            Changes saved as draft 2:14 PM
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            onClick={onClose}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              color: 'text.secondary',
              px: 3,
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleMarkAsCompleted}
            startIcon={<CheckCircleOutlinedIcon />}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              bgcolor: '#0D47A1',
              color: '#FFFFFF',
              fontWeight: 700,
              px: 3.5,
              '&:hover': { bgcolor: '#0A192F' },
            }}
          >
            Mark as Completed
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
