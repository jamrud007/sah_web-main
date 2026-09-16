// src/components/products/PhotoUploadModal.tsx
// Multi-file upload modal with package_side selector per file

import React, { useRef, useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  LinearProgress,
  Chip,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { SAH_COLORS } from '../../theme';

interface FileEntry {
  file: File;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
}

interface PhotoUploadModalProps {
  open: boolean;
  productId: string;
  skuCode?: string;
  onClose: () => void;
  onUpload: (file: File, packageSide?: string) => Promise<void>;
}

const formatBytes = (bytes: number) => {
  if (!bytes) return '0 KB';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
  open,
  skuCode,
  onClose,
  onUpload,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const newEntries: FileEntry[] = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .map((file) => ({
        file,
        status: 'pending',
      }));
    setEntries((prev) => [...prev, ...newEntries]);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const removeEntry = (idx: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUploadAll = async () => {
    setIsUploading(true);
    for (let i = 0; i < entries.length; i++) {
      if (entries[i].status === 'done') continue;
      setEntries((prev) => {
        const next = [...prev];
        next[i] = { ...next[i], status: 'uploading' };
        return next;
      });
      try {
        await onUpload(entries[i].file);
        setEntries((prev) => {
          const next = [...prev];
          next[i] = { ...next[i], status: 'done' };
          return next;
        });
      } catch (err: unknown) {
        setEntries((prev) => {
          const next = [...prev];
          next[i] = {
            ...next[i],
            status: 'error',
            error: (err as Error).message ?? 'Gagal upload',
          };
          return next;
        });
      }
    }
    setIsUploading(false);
  };

  const handleClose = () => {
    if (!isUploading) {
      setEntries([]);
      onClose();
    }
  };

  const allDone = entries.length > 0 && entries.every((e) => e.status === 'done');

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            bgcolor: SAH_COLORS.white,
            border: `1px solid ${SAH_COLORS.line}`,
            borderRadius: '20px',
            boxShadow: SAH_COLORS.shadow,
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: '16px', color: SAH_COLORS.textPrimary }}>
            Unggah Foto Referensi
          </Typography>
          {skuCode && (
            <Typography sx={{ fontSize: '0.75rem', color: SAH_COLORS.textSecondary }}>
              SKU: {skuCode}
            </Typography>
          )}
        </Box>
        <IconButton
          id="upload-modal-close"
          onClick={handleClose}
          disabled={isUploading}
          size="small"
          sx={{ color: SAH_COLORS.textSecondary }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        {/* Drop zone */}
        <Box
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          sx={{
            border: `2px dashed ${isDragging ? SAH_COLORS.copper : SAH_COLORS.line}`,
            borderRadius: '16px',
            p: 3,
            textAlign: 'center',
            cursor: 'pointer',
            bgcolor: isDragging ? SAH_COLORS.copperPale : SAH_COLORS.ivory,
            transition: 'all 0.2s ease',
            mb: 2,
            '&:hover': {
              borderColor: SAH_COLORS.copper,
              bgcolor: SAH_COLORS.copperPale,
            },
          }}
        >
          <CloudUploadIcon
            sx={{ fontSize: 40, color: SAH_COLORS.copper, mb: 1, opacity: 0.8 }}
          />
          <Typography sx={{ color: SAH_COLORS.textPrimary, fontSize: '0.875rem', fontWeight: 600 }}>
            Seret foto ke sini atau{' '}
            <Box component="span" sx={{ color: SAH_COLORS.copperDark, fontWeight: 700 }}>
              pilih berkas
            </Box>
          </Typography>
          <Typography sx={{ color: SAH_COLORS.textMuted, fontSize: '0.75rem', mt: 0.5 }}>
            JPG, PNG, WEBP — bisa pilih banyak berkas sekaligus
          </Typography>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => addFiles(e.target.files)}
          />
        </Box>

        {/* File list */}
        {entries.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {entries.map((entry, idx) => (
              <Box
                key={idx}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.5,
                  bgcolor: SAH_COLORS.ivory,
                  borderRadius: '12px',
                  border: `1px solid ${
                    entry.status === 'error'
                      ? SAH_COLORS.danger
                      : entry.status === 'done'
                      ? '#1C733F'
                      : SAH_COLORS.line
                  }`,
                }}
              >
                {/* Thumbnail */}
                <Box
                  component="img"
                  src={URL.createObjectURL(entry.file)}
                  alt={entry.file.name}
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '8px',
                    objectFit: 'contain',
                    backgroundColor: '#ffffff',
                    border: '1px solid rgba(23,36,58,.08)',
                    p: 0.5,
                    flexShrink: 0,
                  }}
                />

                {/* File info */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    noWrap
                    sx={{ fontSize: '0.8rem', fontWeight: 600, color: SAH_COLORS.textPrimary }}
                  >
                    {entry.file.name}
                  </Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: SAH_COLORS.textMuted }}>
                    {formatBytes(entry.file.size)}
                  </Typography>
                  {entry.status === 'uploading' && (
                    <LinearProgress sx={{ mt: 0.5, borderRadius: 1 }} />
                  )}
                  {entry.status === 'error' && (
                    <Typography sx={{ fontSize: '0.7rem', color: SAH_COLORS.danger }}>
                      {entry.error}
                    </Typography>
                  )}
                </Box>

                {/* Status icon */}
                {entry.status === 'done' && (
                  <CheckCircleIcon sx={{ color: '#1C733F', flexShrink: 0 }} />
                )}
                {entry.status === 'error' && (
                  <ErrorIcon sx={{ color: SAH_COLORS.danger, flexShrink: 0 }} />
                )}

                {/* Remove */}
                {entry.status !== 'uploading' && entry.status !== 'done' && (
                  <IconButton
                    size="small"
                    onClick={() => removeEntry(idx)}
                    disabled={isUploading}
                    sx={{ color: SAH_COLORS.textMuted, flexShrink: 0 }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        {allDone ? (
          <>
            <Chip
              label={`${entries.length} foto berhasil diunggah`}
              icon={<CheckCircleIcon />}
              sx={{ color: '#1C733F', bgcolor: '#E6F7ED', fontWeight: 600 }}
            />
            <Button
              id="upload-modal-done"
              variant="contained"
              onClick={handleClose}
              sx={{ ml: 'auto', bgcolor: SAH_COLORS.copper }}
            >
              Selesai
            </Button>
          </>
        ) : (
          <>
            <Button
              id="upload-modal-cancel"
              onClick={handleClose}
              disabled={isUploading}
              sx={{ color: SAH_COLORS.textSecondary }}
            >
              Batal
            </Button>
            <Button
              id="upload-modal-submit"
              variant="contained"
              onClick={handleUploadAll}
              disabled={isUploading || entries.length === 0}
              sx={{
                bgcolor: SAH_COLORS.copper,
                color: '#FFFFFF',
                fontWeight: 700,
                '&:hover': { bgcolor: SAH_COLORS.copperPressed },
              }}
            >
              {isUploading
                ? 'Mengunggah...'
                : `Unggah ${entries.length > 0 ? `(${entries.length})` : ''}`}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PhotoUploadModal;
