// src/theme.ts
import { createTheme } from '@mui/material/styles';

// ─── Custom palette augmentation ─────────────────────────────────────────

declare module '@mui/material/styles' {
  interface Palette {
    neutral: Palette['primary'];
    sah: {
      navy: string;
      navyFrame: string;
      ivory: string;
      white: string;
      copper: string;
      copperDark: string;
      copperPale: string;
      copperPressed: string;
      mistSoft: string;
      blueStrong: string;
      line: string;
      muted: string;
      danger: string;
    };
  }
  interface PaletteOptions {
    neutral?: PaletteOptions['primary'];
    sah?: {
      navy: string;
      navyFrame: string;
      ivory: string;
      white: string;
      copper: string;
      copperDark: string;
      copperPale: string;
      copperPressed: string;
      mistSoft: string;
      blueStrong: string;
      line: string;
      muted: string;
      danger: string;
    };
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    neutral: true;
  }
}

// ─── SAH Admin Design Tokens (from SAH Web Admin standalone.html) ────────

export const SAH_COLORS = {
  navy:          '#17243A',   // sidebar background
  navyFrame:     '#111927',   // sidebar header / dark frame
  ivory:         '#FAF7F0',   // main page canvas background
  white:         '#FFFFFF',   // card, panel, table background
  copper:        '#C58A63',   // primary accent, action buttons
  copperDark:    '#9B664B',   // copper dark / hover
  copperPale:    '#F0E0D4',   // copper soft tint
  copperPressed: '#AD7352',   // copper pressed active
  mist:          '#A9C2CF',   // cool mist accent
  mistSoft:      '#DCE7EB',   // table header / pill background
  sand:          '#E6D8C5',   // subtle sand tint
  blue:          '#38536B',   // secondary slate blue
  blueStrong:    '#315E78',   // header / tag text
  muted:         '#6B7788',   // muted body / subtitles
  line:          'rgba(23, 36, 58, 0.11)', // borders & dividers
  shadow:        '0 18px 42px rgba(23, 36, 58, 0.08)',
  shadowSm:      '0 2px 8px rgba(23, 36, 58, 0.05)',
  danger:        '#A85F4F',   // error / alert red
  dangerBg:      '#FBE8E6',   // error banner background
  textPrimary:   '#17243A',   // primary text on light background
  textSecondary: '#6B7788',   // secondary / muted text
  textMuted:     '#8E9AA8',   // disabled / placeholder text
  
  // Status chip colors
  statusHalalBg:     '#E6F4F1',
  statusHalalText:   '#1B6354',
  statusHalalDot:    '#1B6354',
  statusIndexedBg:   '#E6F7ED',
  statusIndexedText: '#1C733F',
  statusIndexedDot:  '#1C733F',
  statusPendingBg:   '#FBEFDF',
  statusPendingText: '#8A551A',
  statusPendingDot:  '#8A551A',
  statusFailedBg:    '#FBE8E6',
  statusFailedText:  '#9C3227',
  statusFailedDot:   '#9C3227',
};

// ─── MUI Theme ────────────────────────────────────────────────────────────

