// src/components/products/ProductTable.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Box,
  Typography,
  Skeleton,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Product } from '../../types/apiDef';
import { SAH_COLORS } from '../../theme';

interface ProductTableProps {
  products: Product[];
  loading?: boolean;
  onDelete?: (product: Product) => void;
}

const renderHalalChip = (status?: string) => {
  if (status === 'halal') {
    return (
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          px: '11px',
          py: '4px',
          borderRadius: 999,
          fontSize: '11.5px',
          fontWeight: 600,
          bgcolor: SAH_COLORS.statusHalalBg,
          color: SAH_COLORS.statusHalalText,
          border: `1px solid rgba(27, 99, 84, 0.15)`,
          whiteSpace: 'nowrap',
        }}
      >
        <Box component="span" sx={{ fontSize: '9px', lineHeight: 1 }}>●</Box>
        Halal terverifikasi
      </Box>
    );
  }
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        px: '11px',
        py: '4px',
        borderRadius: 999,
        fontSize: '11.5px',
        fontWeight: 600,
        bgcolor: SAH_COLORS.statusFailedBg,
        color: SAH_COLORS.statusFailedText,
        border: `1px solid rgba(168, 59, 50, 0.15)`,
        whiteSpace: 'nowrap',
      }}
    >
      <Box component="span" sx={{ fontSize: '9px', lineHeight: 1 }}>▲</Box>
      Tidak Halal
    </Box>
  );
};

const renderIndexChip = (status?: string) => {
  if (status === 'indexed') {
    return (
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          px: '11px',
          py: '4px',
          borderRadius: 999,
          fontSize: '11.5px',
          fontWeight: 600,
          bgcolor: SAH_COLORS.statusIndexedBg,
          color: SAH_COLORS.statusIndexedText,
          border: `1px solid rgba(28, 115, 63, 0.15)`,
          whiteSpace: 'nowrap',
        }}
      >
        <Box component="span" sx={{ fontSize: '9px', lineHeight: 1 }}>●</Box>
        Terindeks
      </Box>
    );
  }
  if (status === 'pending') {
    return (
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          px: '11px',
          py: '4px',
          borderRadius: 999,
          fontSize: '11.5px',
          fontWeight: 600,
          bgcolor: SAH_COLORS.statusPendingBg,
          color: SAH_COLORS.statusPendingText,
          border: `1px solid rgba(138, 85, 26, 0.15)`,
          whiteSpace: 'nowrap',
        }}
      >
        <Box component="span" sx={{ fontSize: '9px', lineHeight: 1 }}>○</Box>
        Menunggu indeks
      </Box>
    );
  }
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        px: '11px',
        py: '4px',
        borderRadius: 999,
        fontSize: '11.5px',
        fontWeight: 600,
        bgcolor: SAH_COLORS.statusFailedBg,
        color: SAH_COLORS.statusFailedText,
        border: `1px solid rgba(156, 50, 39, 0.15)`,
        whiteSpace: 'nowrap',
      }}
    >
      <Box component="span" sx={{ fontSize: '9px', lineHeight: 1 }}>▲</Box>
      Galat ekstraksi
    </Box>
  );
};

