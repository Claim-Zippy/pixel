'use client';

import { Container, Typography, Box as MuiBox, Paper, TextField, IconButton, Slider, Button, CircularProgress, LinearProgress, AppBar, Toolbar, Breadcrumbs, Link } from '@mui/material';
import { Undo, Redo, RestartAlt, Save, Build, ExpandLess, ExpandMore, Add, Remove, RotateLeft, RotateRight, Refresh, ZoomIn, ZoomOut, NavigateBefore, NavigateNext, Home } from '@mui/icons-material';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { DataGrid, GridColDef, GridRowParams, GridCellParams } from '@mui/x-data-grid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Alert from '@mui/material/Alert';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import ImageOverlay from './components/ImageOverlay';
import { toast, Toaster } from 'react-hot-toast';
import Layout from '@/components/Layout';
import { pages } from 'next/dist/build/templates/app-page';
import DocumentTypeSelector from '@/components/DocumentTypeSelector';
import { getColumnSignature, getColumns, detectDocumentType, getColumnsForDocumentType, calculateNewConfidence, mapColumnsBasedOnRotation } from '@/utils/documentUtils';
import Box from '@mui/material/Box';

interface CalibrationParams {
  scale: number;
  offsetX: number;
  offsetY: number;
}

const DEFAULT_CALIBRATION: CalibrationParams = {
  scale: 1,
  offsetX: 0,
  offsetY: 0
};

interface ImageDimensions {
  width: number;
  height: number;
}

interface GroupedImages {
  type: string;
  columns: string[];
  images: any[];
}

const getConfidenceClass = (params: GridRowParams) => {
  if (params.row.isEdited) return 'edited-row';
  const confidence = params.row.confidence;
  
  if (confidence >= 0.9) return 'high-confidence-row';
  if (confidence >= 0.7) return 'medium-confidence-row';
  return 'low-confidence-row';
};

const dataGridSx = {
  '& .MuiDataGrid-cell': {
    padding: '8px',
  },
  '& .edited-row': {
    backgroundColor: '#e3f2fd',
  },
  '& .high-confidence-row': {
    backgroundColor: '#e8f5e9',
  },
  '& .medium-confidence-row': {
    backgroundColor: '#fff3e0',
  },
  '& .low-confidence-row': {
    backgroundColor: '#ffebee',
  },
  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: '#f5f5f5',
  },
  height: '500px',
  width: '100%'
};

