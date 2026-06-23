import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Checkbox,
  FormControlLabel,
  IconButton,
} from '@mui/material';
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined';
import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import FolderSharedOutlinedIcon from '@mui/icons-material/FolderSharedOutlined';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { CreateFolderDialog } from './modal/CreateFolderDialog';
import { UploadFileDialog } from './modal/UploadFileDialog';

interface SubfolderConfig {
  name: string;
  count: number;
}

interface FolderConfig {
  name: string;
  count: number;
  subfolders?: SubfolderConfig[];
  isShared?: boolean;
}

const INITIAL_FOLDERS: FolderConfig[] = [
  {
    name: 'HR',
    count: 12,
    subfolders: [
      { name: 'Employee Docs', count: 8 },
      { name: 'Policies', count: 4 },
    ],
  },
  {
    name: 'Sales',
    count: 45,
    subfolders: [
      { name: 'Leads & Prospects', count: 25 },
      { name: 'Customers', count: 20 },
    ],
  },
  {
    name: 'Marketing',
    count: 28,
    subfolders: [
      { name: 'Campaigns', count: 12 },
      { name: 'Brand Assets', count: 10 },
      { name: 'Market Research', count: 6 },
    ],
  },
  {
    name: 'Operations',
    count: 15,
    subfolders: [
      { name: 'Vendor Management', count: 5 },
      { name: 'Inventory', count: 7 },
      { name: 'SOPs', count: 3 },
    ],
  },
  {
    name: 'Shared',
    count: 102,
    isShared: true,
  },
];

