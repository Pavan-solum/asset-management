import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { UploadFolderTab } from './UploadFolderTab';
import { UploadFileDialog } from './UploadFileDialog';
import { CreateFolderDialog } from './CreateFolderDialog';

interface AddNewContentDialogProps {
  open: boolean;
  onClose: () => void;
  onUploadFile: (fileData: {
    name: string;
    type: string;
    description: string;
    accessLevel: string;
    permissions: string[];
    requireApproval: boolean;
  }) => void;
  onUploadFolder: (folderData: {
    name: string;
    accessLevel: string;
    permissions: string[];
    requireApproval: boolean;
    filesCount: number;
  }) => void;
  onCreateFolder: (folderName: string, role: string) => void;
  selectedFolderPath?: string;
  initialTab?: number;
}

export function AddNewContentDialog({
  open,
  onClose,
  onUploadFile,
  onUploadFolder,
  onCreateFolder,
  selectedFolderPath = 'Company Documents > HR > Employee Docs',
  initialTab = 0,
}: AddNewContentDialogProps) {
  // Tabs State
  const [activeTab, setActiveTab] = useState(initialTab);

  // Synced initial tab
  useEffect(() => {
    if (open) {
      setActiveTab(initialTab);
    }
  }, [open, initialTab]);

  const pathParts = selectedFolderPath.split(' > ');

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '24px',
          p: 3.5,
          boxShadow: '0px 10px 40px rgba(0, 0, 0, 0.08)',
        },
      }}
    >
      {/* Dialog Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0D47A1', lineHeight: 1.2, mb: 1.5 }}>
            Add New Content
          </Typography>

          {/* Breadcrumb Path Pill */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                bgcolor: '#EBF3FB',
                border: '1px solid #C8DFF5',
                borderRadius: '20px',
                px: 1.75,
                py: 0.5,
              }}
            >
              {pathParts.map((part, index) => (
                <React.Fragment key={part}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: index === pathParts.length - 1 ? 700 : 500,
                      fontSize: '0.75rem',
                      color: index === pathParts.length - 1 ? '#1A3C5E' : '#5B7FA6',
                    }}
                  >
                    {part}
                  </Typography>
                  {index < pathParts.length - 1 && (
                    <Typography
                      variant="caption"
                      sx={{ fontSize: '0.75rem', color: '#8BAECB', fontWeight: 400 }}
                    >
                      ›
                    </Typography>
                  )}
                </React.Fragment>
              ))}
              <IconButton size="small" sx={{ p: 0.25, ml: 0.5, color: '#5B7FA6' }}>
                <EditOutlinedIcon sx={{ fontSize: '0.85rem' }} />
              </IconButton>
            </Box>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: '#90A4AE', bgcolor: '#F5F7FA', '&:hover': { bgcolor: '#E1F5FE' } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, val) => setActiveTab(val)}
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          mb: 3,
          '& .MuiTabs-indicator': {
            height: 3,
            borderRadius: '3px 3px 0 0',
          },
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.875rem',
            minHeight: 48,
            color: 'text.secondary',
            '&.Mui-selected': {
              color: 'primary.main',
            },
          },
        }}
      >
        <Tab icon={<UploadFileOutlinedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Upload File" />
        <Tab icon={<CloudUploadOutlinedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Upload Folder" />
        <Tab icon={<CreateNewFolderOutlinedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="New Folder" />
      </Tabs>

      {/* TAB 1: UPLOAD FILE */}
      {activeTab === 0 && (
        <DialogContent sx={{ p: 0, overflow: 'visible' }}>
          <UploadFileDialog onClose={onClose} onUpload={onUploadFile} />
        </DialogContent>
      )}

      {/* TAB 2: UPLOAD FOLDER */}
      {activeTab === 1 && (
        <DialogContent sx={{ p: 0 }}>
          <UploadFolderTab onClose={onClose} onUploadFolder={onUploadFolder} />
        </DialogContent>
      )}

      {/* TAB 3: NEW FOLDER */}
      {activeTab === 2 && (
        <DialogContent sx={{ p: 0 }}>
          <CreateFolderDialog onClose={onClose} onCreate={onCreateFolder} />
        </DialogContent>
      )}
    </Dialog>
  );
}
