import { useState } from 'react';
import { Box, Grid, Card, Typography } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import HistoryIcon from '@mui/icons-material/History';
import { PageHeader } from '../../../components/PageHeader';
import { FolderSidebar } from './FolderSidebar';
import { DocumentsTable } from './DocumentsTable';

export function LibraryPage() {
  const [selectedFolder, setSelectedFolder] = useState('Employee Docs');

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
            1,284
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
          />
        </Grid>

        {/* Right Side - Documents Table */}
        <Grid item xs={12} md={9}>
          <DocumentsTable selectedFolder={selectedFolder} />
        </Grid>
      </Grid>
    </Box>
  );
}