export function FolderSidebar() {
  const [selectedFolder, setSelectedFolder] = useState('Employee Docs');
  const [folders, setFolders] = useState<FolderConfig[]>(INITIAL_FOLDERS);
  
  // Collapsible State
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    HR: true,
    Sales: false,
    Marketing: false,
    Operations: false,
  });

  // Checkbox state for Document State
  const [documentStates, setDocumentStates] = useState({
    all: true,
    confidential: false,
    approved: false,
    draft: false,
  });

  // Modal State
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [fileDialogOpen, setFileDialogOpen] = useState(false);

  const toggleFolder = (folderName: string) => {
    setOpenFolders((prev) => ({
      ...prev,
      [folderName]: !prev[folderName],
    }));
  };

  const handleStateChange = (stateName: 'all' | 'confidential' | 'approved' | 'draft') => {
    if (stateName === 'all') {
      setDocumentStates({
        all: true,
        confidential: false,
        approved: false,
        draft: false,
      });
    } else {
      setDocumentStates((prev) => ({
        ...prev,
        all: false,
        [stateName]: !prev[stateName],
      }));
    }
  };

  const getSelectedFolderPath = () => {
    for (const folder of folders) {
      if (folder.name === selectedFolder) {
        return `Company Documents > ${folder.name}`;
      }
      if (folder.subfolders) {
        const sub = folder.subfolders.find((s) => s.name === selectedFolder);
        if (sub) {
          return `Company Documents > ${folder.name} > ${sub.name}`;
        }
      }
    }
    return `Company Documents > HR > Employee Docs`;
  };

  const handleCreateFolderSubmit = (folderName: string, _role: string) => {
    const isParentSelected = folders.some((f) => f.name === selectedFolder);

    if (isParentSelected) {
      setFolders((prev) =>
        prev.map((f) => {
          if (f.name === selectedFolder) {
            const sub = f.subfolders || [];
            return {
              ...f,
              count: f.count + 1,
              subfolders: [...sub, { name: folderName, count: 0 }],
            };
          }
          return f;
        })
      );
      setOpenFolders((prev) => ({
        ...prev,
        [selectedFolder]: true,
      }));
    } else {
      const newFolder: FolderConfig = {
        name: folderName,
        count: 0,
      };
      setFolders((prev) => {
        const index = prev.findIndex((f) => f.name === 'Shared');
        if (index !== -1) {
          const updated = [...prev];
          updated.splice(index, 0, newFolder);
          return updated;
        }
        return [...prev, newFolder];
      });
    }
    setFolderDialogOpen(false);
  };

  const handleUploadFileSubmit = (_fileData: { name: string; type: string }) => {
    setFolders((prev) =>
      prev.map((folder) => {
        if (folder.name === selectedFolder) {
          return {
            ...folder,
            count: folder.count + 1,
          };
        }
        if (folder.subfolders) {
          const hasSub = folder.subfolders.some((s) => s.name === selectedFolder);
          if (hasSub) {
            return {
              ...folder,
              count: folder.count + 1,
              subfolders: folder.subfolders.map((sub) => {
                if (sub.name === selectedFolder) {
                  return {
                    ...sub,
                    count: sub.count + 1,
                  };
                }
                return sub;
              }),
            };
          }
        }
        return folder;
      })
    );
    setFileDialogOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Folders Card */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.05em' }}>
              FOLDERS
            </Typography>
            
            {/* Outlined Action Icons */}
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton
                size="small"
                onClick={() => setFolderDialogOpen(true)}
                sx={{
                  color: '#1565C0',
                  p: 0.5,
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <CreateNewFolderOutlinedIcon sx={{ fontSize: '1.25rem' }} />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => setFileDialogOpen(true)}
                sx={{
                  color: '#1565C0',
                  p: 0.5,
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <NoteAddOutlinedIcon sx={{ fontSize: '1.25rem' }} />
              </IconButton>
            </Box>
          </Box>

          <List disablePadding>
            {folders.map((folder) => {
              const hasSubfolders = folder.subfolders && folder.subfolders.length > 0;
              const isOpen = openFolders[folder.name];
              const isSelected = selectedFolder === folder.name;

              return (
                <Box key={folder.name}>
                  <ListItemButton
                    onClick={() => {
                      if (hasSubfolders) {
                        toggleFolder(folder.name);
                      } else {
                        setSelectedFolder(folder.name);
                      }
                    }}
                    selected={isSelected}
                    sx={{
                      borderRadius: '8px',
                      mb: 0.5,
                      py: 0.75,
                      color: isSelected ? 'primary.main' : 'text.primary',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 32, color: '#757575' }}>
                      {folder.isShared ? (
                        <FolderSharedOutlinedIcon fontSize="small" />
                      ) : hasSubfolders && isOpen ? (
                        <FolderOpenOutlinedIcon fontSize="small" />
                      ) : (
                        <FolderOutlinedIcon fontSize="small" />
                      )}
                    </ListItemIcon>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{folder.name}</span>
                          <span style={{ color: '#90A4AE', fontSize: '0.875rem', fontWeight: 400 }}>({folder.count})</span>
                        </Box>
                      }
                    />
                    {hasSubfolders && (isOpen ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />)}
                  </ListItemButton>

                  {hasSubfolders && (
                    <Collapse in={isOpen} timeout="auto" unmountOnExit>
                      <List
                        disablePadding
                        sx={{
                          pl: 2,
                          ml: 2,
                          borderLeft: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        {folder.subfolders?.map((sub) => (
                          <ListItemButton
                            key={sub.name}
                            selected={selectedFolder === sub.name}
                            onClick={() => setSelectedFolder(sub.name)}
                            sx={{
                              borderRadius: '8px',
                              mb: 0.5,
                              py: 0.5,
                              '&.Mui-selected': {
                                bgcolor: 'rgba(21, 101, 192, 0.08)',
                                color: 'primary.main',
                                '& .MuiListItemIcon-root': { color: 'primary.main' },
                              },
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 32, color: '#757575' }}>
                              <FolderOutlinedIcon fontSize="small" />
                            </ListItemIcon>
                            
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{sub.name}</span>
                                  <span style={{ color: '#90A4AE', fontSize: '0.875rem', fontWeight: 400 }}>({sub.count})</span>
                                </Box>
                              }
                            />
                          </ListItemButton>
                        ))}
                      </List>
                    </Collapse>
                  )}
                </Box>
              );
            })}
          </List>
        </CardContent>
      </Card>

      {/* Document State Card */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 2.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.05em', mb: 2 }}>
            DOCUMENT STATE
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={documentStates.all}
                  onChange={() => handleStateChange('all')}
                  size="small"
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  All Documents
                </Typography>
              }
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={documentStates.confidential}
                  onChange={() => handleStateChange('confidential')}
                  size="small"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#1565C0' }} />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Confidential
                  </Typography>
                </Box>
              }
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={documentStates.approved}
                  onChange={() => handleStateChange('approved')}
                  size="small"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#2e7d32' }} />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Approved
                  </Typography>
                </Box>
              }
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={documentStates.draft}
                  onChange={() => handleStateChange('draft')}
                  size="small"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#9e9e9e' }} />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Draft
                  </Typography>
                </Box>
              }
            />
          </Box>
        </CardContent>
      </Card>

      {/* External Custom Create Folder Dialog Component */}
      <CreateFolderDialog
        open={folderDialogOpen}
        onClose={() => setFolderDialogOpen(false)}
        onCreate={handleCreateFolderSubmit}
      />

      {/* External Custom Upload File Dialog Component */}
      <UploadFileDialog
        open={fileDialogOpen}
        onClose={() => setFileDialogOpen(false)}
        onUpload={handleUploadFileSubmit}
        selectedFolderPath={getSelectedFolderPath()}
      />
    </Box>
  );
}
