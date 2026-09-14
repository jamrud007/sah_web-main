// src/components/products/ProductFilters.tsx
import React from 'react';
import {
  Box,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { SAH_COLORS } from '../../theme';

export interface FilterValues {
  q: string;
  category: string;
  manufacturer: string;
  halal_status: string;
}

interface ProductFiltersProps {
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  onReset: () => void;
  onAddProduct?: () => void;
  isAdmin?: boolean;
}

const HALAL_STATUS_OPTIONS = [
  { value: '', label: 'Status halal' },
  { value: 'halal', label: 'Halal terverifikasi' },
  { value: 'not_halal', label: 'Tidak Halal' },
];

const CATEGORY_OPTIONS = [
  { value: '', label: 'Kategori' },
  { value: 'Bumbu Masak', label: 'Bumbu Masak' },
  { value: 'Mie Instan', label: 'Mie Instan' },
  { value: 'Minuman Siap Minum', label: 'Minuman Siap Minum' },
  { value: 'Biskuit & Roti', label: 'Biskuit & Roti' },
  { value: 'Minyak & Mentega', label: 'Minyak & Mentega' },
  { value: 'Susu & Olahan', label: 'Susu & Olahan' },
  { value: 'Saus & Sambal', label: 'Saus & Sambal' },
];

const ProductFilters: React.FC<ProductFiltersProps> = ({
  values,
  onChange,
  onReset,
  onAddProduct,
  isAdmin = true,
}) => {
  return (
    <Box
      sx={{
        p: '16px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        flexWrap: 'wrap',
        borderBottom: `1px solid ${SAH_COLORS.line}`,
        bgcolor: SAH_COLORS.white,
      }}
    >
      {/* Search Input Box */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          height: 38,
          px: 1.75,
          border: `1px solid ${SAH_COLORS.line}`,
          borderRadius: '13px',
          bgcolor: SAH_COLORS.ivory,
          flex: '1 1 240px',
          maxWidth: 340,
        }}
      >
        <SearchIcon sx={{ fontSize: 16, color: SAH_COLORS.muted }} />
        <input
          id="filter-search"
          placeholder="Cari SKU, nama produk, produsen..."
          value={values.q}
          onChange={(e) => onChange({ ...values, q: e.target.value })}
          style={{
            border: 0,
            background: 'none',
            outline: 'none',
            width: '100%',
            fontSize: '12.5px',
            color: SAH_COLORS.textPrimary,
            fontFamily: 'inherit',
          }}
        />
      </Box>

      {/* Halal Status Dropdown */}
      <Select
        value={values.halal_status}
        onChange={(e) => onChange({ ...values, halal_status: e.target.value })}
        displayEmpty
        sx={{
          height: 38,
          borderRadius: '13px',
          bgcolor: SAH_COLORS.white,
          fontSize: '12.5px',
          fontWeight: 600,
          color: SAH_COLORS.textPrimary,
          '& .MuiOutlinedInput-notchedOutline': { borderColor: SAH_COLORS.line },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: SAH_COLORS.copper },
        }}
      >
        {HALAL_STATUS_OPTIONS.map((opt) => (
          <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '12.5px' }}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>

      {/* Category Dropdown */}
      <Select
        value={values.category}
        onChange={(e) => onChange({ ...values, category: e.target.value })}
        displayEmpty
        sx={{
          height: 38,
          borderRadius: '13px',
          bgcolor: SAH_COLORS.white,
          fontSize: '12.5px',
          fontWeight: 600,
          color: SAH_COLORS.textPrimary,
          '& .MuiOutlinedInput-notchedOutline': { borderColor: SAH_COLORS.line },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: SAH_COLORS.copper },
        }}
      >
        {CATEGORY_OPTIONS.map((opt) => (
          <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '12.5px' }}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>

      {/* Reset Filter Button */}
      {(values.q || values.category || values.manufacturer || values.halal_status) && (
        <Button
          size="small"
          onClick={onReset}
          sx={{
            height: 38,
            borderRadius: '13px',
            fontSize: '12px',
            color: SAH_COLORS.muted,
          }}
        >
          Reset Filter
        </Button>
      )}

      <Box sx={{ flex: 1 }} />

      {/* Add Product Button (Always available for admin) */}
      {isAdmin && onAddProduct && (
        <Button
          id="btn-add-product"
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddProduct}
          sx={{
            height: 38,
            px: 2,
            borderRadius: '13px',
            bgcolor: SAH_COLORS.copper,
            color: '#FFFFFF',
            fontSize: '12.5px',
            fontWeight: 700,
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            boxShadow: 'none',
            '&:hover': {
              bgcolor: SAH_COLORS.copperPressed,
              boxShadow: 'none',
            },
          }}
        >
          Tambah Produk
        </Button>
      )}
    </Box>
  );
};

export default ProductFilters;
