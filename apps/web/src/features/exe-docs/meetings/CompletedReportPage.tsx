import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Chip,
  Button,
  Grid,
  Checkbox,
  Avatar,
  AvatarGroup,
  Divider,
  Paper,
  alpha,
  IconButton,
} from '@mui/material';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import GetAppOutlinedIcon from '@mui/icons-material/GetAppOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import GavelIcon from '@mui/icons-material/Gavel';
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AddIcon from '@mui/icons-material/Add';
import GroupIcon from '@mui/icons-material/Group';
import AttachmentIcon from '@mui/icons-material/Attachment';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RoomOutlinedIcon from '@mui/icons-material/RoomOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import { MeetingData } from './modal/MeetingCard';

export function CompletedReportPage() {
  const locationState = useLocation();
  const navigate = useNavigate();

  // Fallback default completed meeting details if accessed directly
  const defaultMeeting: MeetingData = {
    id: 'meet-completed-default',
    title: 'Q4 Strategic Review',
    status: 'COMPLETED',
    date: 'October 24, 2024',
    time: '09:00 AM',
    location: 'Main Boardroom (Executive Wing)',
    participants: ['Jameson Davies', 'Sarah Chen', 'Marcus Thorne'],
  };

  const meeting: MeetingData = (locationState.state?.meeting as MeetingData) || defaultMeeting;

  const [tasks, setTasks] = useState([
    { id: 1, text: 'Prepare EMEA hiring plan', priority: 'URGENT', assignee: 'Sarah Chen', date: 'Oct 30', checked: false },
    { id: 2, text: 'SaaS Migration Audit', priority: 'DRAFT', assignee: 'Marcus Thorne', date: 'Nov 05', checked: true },
  ]);

  const handleToggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, checked: !t.checked } : t))
    );
  };

  const cardStyle = {
    p: 3,
    borderRadius: 3,
    border: '1px solid',
    borderColor: (theme: any) => theme.palette.mode === 'dark' ? '#334155' : '#E2E8F0',
    bgcolor: 'background.paper',
    boxShadow: 'none',
  };

  const sectionHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    mb: 2.5,
  };

  const labelStyle = {
    fontWeight: 800,
    color: (theme: any) => theme.palette.mode === 'dark' ? '#94A3B8' : '#475569',
    letterSpacing: '0.08em',
    fontSize: '0.72rem',
    textTransform: 'uppercase',
  };

  return (
    <Box sx={{ py: 1 }}>
      {/* Back to Meetings button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/exec-docs/meetings')}
        sx={{
          mb: 3,
          textTransform: 'none',
          fontWeight: 700,
          color: 'text.secondary',
          '&:hover': { color: 'primary.main', bgcolor: 'transparent' },
        }}
      >
        Back to Meetings
      </Button>

      {/* Header Block */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
          <Chip
            label="BOARD OF DIRECTORS"
            size="small"
            sx={{
              bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1E293B' : '#E2E8F0',
              color: 'text.secondary',
              fontWeight: 700,
              fontSize: '0.65rem',
              borderRadius: '4px',
            }}
          />
          <Chip
            label="COMPLETED"
            size="small"
            icon={
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: 'success.main',
                  ml: 1,
                }}
              />
            }
            sx={{
              bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(46, 125, 50, 0.15)' : '#E2E8F0',
              color: (theme) => theme.palette.mode === 'dark' ? 'success.main' : '#2E7D32',
              fontWeight: 700,
              fontSize: '0.65rem',
              borderRadius: '4px',
              '& .MuiChip-icon': { ml: 0.5, mr: -0.5 },
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 1.5, letterSpacing: '-0.02em' }}>
              {meeting.title} Meeting
            </Typography>
            <Box sx={{ display: 'flex', gap: 2.5, color: 'text.secondary', flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <CalendarTodayOutlinedIcon sx={{ fontSize: '0.95rem' }} />
                <Typography variant="body2" fontWeight={600}>{meeting.date}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <AccessTimeOutlinedIcon sx={{ fontSize: '0.95rem' }} />
                <Typography variant="body2" fontWeight={600}>{meeting.time} - 11:30 AM EST</Typography>
              </Box>
            </Box>
          </Box>

          {/* Header Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant="outlined"
              startIcon={<GetAppOutlinedIcon />}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                borderColor: (theme) => theme.palette.mode === 'dark' ? '#334155' : '#CBD5E1',
                color: 'text.primary',
                fontWeight: 700,
                px: 2.5,
                py: 1,
                bgcolor: 'background.paper',
                '&:hover': { borderColor: 'text.primary', bgcolor: 'action.hover' },
              }}
            >
              Export PDF
            </Button>
            <Button
              variant="contained"
              startIcon={<CheckCircleOutlinedIcon />}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                bgcolor: '#0D47A1',
                color: '#FFFFFF',
                fontWeight: 700,
                px: 2.5,
                py: 1,
                '&:hover': { bgcolor: '#0A192F' },
              }}
            >
              Finalize Minutes
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Two-Column Grid */}
      <Grid container spacing={4}>
        {/* Left Column (Decision Records & Minutes & Agenda) */}
        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Card 1: Decision Records */}
            <Paper sx={cardStyle}>
              <Box sx={sectionHeaderStyle}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <GavelIcon sx={{ color: '#0D47A1' }} />
                  <Typography variant="h6" fontWeight={800}>
                    Decision Records
                  </Typography>
                </Box>
                <Chip
                  label="2 DECISIONS LOGGED"
                  size="small"
                  sx={{
                    bgcolor: 'action.hover',
                    color: 'text.secondary',
                    fontWeight: 700,
                    fontSize: '0.62rem',
                  }}
                />
              </Box>

              {/* Decisions List */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {/* Decision 1 */}
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 2.5,
                    border: '1px solid',
                    borderColor: (theme) => theme.palette.mode === 'dark' ? '#334155' : '#E2E8F0',
                    display: 'flex',
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      bgcolor: 'rgba(21, 101, 192, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#1565C0',
                      flexShrink: 0,
                    }}
                  >
                    <CheckCircleOutlinedIcon fontSize="small" />
                  </Box>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="caption" color="primary.main" fontWeight={700}>
                        SR-2023-Q4-01
                      </Typography>
                      <Chip
                        label="UNANIMOUS"
                        size="small"
                        variant="outlined"
                        sx={{
                          borderRadius: '4px',
                          fontWeight: 700,
                          fontSize: '0.58rem',
                          height: 18,
                        }}
                      />
                    </Box>
                    <Typography variant="body2" fontWeight={800} sx={{ mb: 0.75, color: 'text.primary' }}>
                      Approve $4.2M additional R&D budget for AI initiative.
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Expansion of the machine learning team and infrastructure procurement for next gen analytics suite.
                    </Typography>
                  </Box>
                </Box>

                {/* Decision 2 */}
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 2.5,
                    border: '1px solid',
                    borderColor: (theme) => theme.palette.mode === 'dark' ? '#334155' : '#E2E8F0',
                    display: 'flex',
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      bgcolor: 'action.hover',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'text.secondary',
                      flexShrink: 0,
                    }}
                  >
                    <HelpOutlineIcon fontSize="small" />
                  </Box>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>
                        SR-2023-Q4-02
                      </Typography>
                      <Chip
                        label="MAJORITY (7-2)"
                        size="small"
                        variant="outlined"
                        sx={{
                          borderRadius: '4px',
                          fontWeight: 700,
                          fontSize: '0.58rem',
                          height: 18,
                        }}
                      />
                    </Box>
                    <Typography variant="body2" fontWeight={800} sx={{ mb: 0.75, color: 'text.primary' }}>
                      Postpone Berlin office expansion to Q1 2024.
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Delayed due to current market volatility in European commercial real estate sectors.
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>

            {/* Card 2: Minutes & Agenda */}
            <Paper sx={cardStyle}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <PlaylistPlayIcon sx={{ color: '#0D47A1' }} />
                <Typography variant="h6" fontWeight={800}>
                  Minutes & Agenda
                </Typography>
              </Box>

              {/* Agenda Items */}
              <Typography variant="caption" sx={{ ...labelStyle, mb: 1.5, display: 'block' }}>
                Agenda Items
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 4 }}>
                {[
                  { num: '1.0', text: 'Market expansion and international subsidiary performance review.' },
                  { num: '2.0', text: 'FY24 Budget allocation for R&D and Enterprise SaaS migration.' },
                  { num: '3.0', text: 'Confidential Executive compensation and board restructuring.' },
                ].map((item) => (
                  <Box key={item.num} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Chip
                      label={item.num}
                      size="small"
                      sx={{
                        bgcolor: '#0D47A1',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '0.65rem',
                        borderRadius: '4px',
                        height: 20,
                      }}
                    />
                    <Typography variant="body2" fontWeight={500} sx={{ color: 'text.primary', pt: 0.1 }}>
                      {item.text}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Summary Quote Box */}
              <Box
                sx={{
                  p: 3,
                  borderRadius: 3,
                  borderLeft: '4px solid #0D47A1',
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1E293B' : '#FFFFFF',
                  border: '1px solid',
                  borderColor: (theme) => theme.palette.mode === 'dark' ? '#334155' : '#E2E8F0',
                  borderLeftColor: '#0D47A1',
                }}
              >
                <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 2, color: 'text.primary', fontWeight: 600 }}>
                  Summary: <span style={{ fontWeight: 400 }}>The board convened to evaluate Q3 performance and set the trajectory for Q4. Primary focus was placed on the EMEA expansion progress.</span>
                </Typography>
                <Typography variant="body2" fontWeight={700} sx={{ mb: 1.5, color: 'text.primary' }}>
                  Key Discussion Points:
                </Typography>
                <Box sx={{ pl: 2, display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    &bull; EMEA revenue exceeded projections by 14%, largely driven by the Enterprise segment.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    &bull; Concerns raised regarding the churn rate in small to medium business tiers.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    &bull; The CTO presented a roadmap for the transition to a headless CMS architecture by Q2 next year.
                  </Typography>
                </Box>

                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(30, 136, 229, 0.08)' : 'rgba(21, 101, 192, 0.05)',
                    border: '1px solid',
                    borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(30, 136, 229, 0.15)' : 'rgba(21, 101, 192, 0.1)',
                  }}
                >
                  <Typography variant="body2" sx={{ color: '#1565C0', fontWeight: 600 }}>
                    The committee agreed that further investment in localized customer success teams is required to maintain momentum in new territories.
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Grid>

        {/* Right Column (Action Items, Attendees, Attachments) */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Card 3: Action Items */}
            <Paper sx={cardStyle}>
              <Box sx={sectionHeaderStyle}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <AssignmentTurnedInIcon sx={{ color: '#0D47A1' }} />
                  <Typography variant="subtitle1" fontWeight={800}>
                    Action Items
                  </Typography>
                </Box>
                <IconButton size="small" sx={{ color: 'text.secondary' }}>
                  <AddIcon fontSize="small" />
                </IconButton>
              </Box>

              {/* Tasks checkboxes */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {tasks.map((task) => (
                  <Box
                    key={task.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1.5,
                    }}
                  >
                    <Checkbox
                      size="small"
                      checked={task.checked}
                      onChange={() => handleToggleTask(task.id)}
                      sx={{ mt: -0.2, color: 'text.secondary', '&.Mui-checked': { color: 'primary.main' } }}
                    />
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          sx={{
                            textDecoration: task.checked ? 'line-through' : 'none',
                            color: task.checked ? 'text.secondary' : 'text.primary',
                            fontSize: '0.85rem',
                          }}
                        >
                          {task.text}
                        </Typography>
                        <Chip
                          label={task.priority}
                          size="small"
                          sx={{
                            borderRadius: '4px',
                            height: 18,
                            fontSize: '0.55rem',
                            fontWeight: 800,
                            bgcolor:
                              task.priority === 'URGENT'
                                ? 'rgba(211, 47, 47, 0.08)'
                                  : 'rgba(95, 107, 122, 0.08)',
                              color:
                                task.priority === 'URGENT' ? 'error.main' : 'text.secondary',
                              border: 'none',
                            }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <Avatar
                              sx={{
                                width: 18,
                                height: 18,
                                fontSize: '0.6rem',
                                bgcolor: 'primary.light',
                              }}
                            >
                              {task.assignee.split(' ').map((n) => n[0]).join('')}
                            </Avatar>
                            <Typography variant="caption" color="text.secondary">
                              {task.assignee}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {task.date}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Paper>

              {/* Card 4: Attendees */}
              <Paper sx={cardStyle}>
                <Box sx={sectionHeaderStyle}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <GroupIcon sx={{ color: '#0D47A1' }} />
                    <Typography variant="subtitle1" fontWeight={800}>
                      Attendees
                    </Typography>
                  </Box>
                  <Chip
                    label="3 PRESENT"
                    size="small"
                    sx={{
                      bgcolor: 'rgba(21, 101, 192, 0.06)',
                      color: '#1565C0',
                      fontWeight: 700,
                      fontSize: '0.62rem',
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2.5 }}>
                  {[
                    { name: 'Jameson Davies', role: 'CEO / Chairperson', initial: 'JD' },
                    { name: 'Sarah Chen', role: 'CFO', initial: 'SC' },
                    { name: 'Marcus Thorne', role: 'CTO', initial: 'MT' },
                  ].map((attendee) => (
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
                          {attendee.initial}
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
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          bgcolor: 'success.main',
                        }}
                      />
                    </Box>
                  ))}
                </Box>

                <Button
                  fullWidth
                  variant="outlined"
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

              {/* Card 5: Attachments */}
              <Paper sx={cardStyle}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                  <AttachmentIcon sx={{ color: '#0D47A1' }} />
                  <Typography variant="subtitle1" fontWeight={800}>
                    Attachments
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[
                    { name: 'Q3_Performance_Report.pdf', size: '4.2 MB - PDF File', color: 'error.main' },
                    { name: 'EMEA_Hiring_Strategy.docx', size: '1.1 MB - DOCX File', color: 'primary.main' },
                  ].map((doc, idx) => (
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
                          bgcolor: doc.color,
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
                          {doc.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem' }}>
                          {doc.size}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Box>
          </Grid>

          {/* Bottom Section: Upcoming Meetings */}
          <Grid item xs={12}>
            <Box sx={{ mt: 2, position: 'relative' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                <Typography variant="h6" fontWeight={800}>
                  Upcoming Meetings
                </Typography>
                <Box sx={{ bgcolor: 'action.hover', p: 0.5, borderRadius: '8px', display: 'flex', gap: 0.5 }}>
                  <Button size="small" variant="text" sx={{ fontWeight: 700, textTransform: 'none', px: 2 }}>
                    List View
                  </Button>
                  <Button size="small" variant="text" disabled sx={{ fontWeight: 700, textTransform: 'none', px: 2 }}>
                    Calendar
                  </Button>
                </Box>
              </Box>

              <Grid container spacing={3}>
                {/* Upcoming Meeting Card 1 */}
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: (theme) => theme.palette.mode === 'dark' ? '#334155' : '#E2E8F0',
                      bgcolor: 'background.paper',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: 'action.hover',
                          textAlign: 'center',
                          minWidth: 60,
                        }}
                      >
                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          OCT
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1.25rem', lineHeight: 1.1 }}>
                          28
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" fontWeight={800} sx={{ color: 'text.primary', mb: 0.5 }}>
                          Fiscal Budget Approval FY24
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, color: 'text.secondary', flexWrap: 'wrap' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AccessTimeOutlinedIcon sx={{ fontSize: '0.85rem' }} />
                            <Typography variant="caption" fontWeight={600}>01:00 - 04:00 PM</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <VideocamOutlinedIcon sx={{ fontSize: '0.85rem' }} />
                            <Typography variant="caption" fontWeight={600}>Virtual Conference</Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>

                    <Button
                      variant="contained"
                      sx={{
                        borderRadius: '8px',
                        textTransform: 'none',
                        bgcolor: '#0D47A1',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        px: 2.5,
                        py: 0.75,
                        fontSize: '0.8rem',
                        '&:hover': { bgcolor: '#0A192F' },
                      }}
                    >
                      View Agenda
                    </Button>
                  </Box>
                </Grid>

                {/* Upcoming Meeting Card 2 */}
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: (theme) => theme.palette.mode === 'dark' ? '#334155' : '#E2E8F0',
                      bgcolor: 'background.paper',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: 'action.hover',
                          textAlign: 'center',
                          minWidth: 60,
                        }}
                      >
                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          OCT
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1.25rem', lineHeight: 1.1 }}>
                          31
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" fontWeight={800} sx={{ color: 'text.primary', mb: 0.5 }}>
                          Quarterly Product Roadmap
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, color: 'text.secondary', flexWrap: 'wrap' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AccessTimeOutlinedIcon sx={{ fontSize: '0.85rem' }} />
                            <Typography variant="caption" fontWeight={600}>10:00 - 11:30 AM</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <RoomOutlinedIcon sx={{ fontSize: '0.85rem' }} />
                            <Typography variant="caption" fontWeight={600}>Executive Room 3B</Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>

                    {/* Stacked avatars */}
                    <Box>
                      <AvatarGroup max={3}>
                        {['John Doe', 'Jane Smith', 'Alex Carter', 'Ben Davis'].map((name, i) => (
                          <Avatar
                            key={i}
                            sx={{
                              width: 28,
                              height: 28,
                              fontSize: '0.7rem',
                              bgcolor: 'primary.light',
                            }}
                          >
                            {name.split(' ').map((n) => n[0]).join('')}
                          </Avatar>
                        ))}
                      </AvatarGroup>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              {/* Floating add circle button */}
              <IconButton
                sx={{
                  position: 'absolute',
                  right: 0,
                  bottom: -16,
                  bgcolor: '#0D47A1',
                  color: '#FFFFFF',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                  '&:hover': { bgcolor: '#0A192F' },
                  display: { xs: 'none', md: 'flex' },
                }}
              >
                <AddIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </Box>
  );
}
