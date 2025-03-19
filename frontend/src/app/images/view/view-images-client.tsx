'use client';

import { useState, useEffect, useRef } from 'react';
import { Container, Typography, Box, Paper, TextField, IconButton } from '@mui/material';
import Image from 'next/image';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';

interface ImageDimensions {
  width: number;
  height: number;
}

interface Position {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

interface ExtractedData {
  text: string;
  confidence_score: number;
  bbox: number[][];
}

export default function ViewImagesClient() {
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageDimensions, setImageDimensions] = useState<{[key: number]: ImageDimensions}>({});
  const imageContainerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const digitalContainerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [loadedImages, setLoadedImages] = useState<{[key: number]: boolean}>({});
  const [editMode, setEditMode] = useState<{[key: string]: boolean}>({});
  const [editedText, setEditedText] = useState<{[key: string]: string}>({});

  // Function to determine color based on confidence score
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.85) {
      return 'rgba(56, 142, 60, 0.2)'; // Green for high confidence
    } else if (confidence >= 0.7) {
      return 'rgba(245, 124, 0, 0.2)'; // Orange for medium confidence
    } else {
      return 'rgba(211, 47, 47, 0.2)'; // Red for low confidence
    }
  };

  // Scale coordinates according to the container size
  const scaleCoordinates = (
    bbox: number[][], 
    containerEl: HTMLDivElement,
    originalWidth: number,
    originalHeight: number
  ) => {
    const containerRect = containerEl.getBoundingClientRect();
    const scaleX = containerRect.width / originalWidth;
    const scaleY = containerRect.height / originalHeight;
    
    const [[x1, y1], , [x2, y2]] = bbox;
    
    return {
      left: x1 * scaleX,
      top: y1 * scaleY,
      width: (x2 - x1) * scaleX,
      height: (y2 - y1) * scaleY
    };
  };

  // Fetch uploaded images
  useEffect(() => {
    const fetchImages = async () => {
      try {
        // Try to load from localStorage first
        const uploadedData = localStorage.getItem('uploadedPdfData');
        if (uploadedData) {
          const data = JSON.parse(uploadedData);
          if (data.success && data.images && Array.isArray(data.images)) {
            const processedImages = data.images.map(img => ({
              ...img,
              imageUrl: `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}${img.imageUrl}`
            }));
            setUploadedImages(processedImages);
            
            // Initialize refs arrays
            imageContainerRefs.current = new Array(processedImages.length).fill(null);
            digitalContainerRefs.current = new Array(processedImages.length).fill(null);
            setLoading(false);
            return;
          }
        }
        
        // If nothing in localStorage, fetch from API
        const response = await fetch('/api/images');
        const data = await response.json();
        
        if (data.success) {
          setUploadedImages(data.images);
          
          // Initialize refs arrays
          imageContainerRefs.current = new Array(data.images.length).fill(null);
          digitalContainerRefs.current = new Array(data.images.length).fill(null);
        }
      } catch (error) {
        console.error('Error fetching images:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  // Handle edit mode toggle
  const toggleEditMode = (itemKey: string, text: string) => {
    setEditMode(prev => ({
      ...prev,
      [itemKey]: !prev[itemKey]
    }));
    
    if (!editMode[itemKey]) {
      setEditedText(prev => ({
        ...prev,
        [itemKey]: text
      }));
    }
  };

  // Handle text edit changes
  const handleTextChange = (itemKey: string, value: string) => {
    setEditedText(prev => ({
      ...prev,
      [itemKey]: value
    }));
  };

  // Handle save edits
  const saveEdit = (itemKey: string, index: number, dataIndex: number) => {
    // Here you would implement the API call to save the edited text
    console.log(`Saving edit for ${itemKey}:`, editedText[itemKey]);
    
    // Update local state (in a real app, this would happen after successful API response)
    const updatedImages = [...uploadedImages];
    updatedImages[index].extractedData[dataIndex].text = editedText[itemKey];
    setUploadedImages(updatedImages);
    
    // Exit edit mode
    toggleEditMode(itemKey, '');
  };

  // Convert the extracted data to a format suitable for DataGrid
  const prepareGridData = (extractedData: any[]) => {
    return extractedData.map((item, index) => {
      // First try to get data from original_data
      const data = {
        id: index,
        slNo: item.original_data?.slNo || '',
        category: item.original_data?.category || '',
        procedure: item.original_data?.procedure || '',
        cClass: item.original_data?.cClass || '',
        bClass: item.original_data?.bClass || '',
        aClass: item.original_data?.aClass || '',
        confidence: item.confidence_score || 0,
        editedFields: item.editedFields || [],
        isEdited: item.isEdited || false,
        text: item.text || ''
      };

      // If no original_data, try parsing from text
      if (!item.original_data && item.text) {
        const parts = item.text.split('|');
        if (parts.length >= 6) {
          data.category = parts[0];
          data.slNo = parts[1];
          data.procedure = parts[2];
          data.cClass = parts[3];
          data.bClass = parts[4];
          data.aClass = parts[5];
        }
      }

      return data;
    });
  };

  // Define the columns for the DataGrid
  const columns: GridColDef[] = [
    { 
      field: 'slNo', 
      headerName: 'SI. No.', 
      width: 70, 
      editable: true,
      cellClassName: (params) => {
        return params.row.editedFields?.includes('slNo') ? 'edited-cell' : '';
      }
    },
    { 
      field: 'procedure', 
      headerName: 'Category/Procedure', 
      flex: 1, 
      minWidth: 200,
      editable: true,
      cellClassName: (params) => {
        return params.row.editedFields?.includes('procedure') ? 'edited-cell' : '';
      }
    },
    { 
      field: 'cClass', 
      headerName: 'C Class General Ward', 
      width: 180, 
      editable: true,
      cellClassName: (params) => {
        return params.row.editedFields?.includes('cClass') ? 'edited-cell' : '';
      }
    },
    { 
      field: 'bClass', 
      headerName: 'B Class Twin sharing', 
      width: 180, 
      editable: true,
      cellClassName: (params) => {
        return params.row.editedFields?.includes('bClass') ? 'edited-cell' : '';
      }
    },
    { 
      field: 'aClass', 
      headerName: 'A Class Single A/c', 
      width: 180, 
      editable: true,
      cellClassName: (params) => {
        return params.row.editedFields?.includes('aClass') ? 'edited-cell' : '';
      }
    }
  ];

  if (loading) {
    return (
      <Container>
        <Typography variant="h4" sx={{ my: 4 }}>Loading...</Typography>
      </Container>
    );
  }

  if (uploadedImages.length === 0) {
    return (
      <Container>
        <Typography variant="h4" sx={{ my: 4 }}>No images have been scanned yet.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ my: 4 }}>PIXEL Results</Typography>
      
      {uploadedImages.map((image, index) => (
        <Paper elevation={3} sx={{ p: 2, mb: 4 }} key={index}>
          <Typography variant="h6" sx={{ mb: 2 }}>Page {index + 1}</Typography>
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'row',
            gap: 2,
            mb: 2,
            minHeight: '800px'
          }}>
            {/* Left side - Original image */}
            <Box 
              ref={el => imageContainerRefs.current[index] = el}
              sx={{ 
                position: 'relative',
                width: '50%',
                height: '800px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                overflow: 'hidden'
              }}
            >
              <Image
                src={image.imageUrl}
                alt={`Page ${index + 1} original`}
                fill
                style={{ objectFit: 'contain' }}
                onLoadingComplete={(img) => {
                  setImageDimensions(prev => ({
                    ...prev,
                    [index]: {
                      width: img.naturalWidth,
                      height: img.naturalHeight
                    }
                  }));
                  setLoadedImages(prev => ({ ...prev, [index]: true }));
                }}
              />
            </Box>

            {/* Right side - Digital reconstruction with editing capability */}
            <Box
              ref={el => digitalContainerRefs.current[index] = el}
              sx={{ 
                position: 'relative',
                width: '50%',
                height: '800px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                overflow: 'auto',
               
                backgroundColor: 'lightblue' // Distinctive color for debugging
              }}
            >
              {loadedImages[index] && (
                <Box sx={{ height: '100%', width: '100%', p: 2 }}>
                  {/* Table header */}
                  <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Typography variant="h5" fontWeight="bold">TARRIF LIST w.e.f 1st January 2020</Typography>
                    <Typography variant="h6" fontWeight="bold">SCHEDULE OF CHARGES</Typography>
                  </Box>

                  {/* DataGrid */}
                  {image.extractedData && (
                    <DataGrid
                      rows={prepareGridData(image.extractedData || [])}
                      columns={columns}
                      autoHeight
                      editMode="cell"
                      getRowClassName={(params) => params.row.isEdited ? 'edited-row' : ''}
                      sx={{
                        '& .edited-row': {
                          backgroundColor: 'rgba(144, 202, 249, 0.2)',
                        },
                        '& .edited-cell': {
                          position: 'relative',
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: 2,
                            right: 2,
                            width: 8,
                            height: 8,
                            backgroundColor: '#1976d2',
                            borderRadius: '50%',
                          }
                        },
                        '& .MuiDataGrid-cell': {
                          borderColor: 'divider',
                        }
                      }}
                      onCellEditCommit={(params) => {
                        console.log('Cell edit committed:', params);
                        const { id, field, value } = params;
                        const updatedImages = [...uploadedImages];
                        const rowIndex = Number(id);

                        // Ensure the data structure exists
                        if (!updatedImages[index].extractedData[rowIndex].original_data) {
                          updatedImages[index].extractedData[rowIndex].original_data = {};
                        }
                        if (!updatedImages[index].extractedData[rowIndex].editedFields) {
                          updatedImages[index].extractedData[rowIndex].editedFields = [];
                        }

                        // Update the original_data
                        updatedImages[index].extractedData[rowIndex].original_data[field] = value;

                        // Track edited fields
                        if (!updatedImages[index].extractedData[rowIndex].editedFields.includes(field)) {
                          updatedImages[index].extractedData[rowIndex].editedFields.push(field);
                        }
                        updatedImages[index].extractedData[rowIndex].isEdited = true;

                        // Update the text representation
                        const newText = [
                          updatedImages[index].extractedData[rowIndex].original_data.category || '',
                          updatedImages[index].extractedData[rowIndex].original_data.slNo || '',
                          updatedImages[index].extractedData[rowIndex].original_data.procedure || '',
                          updatedImages[index].extractedData[rowIndex].original_data.cClass || '',
                          updatedImages[index].extractedData[rowIndex].original_data.bClass || '',
                          updatedImages[index].extractedData[rowIndex].original_data.aClass || ''
                        ].join('|');

                        updatedImages[index].extractedData[rowIndex].text = newText;

                        // Force a re-render
                        setUploadedImages([...updatedImages]);
                      }}
                      disableRowSelectionOnClick
                    />
                  )}
                </Box>
              )}
            </Box>
          </Box>
        </Paper>
      ))}
    </Container>
  );
} 