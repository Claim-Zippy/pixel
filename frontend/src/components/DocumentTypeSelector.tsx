import { FormControl, InputLabel, MenuItem, Select, Box, Divider } from '@mui/material';

const IMAGE_GROUPS = [
  'All Documents',
  'Schedule of Charges',
  'ICU Records'
];

const DOCUMENT_TYPES = [
  'Medical Records & Discharge Summary',
  'Certificates & Registration',
  'Postmortem & Police Reports',
  'Bills & Receipts',
  'Patient Case Papers',
  'Statements & Acknowledgments',
  'Financial Documents',
  'Investigation Reports',
  'Pre-medical Documents',
  'eKYC Documents'
];

interface DocumentTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function DocumentTypeSelector({ value, onChange }: DocumentTypeSelectorProps) {
  return (
    <FormControl fullWidth>
      <InputLabel>Document Type</InputLabel>
      <Select
        value={value}
        label="Document Type"
        onChange={(e) => onChange(e.target.value)}
      >
        {/* Image Group Options */}
        {IMAGE_GROUPS.map((type) => (
          <MenuItem key={type} value={type}>
            {type}
          </MenuItem>
        ))}
        
        <Divider sx={{ my: 1 }} />
        
        {/* Document Classification Options */}
        {DOCUMENT_TYPES.map((type) => (
          <MenuItem key={type} value={type}>
            {type}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
} 