export default function ViewImagesPage() {
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions>({ width: 0, height: 0 });
  const imageContainerRef = useRef<HTMLDivElement | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showCalibrationControls, setShowCalibrationControls] = useState(false);
  const [calibrationParams, setCalibrationParams] = useState<CalibrationParams>(DEFAULT_CALIBRATION);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [lastEditedIndex, setLastEditedIndex] = useState<number | null>(null);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [editedText, setEditedText] = useState<{[key: string]: string}>({});
  const [savedPositions, setSavedPositions] = useState<{[key: number]: {x: number, y: number}}>({});
  const [history, setHistory] = useState<any[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const [loadedImages, setLoadedImages] = useState<{[key: number]: boolean}>({});
  const [editingCell, setEditingCell] = useState<{id: string | number, field: string, bbox?: number[][]} | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [rotation, setRotation] = useState(0);
  const [isRescanning, setIsRescanning] = useState(false);
  const [documentType, setDocumentType] = useState<string>('');
  const [groupedImages, setGroupedImages] = useState<GroupedImages[]>([]);
  const [allGroupedImages, setAllGroupedImages] = useState<GroupedImages[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<GroupedImages[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [availableGroups] = useState(['All Documents', 'Schedule of Charges', 'ICU Records']);
  const [rotations, setRotations] = useState<{[key: number]: number}>({});

  // Function to prepare data for DataGrid
  const prepareGridData = (extractedData: any[]) => {
    return extractedData.map((item, index) => {
      // Check if we have original_data
      if (item.original_data) {
        return {
          id: index,
          slNo: item.original_data.slNo || '',
          category: item.original_data.category || item.text.split('|')[0] || '', // Add fallback
          procedure: item.original_data.procedure || '',
          cClass: item.original_data.cClass || '',
          bClass: item.original_data.bClass || '',
          aClass: item.original_data.aClass || '',
          confidence: item.confidence_score,
          originalItem: item
        };
      }
      
      // Legacy pipe-delimited format handling
      const parts = item.text.split('|');
      return {
        id: index,
        slNo: parts[0] || '',
        category: parts[1] || '', // Fix the index for category
        procedure: parts[2] || '',
        cClass: parts[3] || '',
        bClass: parts[4] || '',
        aClass: parts[5] || '',
        confidence: item.confidence_score,
        originalItem: item
      };
    });
  };

  // Enhanced column definitions for the DataGrid
  const columns: GridColDef[] = [
    { 
      field: 'slNo', 
      headerName: 'Sl. No.', 
      width: 70,
      cellClassName: (params) => `confidence-${params.row.confidence}`
    },
    { 
      field: 'category', 
      headerName: 'Category/Procedure', 
      width: 300,
      flex: 1,
      cellClassName: (params) => `confidence-${params.row.confidence}`,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value || ''}
        </Typography>
      )
    },
    { 
      field: 'cClass', 
      headerName: 'C Class General Ward', 
      width: 180, 
      editable: true,
      align: 'right',
      headerAlign: 'right',
      cellClassName: (params) => `confidence-${params.row.confidence}`,
      renderCell: (params) => (
        <Typography variant="body2">
          ₹{params.value}
        </Typography>
      )
    },
    { 
      field: 'bClass', 
      headerName: 'B Class Twin sharing', 
      width: 180, 
      editable: true,
      align: 'right',
      headerAlign: 'right',
      cellClassName: (params) => `confidence-${params.row.confidence}`,
      renderCell: (params) => (
        <Typography variant="body2">
          ₹{params.value}
        </Typography>
      )
    },
    { 
      field: 'aClass', 
      headerName: 'A Class Single A/c', 
      width: 180, 
      editable: true,
      align: 'right',
      headerAlign: 'right',
      cellClassName: (params) => `confidence-${params.row.confidence}`,
      renderCell: (params) => (
        <Typography variant="body2">
          ₹{params.value}
        </Typography>
      )
    },
  ];

  const handleSliderChange = (param: keyof CalibrationParams) => (_event: Event, newValue: number | number[]) => {
    setCalibrationParams({
      ...calibrationParams,
      [param]: newValue as number
    });
  };

  const toggleCalibration = () => {
    setIsCalibrating(!isCalibrating);
  };

  const handleUndo = () => {
    if (currentHistoryIndex > 0) {
      const prevState = history[currentHistoryIndex - 1];
      setEditedText(prevState.editedText);
      setSavedPositions(prevState.savedPositions);
      setCurrentHistoryIndex(currentHistoryIndex - 1);
    }
  };

  const handleRedo = () => {
    if (currentHistoryIndex < history.length - 1) {
      const nextState = history[currentHistoryIndex + 1];
      setEditedText(nextState.editedText);
      setSavedPositions(nextState.savedPositions);
      setCurrentHistoryIndex(currentHistoryIndex + 1);
    }
  };

  const handleReset = () => {
    setCalibrationParams(DEFAULT_CALIBRATION);
  };

  const handleSave = () => {
    // Save current state
    console.log("Saving positions:", savedPositions);
    console.log("Saving edited text:", editedText);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.85) {
      return 'rgba(56, 142, 60, 0.2)'; // Green for high confidence
    } else if (confidence >= 0.7) {
      return 'rgba(245, 124, 0, 0.2)'; // Orange for medium confidence
    } else {
      return 'rgba(211, 47, 47, 0.2)'; // Red for low confidence
    }
  };

  const scaleCoordinates = (bbox: number[][], imageContainer: HTMLDivElement, naturalWidth: number, naturalHeight: number) => {
    const containerRect = imageContainer.getBoundingClientRect();
    const scale = Math.min(
      containerRect.width / naturalWidth,
      containerRect.height / naturalHeight
    );

    return bbox.map(([x, y]) => [
      x * scale + (containerRect.width - naturalWidth * scale) / 2,
      y * scale + (containerRect.height - naturalHeight * scale) / 2
    ]);
  };

  const handleZoom = (type: 'in' | 'out' | 'reset') => {
    switch(type) {
      case 'in':
        setZoom(prev => Math.min(prev + 0.1, 3));
        break;
      case 'out':
        setZoom(prev => Math.max(prev - 0.1, 0.5));
        break;
      case 'reset':
        setZoom(1);
        break;
    }
  };

  const handleRotate = (direction: 'left' | 'right') => {
    setRotations(prev => ({
      ...prev,
      [currentImageIndex]: direction === 'left' 
        ? ((prev[currentImageIndex] || 0) - 90) % 360 
        : ((prev[currentImageIndex] || 0) + 90) % 360
    }));
  };

  const handleRescan = async () => {
    try {
      if (!uploadedImages[currentImageIndex]) {
        toast.error('No image selected for rescanning');
        return;
      }

      setIsRescanning(true);
      
      const currentImage = uploadedImages[currentImageIndex];
      
      const response = await fetch('http://localhost:3001/api/rescan-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: currentImage.imageUrl,
          rotation: rotation,
          imageIndex: currentImageIndex,
          documentType: selectedGroup,
          expectedColumns: getColumnsForDocumentType(selectedGroup, rotation)
        }),
      });

      if (!response.ok) {
        throw new Error('Rescan failed');
      }

      const data = await response.json();
      
      // Update confidence levels and column mapping based on new scan
      const updatedData = {
        ...data,
        extractedData: data.extractedData.map((item: any) => ({
          ...item,
          confidence_score: calculateNewConfidence(item, rotation),
          mapped_columns: mapColumnsBasedOnRotation(item, rotation, selectedGroup)
        }))
      };

      const updatedImages = [...uploadedImages];
      updatedImages[currentImageIndex] = {
        ...currentImage,
        ...updatedData
      };

      setUploadedImages(updatedImages);
      toast.success('Document rescanned successfully');
    } catch (error) {
      toast.error('Failed to rescan document');
    } finally {
      setIsRescanning(false);
    }
  };

  // Modify the grouping logic
  const groupSimilarImages = (images: any[]) => {
    if (!images.length) return [];

    // Create two groups based on the column structure
    const scheduleGroup = {
      type: 'Schedule of Charges',
      images: images.slice(0, 2), // First two images
      columns: getColumns(images[0].extractedData)
    };

    const icuGroup = {
      type: 'ICU Records',
      images: images.slice(2), // Last two images
      columns: getColumns(images[2].extractedData)
    };

    return [scheduleGroup, icuGroup];
  };

  // Update useEffect for initial loading
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const storedData = localStorage.getItem('uploadedPdfData');
        
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          if (parsedData.success && Array.isArray(parsedData.images)) {
            const processedImages = parsedData.images.map((img: any) => ({
              ...img,
              imageUrl: img.imageUrl.startsWith('http') 
                ? img.imageUrl 
                : `http://localhost:3001${img.imageUrl}`
            }));

            setUploadedImages(processedImages);
            const groups = groupSimilarImages(processedImages);
            setAllGroupedImages(groups);
            setAvailableGroups(['All Documents', 'Schedule of Charges', 'ICU Records']);
            setSelectedGroup('All Documents');
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setLoadError('Failed to load document data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    // Detailed debug information to help troubleshoot
    console.log("All uploaded images:", uploadedImages);
    
    if (uploadedImages.length > 0) {
      uploadedImages.forEach((img, idx) => {
        if (img.extractedData && img.extractedData.length > 0) {
          const firstItem = img.extractedData[0];
          console.log(`Image ${idx+1} - First data item:`, firstItem);
          
          if (firstItem.original_data) {
            console.log(`Image ${idx+1} has structured data`);
          } else if (firstItem.text && firstItem.text.includes('Error')) {
            console.log(`Image ${idx+1} has error: ${firstItem.text}`);
          }
        }
      });
    }
  }, [uploadedImages]);

  useEffect(() => {
    // Log the extracted data when it changes
    if (uploadedImages.length > 0 && currentImageIndex < uploadedImages.length) {
      console.log("Current image data:", uploadedImages[currentImageIndex]);
      
      if (uploadedImages[currentImageIndex].extractedData) {
        console.log("Extracted data sample:", 
          uploadedImages[currentImageIndex].extractedData.slice(0, 3));
        
        // Also log the prepared grid data
        const gridData = prepareGridData(uploadedImages[currentImageIndex].extractedData);
        console.log("Prepared grid data sample:", gridData.slice(0, 3));
      }
    }
  }, [uploadedImages, currentImageIndex]);

  // When a cell edit starts
  const handleCellEditStart = (params: GridCellParams) => {
    const rowIndex = Number(params.id);
    const bbox = uploadedImages[currentImageIndex]?.extractedData[rowIndex]?.bbox;
    
    setEditingCell({
      id: params.id,
      field: params.field,
      bbox: bbox
    });
  };

  // When a cell edit stops
  const handleCellEditStop = () => {
    setEditingCell(null);
  };

  // Add this function at the bottom of your component
  // This helps with hot reload connection issues
  useEffect(() => {
    // Detect WebSocket connection errors and implement retry
    const handleConnectionError = (event: ErrorEvent) => {
      if (event.message.includes('WebSocket') || 
          event.message.includes('connection') || 
          event.message.includes('Receiving end does not exist')) {
        console.log('WebSocket connection error detected, will retry connection');
        
        // Try to reconnect after a delay
        setTimeout(() => {
          console.log('Attempting to reconnect WebSocket...');
          // The mere act of accessing this will trigger a reconnection attempt
          window.location.href = window.location.href;
        }, 3000);
      }
    };
    
    window.addEventListener('error', handleConnectionError);
    
    return () => {
      window.removeEventListener('error', handleConnectionError);
    };
  }, []);

  useEffect(() => {
    if (uploadedImages.length > 0) {
      const grouped = groupSimilarImages(uploadedImages);
      setGroupedImages(grouped);
    }
  }, [uploadedImages]);

  // Add handler for document type changes
  const handleDocumentTypeChange = (newType: string) => {
    setDocumentType(newType);
    if (newType) {
      const filtered = allGroupedImages.filter(group => group.type === newType);
      setFilteredGroups(filtered);
    } else {
      setFilteredGroups(allGroupedImages);
    }
    setCurrentImageIndex(0); // Reset to first image when changing groups
  };

  // Add handler for group selection
  const handleGroupChange = (newGroup: string) => {
    setSelectedGroup(newGroup);
    setCurrentImageIndex(0);
  };

  // Update getCurrentImages function
  const getCurrentImages = () => {
    switch (selectedGroup) {
      case 'Schedule of Charges':
        return uploadedImages.slice(0, 2);
      case 'ICU Records':
        return uploadedImages.slice(2);
      case 'All Documents':
        return uploadedImages;
      default:
        return [];
    }
  };

  const getConfidenceStyle = (confidence: number, isRotated: boolean) => {
    if (confidence > 0.8) {
      return 'high-confidence-row';
    }
    if (confidence < 0.6) {
      return 'low-confidence-row';
    }
    return 'medium-confidence-row';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </div>
    );
  }
 
  if (!uploadedImages.length) {
    return (
      <div style={{ padding: '1rem' }}>
        <Typography variant="h6" align="center">
          No images uploaded yet. Please upload a PDF first.
        </Typography>
      </div>
    );
  }

  const currentDisplayImage = uploadedImages[currentImageIndex];

  return (
    <Layout>
      <div className="view-images-container">
        <Toaster position="top-right" />
        
        <AppBar 
          position="relative" 
          color="default" 
          elevation={1}
          sx={{ 
            mb: 3,
            zIndex: (theme) => theme.zIndex.drawer + 1
          }}
        >
          <Toolbar>
            <Breadcrumbs aria-label="breadcrumb" sx={{ flex: 1 }}>
              <Link href="/" color="inherit">
                <Home sx={{ mr: 0.5 }} fontSize="inherit" />
                Home
              </Link>
              <Typography color="text.primary">PIXEL Results</Typography>
            </Breadcrumbs>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ mt: 4, mb: 3 }}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ mt: 2 }}>
              <DocumentTypeSelector 
                value={selectedGroup}
                onChange={handleGroupChange}
              />
            </Box>
          </Paper>

          {selectedGroup && getCurrentImages().length > 0 && (
            <Paper sx={{ p: 3 }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 2 
              }}>
                <Typography variant="h6">{selectedGroup}</Typography>
                <Typography>
                  Page {currentImageIndex + 1} of {getCurrentImages().length}
                </Typography>
              </Box>

              {/* Navigation Controls */}
              <Paper sx={{ 
                p: 1, 
                mb: 2, 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                backgroundColor: '#f5f5f5' 
              }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    startIcon={<NavigateBefore />}
                    onClick={() => setCurrentImageIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentImageIndex === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    endIcon={<NavigateNext />}
                    onClick={() => setCurrentImageIndex(prev => 
                      Math.min(getCurrentImages().length - 1, prev + 1))}
                    disabled={currentImageIndex === getCurrentImages().length - 1}
                  >
                    Next
                  </Button>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton onClick={() => handleRotate('left')} title="Rotate Left">
                    <RotateLeft />
                  </IconButton>
                  <IconButton onClick={() => handleRotate('right')} title="Rotate Right">
                    <RotateRight />
                  </IconButton>
                  <IconButton 
                    onClick={handleRescan} 
                    disabled={isRescanning}
                    title="Rescan"
                  >
                    <Refresh />
                  </IconButton>
                </Box>
              </Paper>

              {/* Content Area */}
              <Box sx={{ 
                display: 'flex', 
                gap: 3,
                height: 'calc(100vh - 250px)',
                minHeight: '600px'
              }}>
                {/* Image Viewer */}
                <Paper sx={{ 
                  flex: 1,
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}>
                  <Box sx={{ flex: 1, position: 'relative' }}>
                    <TransformWrapper>
                      {({ zoomIn, zoomOut, resetTransform }) => (
                        <>
                          <Box sx={{ 
                            display: 'flex', 
                            gap: 1, 
                            mb: 2, 
                            justifyContent: 'center' 
                          }}>
                            <IconButton onClick={() => zoomIn()}>
                              <ZoomIn />
                            </IconButton>
                            <IconButton onClick={() => zoomOut()}>
                              <ZoomOut />
                            </IconButton>
                            <IconButton onClick={() => resetTransform()}>
                              <RestartAlt />
                            </IconButton>
                          </Box>
                          <TransformComponent>
                            <Image
                              src={getCurrentImages()[currentImageIndex]?.imageUrl || ''}
                              alt={`Page ${currentImageIndex + 1}`}
                              width={800}
                              height={1000}
                              style={{ 
                                objectFit: 'contain',
                                transform: `rotate(${rotations[currentImageIndex] || 0}deg)`,
                                transition: 'transform 0.3s ease'
                              }}
                            />
                          </TransformComponent>
                        </>
                      )}
                    </TransformWrapper>
                  </Box>
                </Paper>

                {/* Data Grid */}
                <Paper sx={{ 
                  flex: 1,
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}>
                  {getCurrentImages()[currentImageIndex]?.extractedData && (
                    <Box sx={{ 
                      height: 600, 
                      width: '100%',
                      '& .confidence-level-high': {
                        backgroundColor: 'rgba(56, 142, 60, 0.2)'
                      },
                      '& .confidence-level-medium': {
                        backgroundColor: 'rgba(245, 124, 0, 0.2)'
                      },
                      '& .confidence-level-low': {
                        backgroundColor: 'rgba(211, 47, 47, 0.2)'
                      },
                      '& .MuiDataGrid-row:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04) !important'
                      }
                    }}>
                      <DataGrid
                        rows={prepareGridData(getCurrentImages()[currentImageIndex].extractedData)}
                        columns={columns}
                        pageSize={100}
                        rowsPerPageOptions={[25, 50, 100]}
                        disableSelectionOnClick
                        autoHeight={false}
                        scrollbarSize={17}
                        getRowClassName={(params) => {
                          const confidence = params.row.confidence || 0;
                          return `confidence-level-${confidence >= 0.85 ? 'high' : confidence >= 0.7 ? 'medium' : 'low'}`;
                        }}
                        sx={{
                          '& .MuiDataGrid-main': { 
                            overflow: 'auto',
                            maxHeight: 'none'
                          },
                          '& .MuiDataGrid-virtualScroller': {
                            overflow: 'auto'
                          },
                          '& .MuiDataGrid-row': {
                            '&.confidence-level-high': {
                              backgroundColor: 'rgba(56, 142, 60, 0.2)'
                            },
                            '&.confidence-level-medium': {
                              backgroundColor: 'rgba(245, 124, 0, 0.2)'
                            },
                            '&.confidence-level-low': {
                              backgroundColor: 'rgba(211, 47, 47, 0.2)'
                            }
                          }
                        }}
                      />
                    </Box>
                  )}
                </Paper>
              </Box>
            </Paper>
          )}
        </Container>
      </div>
    </Layout>
  );
} 


