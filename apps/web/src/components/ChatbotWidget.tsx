import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Fab,
  IconButton,
  InputBase,
  Paper,
  Typography,
  Stack,
  Avatar,
  Chip,
  CircularProgress,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import LaptopMacIcon from '@mui/icons-material/LaptopMac';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import { useLocation } from 'react-router-dom';
import { useAuthUser } from '../hooks/storeHooks';
import { apiFetch } from '../services/api/client';
import { isApiEnabled } from '../services/api/config';
import {
  REQUEST_STATUS_COLORS,
  REQUEST_STATUS_LABELS,
  REQUEST_TYPE_LABELS,
  CATEGORY_LABELS,
} from '../data/demoData';

interface Message {
  role: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export function ChatbotWidget() {
  const user = useAuthUser();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  // 1. Session Persistence: Load messages from sessionStorage or default to empty
  const [messages, setMessages] = useState<Message[]>(() => {
    const cached = sessionStorage.getItem('assetly_chat_history');
    return cached ? JSON.parse(cached) : [];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
      };

      setRecognition(rec);
    }
  }, []);

  // 1. Session Persistence: Sync messages to sessionStorage
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem('assetly_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!user) return null;

  const isEmployee = user.role === 'employee';

  const suggestionChips = isEmployee
    ? [
        { label: '🔍 Track my requests', text: 'Show my active requests' },
        { label: '💻 Show my assets', text: 'What assets are assigned to me?' },
        { label: '🗺️ Where am I?', text: 'Where am I right now?' },
      ]
    : [
        { label: '📊 All device requests', text: 'Show all device requests' },
        { label: '🔍 Search laptop inventory', text: 'Search laptop inventory' },
        { label: '🗺️ Where am I?', text: 'Where am I right now?' },
      ];

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      role: 'user',
      text: textToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const historyPayload = messages.slice(-10).map((msg) => ({
        role: msg.role,
        text: msg.text,
      }));

      let responseText = '';

      if (isApiEnabled()) {
        const response = await apiFetch<{ text: string }>('/api/chat', {
          method: 'POST',
          body: JSON.stringify({
            message: textToSend,
            history: historyPayload,
            currentPath: location.pathname, // 3. Context Awareness: Send active path
          }),
        });
        responseText = response.text;
      } else {
        await new Promise((res) => setTimeout(res, 1200));
        responseText = `API is disabled. Enable VITE_USE_API=true to query live data! Current path is ${location.pathname}.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: responseText,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: `Sorry, I encountered an error communicating with the chat service: ${err.message || 'Unknown error'}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    sessionStorage.removeItem('assetly_chat_history');
    setMessages([
      {
        role: 'ai',
        text: `Chat cleared. How can I help you now, ${user.firstName}?`,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const toggleListening = () => {
    if (!recognition) return;
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  // 4. Rich Renderers Parser: extracts structured JSON block wrapped in ```json
  const parseJsonMessage = (text: string) => {
    const match = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (!match) return { cleanText: text, cardData: null };

    const rawJson = match[1];
    const cleanText = text.replace(/```json\s*([\s\S]*?)\s*```/, '').trim();

    try {
      const parsed = JSON.parse(rawJson);
      return { cleanText, cardData: parsed };
    } catch {
      return { cleanText: text, cardData: null };
    }
  };

  const formatText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      let content: React.ReactNode = line;
      if (line.startsWith('- ') || line.startsWith('* ')) {
        content = <span>• {line.slice(2)}</span>;
      }
      return (
        <span key={idx} style={{ display: 'block', minHeight: line === '' ? '0.5rem' : 'auto' }}>
          {content}
        </span>
      );
    });
  };

  // 4. Rich Component Renderer
  const renderRichCard = (cardData: any) => {
    if (!cardData || !cardData.items || !Array.isArray(cardData.items)) return null;

    if (cardData.type === 'requests') {
      return (
        <Stack spacing={1.5} sx={{ mt: 1.5, width: '100%' }}>
          {cardData.items.map((req: any, index: number) => {
            const statusColor = REQUEST_STATUS_COLORS[req.status] || 'default';
            const statusLabel = REQUEST_STATUS_LABELS[req.status] || req.status;
            const typeLabel = REQUEST_TYPE_LABELS[req.requestType] || req.requestType;
            const categoryLabel = CATEGORY_LABELS[req.category] || req.category;

            return (
              <Card key={req.id || index} variant="outlined" sx={{ borderRadius: 2, bgcolor: 'background.paper' }}>
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <AssignmentTurnedInIcon color="primary" fontSize="small" />
                      <Typography variant="body2" fontWeight={700}>
                        {categoryLabel}
                      </Typography>
                    </Stack>
                    <Chip label={statusLabel} color={statusColor as any} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                  </Stack>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                    Type: <strong>{typeLabel}</strong> {req.employeeName ? `• From: ${req.employeeName}` : ''}
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem', fontStyle: 'italic', bgcolor: 'action.hover', p: 1, borderRadius: 1 }}>
                    "{req.description}"
                  </Typography>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      );
    }

    if (cardData.type === 'assets') {
      return (
        <Stack spacing={1.5} sx={{ mt: 1.5, width: '100%' }}>
          {cardData.items.map((asset: any, index: number) => {
            return (
              <Card key={asset.id || index} variant="outlined" sx={{ borderRadius: 2, bgcolor: 'background.paper' }}>
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <LaptopMacIcon color="secondary" fontSize="small" />
                    <Typography variant="body2" fontWeight={700}>
                      {asset.name}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                    <Chip label={`Tag: ${asset.assetTag}`} size="small" variant="outlined" sx={{ height: 18, fontSize: '0.65rem' }} />
                    {asset.serialNumber && (
                      <Chip label={`S/N: ${asset.serialNumber}`} size="small" variant="outlined" sx={{ height: 18, fontSize: '0.65rem' }} />
                    )}
                    <Chip label={asset.status.replace('_', ' ')} color="success" size="small" sx={{ height: 18, fontSize: '0.65rem' }} />
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      );
    }

    return null;
  };

  return (
    <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1100 }}>
      {!open && (
        <Fab
          color="primary"
          aria-label="chat"
          onClick={() => setOpen(true)}
          sx={{
            boxShadow: '0 4px 16px rgba(21, 101, 192, 0.4)',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'scale(1.08)' },
          }}
        >
          <ChatIcon />
        </Fab>
      )}

      {open && (
        <Paper
          elevation={6}
          sx={{
            width: { xs: 320, sm: 380 },
            height: 520,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid',
            borderColor: 'divider',
            animation: 'fadeInUp 0.25s ease-out',
            '@keyframes fadeInUp': {
              '0%': { opacity: 0, transform: 'translateY(16px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 32, height: 32 }}>
                <SmartToyIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>
                  Assetly AI Assistant
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mt: -0.25 }}>
                  {isEmployee ? 'Self-Service Support' : 'IT Operations Copilot'}
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={0.5}>
              <IconButton size="small" color="inherit" onClick={handleClear} title="Clear conversation">
                <DeleteSweepIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" color="inherit" onClick={() => setOpen(false)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Box>

          {/* Messages Area */}
          <Box sx={{ flex: 1, p: 2, overflowY: 'auto', bgcolor: 'background.default' }}>
            <Stack spacing={2}>
              {messages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                const { cleanText, cardData } = isUser ? { cleanText: msg.text, cardData: null } : parseJsonMessage(msg.text);

                return (
                  <Box
                    key={idx}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isUser ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: isUser ? 'flex-end' : 'flex-start',
                        alignItems: 'flex-start',
                        width: '100%',
                      }}
                    >
                      {!isUser && (
                        <Avatar
                          sx={{
                            width: 28,
                            height: 28,
                            bgcolor: 'secondary.main',
                            fontSize: '0.75rem',
                            mr: 1,
                            mt: 0.5,
                          }}
                        >
                          AI
                        </Avatar>
                      )}
                      <Box
                        sx={{
                          maxWidth: '80%',
                          p: 1.5,
                          borderRadius: 2.5,
                          bgcolor: isUser ? 'primary.main' : 'background.paper',
                          color: isUser ? 'primary.contrastText' : 'text.primary',
                          border: isUser ? 'none' : '1px solid',
                          borderColor: 'divider',
                          fontSize: '0.875rem',
                          lineHeight: 1.5,
                          wordBreak: 'break-word',
                        }}
                      >
                        {formatText(cleanText)}
                      </Box>
                    </Box>
                    
                    {/* Render Interactive Custom Cards if JSON list exists */}
                    {!isUser && cardData && (
                      <Box sx={{ pl: 4.5, pr: 1, width: '100%' }}>
                        {renderRichCard(cardData)}
                      </Box>
                    )}
                  </Box>
                );
              })}

              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                  <Avatar sx={{ width: 28, height: 28, bgcolor: 'secondary.main', mr: 1 }}>
                    <CircularProgress size={14} color="inherit" />
                  </Avatar>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2.5,
                      bgcolor: 'background.paper',
                      color: 'text.secondary',
                      border: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Thinking…
                    </Typography>
                  </Box>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Stack>
          </Box>

          <Divider />

          {/* Quick Suggestions Chips */}
          <Box sx={{ px: 1.5, py: 1, bgcolor: 'background.paper', overflowX: 'auto', whiteSpace: 'nowrap' }}>
            <Stack direction="row" spacing={1}>
              {suggestionChips.map((chip, i) => (
                <Chip
                  key={i}
                  label={chip.label}
                  onClick={() => handleSend(chip.text)}
                  size="small"
                  variant="outlined"
                  clickable
                  disabled={loading}
                  sx={{
                    fontSize: '0.75rem',
                    borderRadius: 1.5,
                    bgcolor: 'background.default',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                />
              ))}
            </Stack>
          </Box>

          <Divider />

          {/* Input Bar with Voice (Microphone) */}
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            sx={{ p: 1.5, bgcolor: 'background.paper', display: 'flex', alignItems: 'center' }}
          >
            <InputBase
              placeholder={isListening ? 'Listening…' : 'Ask a question or submit request…'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              sx={{
                flex: 1,
                px: 1.5,
                py: 0.75,
                borderRadius: 2,
                bgcolor: 'background.default',
                fontSize: '0.875rem',
                border: '1px solid',
                borderColor: 'divider',
                color: isListening ? 'primary.main' : 'text.primary',
              }}
            />
            {recognition && (
              <IconButton
                color={isListening ? 'error' : 'default'}
                onClick={toggleListening}
                disabled={loading}
                sx={{ ml: 0.5, p: 1 }}
                title={isListening ? 'Stop listening' : 'Start voice input'}
              >
                {isListening ? <MicOffIcon fontSize="small" /> : <MicIcon fontSize="small" />}
              </IconButton>
            )}
            <IconButton
              type="submit"
              color="primary"
              disabled={!input.trim() || loading}
              sx={{ ml: 0.5, p: 1 }}
            >
              <SendIcon fontSize="small" />
            </IconButton>
          </Box>
        </Paper>
      )}
    </Box>
  );
}
