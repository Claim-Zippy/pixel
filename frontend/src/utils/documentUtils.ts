import { ExtractedData } from '../types';

export const getColumnSignature = (columns: any[]) => {
  return columns.map(col => col.field).join('|');
};

export const getColumns = (documentType: string) => {
  // Default columns for Schedule of Charges
  const defaultColumns = [
    { field: 'slNo', headerName: 'SI. No.', width: 70 },
    { field: 'category', headerName: 'Category', width: 200 },
    { field: 'procedure', headerName: 'Procedure', width: 200 },
    { field: 'cClass', headerName: 'C Class', width: 130 },
    { field: 'bClass', headerName: 'B Class', width: 130 },
    { field: 'aClass', headerName: 'A Class', width: 130 }
  ];

  // ICU Records columns (for rotated view)
  const icuColumns = [
    { field: 'roomNumber', headerName: 'Room Number', width: 130 },
    { field: 'wardType', headerName: 'Ward Type', width: 150 },
    { field: 'nursingCharges', headerName: 'Nursing Charges', width: 150 },
    { field: 'privateCharges', headerName: 'Private Charges', width: 150 }
  ];

  return documentType === 'ICU Records' ? icuColumns : defaultColumns;
};

export const calculateNewConfidence = (item: any, rotation: number) => {
  // Base confidence from OCR
  let baseConfidence = item.confidence_score || 0;
  
  // Adjust confidence based on rotation for ICU Records
  if (rotation === 90 || rotation === 270) {
    baseConfidence = Math.min(baseConfidence + 0.3, 1.0); // Increase confidence after proper rotation
  }
  
  return baseConfidence;
};

export const mapColumnsBasedOnRotation = (item: any, rotation: number, documentType: string) => {
  if (documentType === 'ICU Records' && (rotation === 90 || rotation === 270)) {
    // Map data to ICU Records format when rotated
    const parts = item.text.split('|');
    return {
      roomNumber: parts[0] || '',
      wardType: parts[1] || '',
      nursingCharges: parts[2] || '',
      privateCharges: parts[3] || ''
    };
  }
  
  // Return original mapping for unrotated or other document types
  return item.original_data || {};
};

export const detectDocumentType = (extractedData: any[]) => {
  if (!extractedData?.[0]?.text) return 'Unknown';
  
  const text = extractedData.map(item => item.text).join(' ').toLowerCase();
  
  if (text.includes('ward') || text.includes('nursing') || text.includes('private')) {
    return 'ICU Records';
  }
  
  if (text.includes('class') || text.includes('charges')) {
    return 'Schedule of Charges';
  }
  
  return 'All Documents';
};

// Add new column definitions for different document types
export const getColumnsForDocumentType = (documentType: string, rotation: number) => {
  if (documentType === 'ICU Records' && (rotation === 90 || rotation === 270)) {
    return [
      { field: 'roomType', headerName: 'Room Type', width: 150 },
      { field: 'roomNumbers', headerName: 'Room Numbers', width: 200 },
      { field: 'charges', headerName: 'Charges', width: 150 },
      { field: 'nursingCharges', headerName: 'Nursing Charges', width: 150 }
    ];
  }

  // Default columns for Schedule of Charges
  return [
    { field: 'slNo', headerName: 'Sl. No.', width: 70 },
    { field: 'category', headerName: 'Category/Procedure', width: 300 },
    { field: 'cClass', headerName: 'C Class General Ward', width: 180 },
    { field: 'bClass', headerName: 'B Class Twin sharing', width: 180 },
    { field: 'aClass', headerName: 'A Class Single Room', width: 180 }
  ];
}; 

/*
1. rotation on the current page implementtion
2. rescan path image fixing

*/