import { useState, useEffect } from 'react';
import { Box, Grid, Card, Typography, CircularProgress } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import HistoryIcon from '@mui/icons-material/History';
import { PageHeader } from '../../../components/PageHeader';
import { FolderSidebar, FolderConfig } from './FolderSidebar';
import { DocumentsTable, DocumentRowData } from './DocumentsTable';

export function LibraryPage() {
  const [selectedFolder, setSelectedFolder] = useState('Employee Docs');
  const [folders, setFolders] = useState<FolderConfig[]>([]);
  const [documents, setDocuments] = useState<Record<string, DocumentRowData[]>>({});
  const [loading, setLoading] = useState(true);

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

  const totalFilesCount = Object.values(documents).reduce(
    (sum, docList) => sum + (docList?.length ?? 0),
    0
  );

  const headerSummaryCards = (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      {/* Card 1: Total Files */}
      <Card
        variant="outlined"
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 1.5,
          pl: 2,
          pr: 4,
          gap: 2,
          borderRadius: 3,
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          bgcolor: 'background.paper',
        }}
      >
        <Box
          sx={{
            p: 1,
            bgcolor: 'rgba(21, 101, 192, 0.08)',
            color: 'primary.main',
            borderRadius: '50%',
            display: 'flex',
          }}
        >
          <FolderIcon fontSize="small" />
        </Box>
        <Box>
          <Typography
            variant="caption"
            sx={{
              textTransform: 'uppercase',
              color: 'text.secondary',
              fontWeight: 700,
              fontSize: '0.625rem',
              letterSpacing: '0.05em',
              display: 'block',
            }}
          >
            TOTAL FILES
          </Typography>
          <Typography variant="subtitle1" fontWeight={800}>
            {loading ? '...' : totalFilesCount.toLocaleString()}
          </Typography>
        </Box>
      </Card>

      {/* Card 2: Last Modified */}
      <Card
        variant="outlined"
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 1.5,
          pl: 2,
          pr: 4,
          gap: 2,
          borderRadius: 3,
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          bgcolor: 'background.paper',
        }}
      >
        <Box
          sx={{
            p: 1,
            bgcolor: 'rgba(38, 166, 154, 0.08)',
            color: '#26A69A',
            borderRadius: '50%',
            display: 'flex',
          }}
        >
          <HistoryIcon fontSize="small" />
        </Box>
        <Box>
          <Typography
            variant="caption"
            sx={{
              textTransform: 'uppercase',
              color: 'text.secondary',
              fontWeight: 700,
              fontSize: '0.625rem',
              letterSpacing: '0.05em',
              display: 'block',
            }}
          >
            LAST MODIFIED
          </Typography>
          <Typography variant="subtitle1" fontWeight={800}>
            2h ago
          </Typography>
        </Box>
      </Card>
    </Box>
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
        actions={headerSummaryCards}
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
