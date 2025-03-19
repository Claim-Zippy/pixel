'use client';

import { Container, Typography, Box, Paper } from '@mui/material';
import Image from 'next/image';

export default function ViewImages() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 4, textAlign: 'center' }}>
        Image Gallery View
      </Typography>
      
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        gap: 4,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Paper 
          elevation={3}
          sx={{ 
            p: 2,
            position: 'relative',
            width: { xs: '100%', md: '45%' },
            height: { xs: 300, md: 400 },
          }}
        >
          <Image
            src="/image1.jpg" // Replace with your image path
            alt="First Image"
            fill
            style={{
              objectFit: 'cover',
              borderRadius: '4px',
            }}
          />
        </Paper>

        <Paper 
          elevation={3}
          sx={{ 
            p: 2,
            position: 'relative',
            width: { xs: '100%', md: '45%' },
            height: { xs: 300, md: 400 },
          }}
        >
          <Image
            src="/image2.jpg" // Replace with your image path
            alt="Second Image"
            fill
            style={{
              objectFit: 'cover',
              borderRadius: '4px',
            }}
          />
        </Paper>
      </Box>
    </Container>
  );
} 