const formatDate = (isoStr?: string) => {
  if (!isoStr) return 'Terdaftar 12 Jan 2026';
  try {
    const d = new Date(isoStr);
    return `Terdaftar ${d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  } catch {
    return 'Terdaftar 12 Jan 2026';
  }
};

const ProductTable: React.FC<ProductTableProps> = ({ products, loading, onDelete }) => {
  const navigate = useNavigate();

  if (loading && products.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        {[...Array(6)].map((_, i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            height={52}
            sx={{ mb: 1, borderRadius: 2, bgcolor: SAH_COLORS.mistSoft }}
          />
        ))}
      </Box>
    );
  }

  if (!loading && products.length === 0) {
    return (
      <Box
        sx={{
          py: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Typography sx={{ color: SAH_COLORS.textPrimary, fontWeight: 700, fontSize: '1rem' }}>
          Tidak ada produk ditemukan
        </Typography>
        <Typography sx={{ color: SAH_COLORS.textSecondary, fontSize: '0.8125rem' }}>
          Tambah produk baru atau ubah filter pencarian
        </Typography>
      </Box>
    );
  }

  return (
    <Table size="medium" sx={{ minWidth: 850 }}>
      <TableHead>
        <TableRow>
          <TableCell sx={{ width: '15%' }}>KODE SKU</TableCell>
          <TableCell sx={{ width: '30%' }}>PRODUK</TableCell>
          <TableCell sx={{ width: '20%' }}>PRODUSEN</TableCell>
          <TableCell sx={{ width: '18%' }}>STATUS HALAL</TableCell>
          <TableCell sx={{ width: '17%' }}>STATUS INDEKS</TableCell>
          <TableCell sx={{ textAlign: 'right', pr: 3 }}>AKSI</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {products.map((p) => (
          <TableRow
            key={p.id}
            hover
            sx={{
              cursor: 'pointer',
              '&:hover': { bgcolor: 'rgba(23, 36, 58, 0.02) !important' },
            }}
            onClick={() => navigate(`/products/${p.id}`)}
          >
            {/* KODE SKU */}
            <TableCell>
              <Typography
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: SAH_COLORS.textPrimary,
                }}
              >
                {p.sku_code}
              </Typography>
            </TableCell>

            {/* PRODUK */}
            <TableCell>
              <Typography
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: SAH_COLORS.textPrimary,
                  lineHeight: 1.3,
                }}
              >
                {p.name}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.75rem',
                  color: SAH_COLORS.textMuted,
                  mt: 0.25,
                }}
              >
                {formatDate(p.created_at || p.halal_registered_at || undefined)}
              </Typography>
            </TableCell>

            {/* PRODUSEN */}
            <TableCell>
              <Typography sx={{ fontSize: '0.8125rem', color: SAH_COLORS.textPrimary }}>
                {p.manufacturer ?? p.brand ?? '—'}
              </Typography>
            </TableCell>

            {/* STATUS HALAL */}
            <TableCell>{renderHalalChip(p.halal_status)}</TableCell>

            {/* STATUS INDEKS */}
            <TableCell>{renderIndexChip(p.index_status)}</TableCell>

            {/* AKSI */}
            <TableCell
              onClick={(e) => e.stopPropagation()}
              sx={{ textAlign: 'right', pr: 2, whiteSpace: 'nowrap' }}
            >
              <Button
                size="small"
                variant="outlined"
                onClick={() => navigate(`/products/${p.id}`)}
                sx={{
                  height: 31,
                  px: 1.5,
                  mr: 1,
                  fontSize: '12px',
                  fontWeight: 600,
                  borderRadius: '11px',
                  borderColor: SAH_COLORS.line,
                  color: SAH_COLORS.textPrimary,
                  bgcolor: SAH_COLORS.white,
                  '&:hover': {
                    borderColor: SAH_COLORS.copper,
                    bgcolor: SAH_COLORS.ivory,
                  },
                }}
              >
                Detail
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => navigate(`/products/${p.id}`)}
                sx={{
                  height: 31,
                  px: 1.5,
                  mr: 0.5,
                  fontSize: '12px',
                  fontWeight: 600,
                  borderRadius: '11px',
                  borderColor: SAH_COLORS.line,
                  color: SAH_COLORS.textPrimary,
                  bgcolor: SAH_COLORS.white,
                  '&:hover': {
                    borderColor: SAH_COLORS.copper,
                    bgcolor: SAH_COLORS.ivory,
                  },
                }}
              >
                Sunting
              </Button>
              {onDelete && (
                <Tooltip title="Hapus produk">
                  <IconButton
                    size="small"
                    onClick={() => onDelete(p)}
                    sx={{
                      color: SAH_COLORS.textMuted,
                      '&:hover': { color: SAH_COLORS.danger },
                    }}
                  >
                    <DeleteIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ProductTable;
