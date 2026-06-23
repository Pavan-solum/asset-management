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
import { DocumentRowData } from './DocumentsTable';

export interface SubfolderConfig {
  name: string;
}

export interface FolderConfig {
  name: string;
  subfolders?: SubfolderConfig[];
  isShared?: boolean;
}

interface FolderSidebarProps {
  selectedFolder: string;
  onSelectFolder: (name: string) => void;
  folders: FolderConfig[];
  setFolders: React.Dispatch<React.SetStateAction<FolderConfig[]>>;
  documents: Record<string, DocumentRowData[]>;
  setDocuments: React.Dispatch<React.SetStateAction<Record<string, DocumentRowData[]>>>;
}

export function FolderSidebar({
  selectedFolder,
  onSelectFolder,
  folders,
  setFolders,
  documents,
  setDocuments,
}: FolderSidebarProps) {
  
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

  // Tracks which folder the dialog was triggered from (independent of sidebar selection)
  const [targetFolder, setTargetFolder] = useState<string>(selectedFolder);

  // Hover state for inline folder actions
  const [hoveredFolder, setHoveredFolder] = useState<string | null>(null);

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

  const getFolderPath = (name: string) => {
    for (const folder of folders) {
      if (folder.name === name) {
        return `Company Documents > ${folder.name}`;
      }
      if (folder.subfolders) {
        const sub = folder.subfolders.find((s) => s.name === name);
        if (sub) {
          return `Company Documents > ${folder.name} > ${sub.name}`;
        }
      }
    }
    return `Company Documents > HR > Employee Docs`;
  };

  const getFolderCount = (folder: FolderConfig): number => {
    if (folder.subfolders && folder.subfolders.length > 0) {
      return folder.subfolders.reduce((sum, sub) => sum + (documents[sub.name]?.length ?? 0), 0);
    }
    return documents[folder.name]?.length ?? 0;
  };

  const handleCreateFolderSubmit = (folderName: string, _role: string) => {
    const isTopLevel = folders.some((f) => f.name === targetFolder);

    if (isTopLevel) {
      // Add as a subfolder under the clicked top-level folder
      setFolders((prev) =>
        prev.map((f) => {
          if (f.name === targetFolder) {
            return {
              ...f,
              subfolders: [...(f.subfolders || []), { name: folderName }],
            };
          }
          return f;
        })
      );
      setOpenFolders((prev) => ({ ...prev, [targetFolder]: true }));
      onSelectFolder(folderName);
    } else {
      // targetFolder is a subfolder — add new folder as sibling under the same parent
      let parentName: string | null = null;
      for (const folder of folders) {
        if (folder.subfolders?.some((s) => s.name === targetFolder)) {
          parentName = folder.name;
          break;
        }
      }
      if (parentName) {
        setFolders((prev) =>
          prev.map((f) => {
            if (f.name === parentName) {
              return {
                ...f,
                subfolders: [...(f.subfolders || []), { name: folderName }],
              };
            }
            return f;
          })
        );
        setOpenFolders((prev) => ({ ...prev, [parentName!]: true }));
        onSelectFolder(folderName);
      } else {
        // Fallback: add as new top-level folder before 'Shared'
        const newFolder: FolderConfig = { name: folderName };
        setFolders((prev) => {
          const index = prev.findIndex((f) => f.name === 'Shared');
          const updated = [...prev];
          index !== -1 ? updated.splice(index, 0, newFolder) : updated.push(newFolder);
          return updated;
        });
      }
    }

    // Initialize document list for the new folder
    setDocuments((prev) => ({
      ...prev,
      [folderName]: [],
    }));

    setFolderDialogOpen(false);
  };

  const handleUploadFileSubmit = (fileData: {
    name: string;
    type: string;
    description: string;
    accessLevel: string;
    permissions: string[];
    requireApproval: boolean;
  }) => {
    const newDoc: DocumentRowData = {
      id: `doc-${Date.now()}`,
      title: fileData.name,
      type: fileData.type.toUpperCase(),
      access: fileData.permissions.length > 0 ? fileData.permissions : [fileData.accessLevel.toUpperCase()],
      lastModified: 'Just now',
      owner: 'Current User',
      status: fileData.requireApproval ? 'Draft' : 'Approved',
      iconType: fileData.type.toLowerCase().includes('pdf') ? 'contact' : 'sales',
    };

    setDocuments((prev) => ({
      ...prev,
      [targetFolder]: [...(prev[targetFolder] || []), newDoc],
    }));

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
            
            {/* Outlined Action Icons — target the currently selected folder */}
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton
                size="small"
                onClick={() => { setTargetFolder(selectedFolder); setFolderDialogOpen(true); }}
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
                onClick={() => { setTargetFolder(selectedFolder); setFileDialogOpen(true); }}
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
                        onSelectFolder(folder.name);
                      }
                    }}
                    selected={isSelected}
                    onMouseEnter={() => setHoveredFolder(folder.name)}
                    onMouseLeave={() => setHoveredFolder(null)}
                    sx={{
                      borderRadius: '8px',
                      mb: 0.5,
                      py: 0.75,
                      color: isSelected ? 'primary.main' : 'text.primary',
                      '&:hover': { bgcolor: 'action.hover' },
                      pr: 0.5,
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
                          <span style={{ color: '#90A4AE', fontSize: '0.875rem', fontWeight: 400 }}>({getFolderCount(folder)})</span>
                        </Box>
                      }
                    />

                    {/* Inline hover action buttons */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.25,
                        opacity: hoveredFolder === folder.name ? 1 : 0,
                        transition: 'opacity 0.15s ease',
                        ml: 'auto',
                        flexShrink: 0,
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <IconButton
                        size="small"
                        title="Create Folder"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTargetFolder(folder.name);
                          setFolderDialogOpen(true);
                        }}
                        sx={{
                          color: '#1565C0',
                          p: 0.4,
                          '&:hover': { bgcolor: 'rgba(21,101,192,0.1)' },
                        }}
                      >
                        <CreateNewFolderOutlinedIcon sx={{ fontSize: '1rem' }} />
                      </IconButton>
                      <IconButton
                        size="small"
                        title="Upload File"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTargetFolder(folder.name);
                          setFileDialogOpen(true);
                        }}
                        sx={{
                          color: '#1565C0',
                          p: 0.4,
                          '&:hover': { bgcolor: 'rgba(21,101,192,0.1)' },
                        }}
                      >
                        <NoteAddOutlinedIcon sx={{ fontSize: '1rem' }} />
                      </IconButton>
                    </Box>

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
                            onClick={() => onSelectFolder(sub.name)}
                            onMouseEnter={() => setHoveredFolder(sub.name)}
                            onMouseLeave={() => setHoveredFolder(null)}
                            sx={{
                              borderRadius: '8px',
                              mb: 0.5,
                              py: 0.5,
                              pr: 0.5,
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
                                  <span style={{ color: '#90A4AE', fontSize: '0.875rem', fontWeight: 400 }}>({documents[sub.name]?.length ?? 0})</span>
                                </Box>
                              }
                            />

                            {/* Inline hover action buttons for subfolder */}
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.25,
                                opacity: hoveredFolder === sub.name ? 1 : 0,
                                transition: 'opacity 0.15s ease',
                                ml: 'auto',
                                flexShrink: 0,
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <IconButton
                                size="small"
                                title="Create Folder"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTargetFolder(sub.name);
                                  setFolderDialogOpen(true);
                                }}
                                sx={{
                                  color: '#1565C0',
                                  p: 0.4,
                                  '&:hover': { bgcolor: 'rgba(21,101,192,0.1)' },
                                }}
                              >
                                <CreateNewFolderOutlinedIcon sx={{ fontSize: '1rem' }} />
                              </IconButton>
                              <IconButton
                                size="small"
                                title="Upload File"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTargetFolder(sub.name);
                                  setFileDialogOpen(true);
                                }}
                                sx={{
                                  color: '#1565C0',
                                  p: 0.4,
                                  '&:hover': { bgcolor: 'rgba(21,101,192,0.1)' },
                                }}
                              >
                                <NoteAddOutlinedIcon sx={{ fontSize: '1rem' }} />
                              </IconButton>
                            </Box>
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
        folderPath={getFolderPath(targetFolder)}
      />

      {/* External Custom Upload File Dialog Component */}
      <UploadFileDialog
        open={fileDialogOpen}
        onClose={() => setFileDialogOpen(false)}
        onUpload={handleUploadFileSubmit}
        selectedFolderPath={getFolderPath(targetFolder)}
      />
    </Box>
  );
}
