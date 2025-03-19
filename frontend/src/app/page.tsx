'use client';

import Layout from '@/components/Layout';
import { Box, Typography, Button } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <Layout>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        textAlign: 'center'
      }}>
        <Typography variant="h3" sx={{ mb: 2 }}>
          Welcome to PIXEL
        </Typography>
        <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
        (Precise Information eXtraction & Enhanced Learning)
        </Typography>
        <Typography variant="h6" sx={{ mb: 4, color: 'text.secondary' }}>
          Pixel perfect document intelligence
        </Typography>
        <Button 
          variant="contained" 
          size="large"
          onClick={() => router.push('/images')}
        >
          Get Started
        </Button>
      </Box>
    </Layout>
  );
}
