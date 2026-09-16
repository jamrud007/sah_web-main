// src/components/products/PhotoCard.tsx
// Grid card for a single reference photo — matches SAH Web Admin standalone (image 3 & SCR-WEB-05)

import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import type { Photo } from '../../types/apiDef';
import { SAH_COLORS } from '../../theme';
import { formatPhotoTimestamp } from '../../services/photoService';

interface PhotoCardProps {
  photo: Photo;
  onDelete: (photo: Photo) => void;
  onReindex: (photo: Photo) => void;
  isDeleting?: boolean;
  isReindexing?: boolean;
}

const SIDE_LABELS: Record<string, string> = {
  depan: 'Depan',
  belakang: 'Belakang',
  sisi_kiri: 'Sisi kiri',
  sisi_kanan: 'Sisi kanan',
  tutup: 'Tutup',
  kemasan_isi_ulang: 'Kemasan isi ulang',
};

const formatBytes = (bytes?: number) => {
  if (!bytes) return '1.2 MB';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const renderStatusChip = (status?: string) => {
  if (status === 'indexed') {
    return (
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          px: '10px',
          py: '3px',
          borderRadius: 999,
          fontSize: '11px',
          fontWeight: 600,
          bgcolor: SAH_COLORS.statusIndexedBg,
          color: SAH_COLORS.statusIndexedText,
          border: '1px solid rgba(28, 115, 63, 0.15)',
        }}
      >
        <Box component="span" sx={{ fontSize: '8px' }}>●</Box>
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
          px: '10px',
          py: '3px',
          borderRadius: 999,
          fontSize: '11px',
          fontWeight: 600,
          bgcolor: SAH_COLORS.statusPendingBg,
          color: SAH_COLORS.statusPendingText,
          border: '1px solid rgba(138, 85, 26, 0.15)',
        }}
      >
        <Box component="span" sx={{ fontSize: '8px' }}>○</Box>
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
        px: '10px',
        py: '3px',
        borderRadius: 999,
        fontSize: '11px',
        fontWeight: 600,
        bgcolor: SAH_COLORS.statusFailedBg,
        color: SAH_COLORS.statusFailedText,
        border: '1px solid rgba(156, 50, 39, 0.15)',
      }}
    >
      <Box component="span" sx={{ fontSize: '8px' }}>▲</Box>
      Galat ekstraksi
    </Box>
  );
};

const PhotoCard: React.FC<PhotoCardProps> = ({
  photo,
  onDelete,
  onReindex,
  isDeleting,
  isReindexing,
}) => {
  const sideLabel = photo.package_side
    ? (SIDE_LABELS[photo.package_side] ?? photo.package_side)
    : 'Depan';

  const isGradientWarm = photo.package_side === 'sisi_kiri' || photo.package_side === 'sisi_kanan' || photo.package_side === 'kemasan_isi_ulang';

  const previewBg = isGradientWarm
    ? 'linear-gradient(145deg, #B56241 0%, #683020 100%)'
    : 'linear-gradient(145deg, #274563 0%, #15273C 100%)';

  return (
    <Box
      sx={{
        bgcolor: SAH_COLORS.white,
        border: `1px solid ${SAH_COLORS.line}`,
        borderRadius: '18px',
        overflow: 'hidden',
        boxShadow: SAH_COLORS.shadowSm,
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.18s ease',
        '&:hover': { borderColor: SAH_COLORS.copper, transform: 'translateY(-2px)' },
      }}
    >
      {/* Image / Graphic Area */}
      <Box
        sx={{
          position: 'relative',
          height: 160,
          background: photo.url
            ? 'radial-gradient(circle at 50% 50%, #ffffff 0%, #f4f5f8 100%)'
            : previewBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          p: photo.url ? 1.5 : 0,
        }}
      >
        {photo.url ? (
          <Box
            component="img"
            src={photo.url}
            alt={photo.file_name ?? sideLabel}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 2px 6px rgba(23,36,58,.08))',
            }}
          />
        ) : (
          <Typography
            sx={{
              color: 'rgba(255, 255, 255, 0.85)',
              fontSize: '1.75rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              fontFamily: '"Plus Jakarta Sans", sans-serif',
            }}
          >
            BG
          </Typography>
        )}

        {/* Package side badge top-left */}
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            px: '10px',
            py: '3px',
            borderRadius: '999px',
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            color: SAH_COLORS.navy,
            fontWeight: 700,
            fontSize: '11px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
          }}
        >
          {sideLabel}
        </Box>

        {/* Action icons top-right */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            gap: 0.5,
          }}
        >
          {photo.status === 'failed' && (
            <Tooltip title="Indeks ulang">
              <IconButton
                size="small"
                onClick={() => onReindex(photo)}
                disabled={isReindexing}
                sx={{
                  bgcolor: 'rgba(0,0,0,0.45)',
                  color: '#FFFFFF',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                  width: 28,
                  height: 28,
                }}
              >
                {isReindexing ? <CircularProgress size={12} color="inherit" /> : <RefreshIcon sx={{ fontSize: 15 }} />}
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Hapus foto">
            <IconButton
              size="small"
              onClick={() => onDelete(photo)}
              disabled={isDeleting}
              sx={{
                bgcolor: 'rgba(0,0,0,0.45)',
                color: '#FFFFFF',
                '&:hover': { bgcolor: SAH_COLORS.danger },
                width: 28,
                height: 28,
              }}
            >
              {isDeleting ? <CircularProgress size={12} color="inherit" /> : <DeleteIcon sx={{ fontSize: 15 }} />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Info Section */}
      <Box sx={{ p: '14px 16px', display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography
          noWrap
          sx={{
            fontSize: '13px',
            fontWeight: 700,
            color: SAH_COLORS.textPrimary,
          }}
        >
          {photo.file_name ?? `${photo.package_side ?? 'foto'}.jpg`}
        </Typography>

        <Typography sx={{ fontSize: '11.5px', color: SAH_COLORS.textSecondary }}>
          {photo.width ? `${photo.width} × ${photo.height}` : '2048 × 2048'} · {formatBytes(photo.file_size)}
        </Typography>

        {photo.uploaded_at && (
          <Typography sx={{ fontSize: '10.5px', color: '#64748b' }}>
            {formatPhotoTimestamp(photo.uploaded_at)}
          </Typography>
        )}

        <Box sx={{ pt: 0.5 }}>{renderStatusChip(photo.status)}</Box>

        {/* Quality note if error or pending */}
        {photo.qa_message && (
          <Box
            sx={{
              mt: 0.5,
              p: '8px 10px',
              borderRadius: '10px',
              bgcolor: 'rgba(168, 95, 79, 0.08)',
              border: `1px solid rgba(168, 95, 79, 0.2)`,
              fontSize: '11px',
              color: SAH_COLORS.danger,
              lineHeight: 1.35,
            }}
          >
            ▲ {photo.qa_message}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PhotoCard;
