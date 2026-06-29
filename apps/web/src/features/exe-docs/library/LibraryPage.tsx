import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  CircularProgress,
  Button,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { PageHeader } from '../../../components/PageHeader';
import { FolderSidebar, FolderConfig } from './FolderSidebar';
import { DocumentsTable, DocumentRowData } from './DocumentsTable';

export function LibraryPage() {
  const [selectedFolder, setSelectedFolder] = useState('Employee Docs');
  const [folders, setFolders] = useState<FolderConfig[]>([]);
  const [documents, setDocuments] = useState<Record<string, DocumentRowData[]>>({});
  const [loading, setLoading] = useState(true);
  const [triggerUpload, setTriggerUpload] = useState(0);

  useEffect(() => {
    fetch('/data/library.json')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.folders) setFolders(data.folders);
        if (data.documents) setDocuments(data.documents);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching library data:', err);
        setLoading(false);
      });
  }, []);

  const handleCreateNewClick = () => {
    setTriggerUpload((prev) => prev + 1);
  };

  const headerActions = (
    <Button
      variant="contained"
      color="primary"
      startIcon={<AddIcon />}
      onClick={handleCreateNewClick}
      sx={{
        borderRadius: '20px',
        px: 3,
        py: 1,
        fontWeight: 700,
        textTransform: 'none',
        boxShadow: '0 4px 14px rgba(21, 101, 192, 0.3)',
        '&:hover': {
          boxShadow: '0 6px 20px rgba(21, 101, 192, 0.4)',
        },
      }}
    >
      Create New
    </Button>
  );

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          gap: 2,
        }}
      >
        <CircularProgress size={40} thickness={4} sx={{ color: '#1565C0' }} />
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          Loading library data...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Document Library"
        subtitle="Access and manage high-level corporate assets and strategy directives."
        breadcrumbs={[
          { label: 'Dashboard', to: '/exec-docs' },
          { label: 'Document Library' },
        ]}
        actions={headerActions}
      />

      <Grid container spacing={3}>
        {/* Left Side - Folder Hierarchy & States */}
        <Grid item xs={12} md={3}>
          <FolderSidebar
            selectedFolder={selectedFolder}
            onSelectFolder={setSelectedFolder}
            folders={folders}
            setFolders={setFolders}
            documents={documents}
            setDocuments={setDocuments}
            triggerUpload={triggerUpload}
          />
        </Grid>

        {/* Right Side - Documents Table */}
        <Grid item xs={12} md={9}>
          <DocumentsTable selectedFolder={selectedFolder} documents={documents} />
        </Grid>
      </Grid>
    </Box>
  );
}
