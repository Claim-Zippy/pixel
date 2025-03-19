'use client';

import Layout from '@/components/Layout';
import { useState } from 'react';
import { Button, Container, Typography, Box, LinearProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import ImageIcon from '@mui/icons-material/Image';
import UploadIcon from '@mui/icons-material/Upload';
import axios from 'axios';

export default function ImagesPage() {
  const router = useRouter();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    setIsProcessing(false);
    setUploadProgress(0);
    setProcessingStatus('Starting upload...');

    try {
      // First phase: Upload
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const uploadPercentage = Math.round((progressEvent.loaded * 50) / progressEvent.total);
          setUploadProgress(uploadPercentage);
          setProcessingStatus(`Uploading PDF: ${uploadPercentage}%`);
        },
      });

      if (response.status === 200) {
        // Second phase: Processing
        setIsProcessing(true);
        setProcessingStatus('Processing PDF...');
        
        // Simulate processing progress
        let processProgress = 50;
        const processInterval = setInterval(() => {
          if (processProgress < 90) {
            processProgress += 5;
            setUploadProgress(processProgress);
            setProcessingStatus(`Processing PDF: ${processProgress}%`);
          }
        }, 500);

        const data = response.data;
        localStorage.setItem('uploadedPdfData', JSON.stringify(data));
        
        // Clear interval and complete the progress
        clearInterval(processInterval);
        setUploadProgress(100);
        setProcessingStatus('Processing complete!');

        // Reset progress states before navigation
        setTimeout(() => {
          setUploadProgress(0);
          setProcessingStatus('');
          setIsUploading(false);
          setIsProcessing(false);
          router.push('/images/view');
        }, 1000);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setProcessingStatus('Error occurred during upload');
      setIsUploading(false);
      setIsProcessing(false);
    }
  };

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3
        }}>
          <Typography variant="h4" component="h1">
            Document Scanner
          </Typography>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            id="pdf-upload"
          />
          <label htmlFor="pdf-upload">
            <Button
              variant="contained"
              component="span"
              startIcon={<UploadIcon />}
              sx={{
                mb: 2,
                '&:hover': {
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              Upload PDF
            </Button>
          </label>
          <Button
            variant="contained"
            startIcon={<ImageIcon />}
            onClick={() => router.push('/images/view')}
            sx={{
              '&:focus': {
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.4)',
                backgroundColor: 'primary.dark',
              },
              '&:hover': {
                transform: 'translateY(-2px)',
              },
            }}
          >
            View Images
          </Button>
          {(isUploading || isProcessing) && (
            <Box sx={{ width: '100%', mt: 2 }}>
              <LinearProgress 
                variant="determinate" 
                value={uploadProgress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    backgroundColor: isProcessing ? '#4caf50' : '#2196f3',
                  }
                }}
              />
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                {processingStatus}
              </Typography>
            </Box>
          )}
        </Box>
      </Container>
    </Layout>
  );
} 