export const globalTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: SAH_COLORS.copper,
      light: '#D49C78',
      dark: SAH_COLORS.copperDark,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: SAH_COLORS.navy,
      contrastText: '#FFFFFF',
    },
    neutral: {
      main: SAH_COLORS.muted,
      contrastText: '#FFFFFF',
    },
    background: {
      default: SAH_COLORS.ivory,
      paper: SAH_COLORS.white,
    },
    text: {
      primary: SAH_COLORS.textPrimary,
      secondary: SAH_COLORS.textSecondary,
      disabled: SAH_COLORS.textMuted,
    },
    divider: SAH_COLORS.line,
    error: {
      main: SAH_COLORS.danger,
    },
    sah: {
      navy:          SAH_COLORS.navy,
      navyFrame:     SAH_COLORS.navyFrame,
      ivory:         SAH_COLORS.ivory,
      white:         SAH_COLORS.white,
      copper:        SAH_COLORS.copper,
      copperDark:    SAH_COLORS.copperDark,
      copperPale:    SAH_COLORS.copperPale,
      copperPressed: SAH_COLORS.copperPressed,
      mistSoft:      SAH_COLORS.mistSoft,
      blueStrong:    SAH_COLORS.blueStrong,
      line:          SAH_COLORS.line,
      muted:         SAH_COLORS.muted,
      danger:        SAH_COLORS.danger,
    },
  },
  typography: {
    fontFamily: '"DM Sans", "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: { fontSize: '1.75rem', fontWeight: 800, color: SAH_COLORS.textPrimary, letterSpacing: '-0.02em' },
    h2: { fontSize: '1.5rem',  fontWeight: 800, color: SAH_COLORS.textPrimary, letterSpacing: '-0.02em' },
    h3: { fontSize: '1.25rem', fontWeight: 700, color: SAH_COLORS.textPrimary },
    h4: { fontSize: '1.1rem',  fontWeight: 700, color: SAH_COLORS.textPrimary },
    h5: { fontSize: '1rem',    fontWeight: 600, color: SAH_COLORS.textPrimary },
    h6: { fontSize: '0.875rem',fontWeight: 600, color: SAH_COLORS.textPrimary },
    body1: { color: SAH_COLORS.textPrimary, fontSize: '0.875rem' },
    body2: { color: SAH_COLORS.textSecondary, fontSize: '0.8125rem' },
    caption: { color: SAH_COLORS.textMuted, fontSize: '0.75rem' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: ({
          ownerState,
        }: {
          ownerState: { variant?: string; color?: string };
        }) => ({
          borderRadius: 14,
          fontWeight: 700,
          fontFamily: '"Plus Jakarta Sans", "DM Sans", sans-serif',
          textTransform: 'none',
          padding: '8px 18px',
          ...(ownerState.variant === 'contained' &&
            ownerState.color === 'primary' && {
              backgroundColor: SAH_COLORS.copper,
              color: '#FFFFFF',
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: SAH_COLORS.copperPressed,
                boxShadow: 'none',
              },
            }),
          ...(ownerState.variant === 'outlined' && {
            borderColor: SAH_COLORS.line,
            color: SAH_COLORS.textPrimary,
            backgroundColor: SAH_COLORS.white,
            '&:hover': {
              borderColor: SAH_COLORS.copper,
              backgroundColor: SAH_COLORS.ivory,
            },
          }),
        }),
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: SAH_COLORS.white,
          border: `1px solid ${SAH_COLORS.line}`,
          borderRadius: 22,
          boxShadow: SAH_COLORS.shadow,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: SAH_COLORS.white,
          backgroundImage: 'none',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: SAH_COLORS.mistSoft,
            color: SAH_COLORS.blueStrong,
            fontWeight: 700,
            fontSize: '0.6875rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            borderBottom: `1px solid ${SAH_COLORS.line}`,
            padding: '12px 16px',
          },
        },
      },
    },
    MuiTableBody: {
      styleOverrides: {
        root: {
          '& .MuiTableRow-root': {
            '&:hover': { backgroundColor: 'rgba(23, 36, 58, 0.02)' },
            '& .MuiTableCell-body': {
              borderBottom: `1px solid ${SAH_COLORS.line}`,
              color: SAH_COLORS.textPrimary,
              padding: '12px 16px',
            },
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'small' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: SAH_COLORS.ivory,
            borderRadius: 14,
            '& fieldset': { borderColor: SAH_COLORS.line },
            '&:hover fieldset': { borderColor: SAH_COLORS.copper },
            '&.Mui-focused fieldset': { borderColor: SAH_COLORS.copper, borderWidth: 1.5 },
          },
          '& .MuiInputLabel-root': { color: SAH_COLORS.textSecondary },
          '& .MuiInputLabel-root.Mui-focused': { color: SAH_COLORS.copper },
        },
      },
    },
    MuiSelect: {
      defaultProps: { variant: 'outlined', size: 'small' },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.75rem',
          borderRadius: 999,
          border: '1px solid transparent',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: SAH_COLORS.line },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: SAH_COLORS.ivory,
          color: SAH_COLORS.textPrimary,
          '&::-webkit-scrollbar': { width: 8, height: 8 },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(23, 36, 58, 0.16)',
            borderRadius: 999,
          },
        },
      },
    },
  },
});
