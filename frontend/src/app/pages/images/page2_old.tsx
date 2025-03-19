'use client';

import { Button, Container, Typography, Box } from '@mui/material';
import { useRouter } from 'next/navigation';
import ImageIcon from '@mui/icons-material/Image';

export default function ImagesLink() {
  const router = useRouter();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3
      }}>
        <Typography variant="h4" component="h1">
          Image Gallery
        </Typography>
        <Button
          variant="contained"
          startIcon={<ImageIcon />}
          onClick={() => router.push('/pages/images/view')}
          sx={{
            '&:focus': {
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.4)',
              backgroundColor: 'primary.dark',
            },
            '&:hover': {
              transform: 'translateY(2px)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          View Images
        </Button>
      </Box>
    </Container>
  );
} 