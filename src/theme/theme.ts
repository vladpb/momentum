import { createTheme, alpha } from '@mui/material/styles';

// VisionOS-inspired color palette
const visionColors = {
  light: {
    primary: '#007AFF', // Apple's blue
    secondary: '#64D2FF', // Light blue
    tertiary: '#5E5CE6', // Indigo
    success: '#34C759', // Green
    warning: '#FF9500', // Orange
    error: '#FF3B30', // Red
    info: '#5AC8FA', // Sky blue
    background: '#F5F7FA', // Very light gray-blue
    paper: '#FFFFFF', // White
    text: '#1C1C1E', // Almost black
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
  },
  dark: {
    primary: '#0A84FF', // Brighter blue for dark mode
    secondary: '#64D2FF', // Light blue
    tertiary: '#5E5CE6', // Indigo
    success: '#30D158', // Green
    warning: '#FF9F0A', // Orange
    error: '#FF453A', // Red
    info: '#64D2FF', // Sky blue
    background: '#000000', // Pure black
    paper: '#121214', // Very dark gray
    text: '#F2F2F7', // Almost white
    gray: {
      50: '#18181B',
      100: '#27272A',
      200: '#3F3F46',
      300: '#52525B',
      400: '#71717A',
      500: '#A1A1AA',
      600: '#D4D4D8',
      700: '#E4E4E7',
      800: '#F4F4F5',
      900: '#FAFAFA',
    },
  },
};

// Creating the light theme
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: visionColors.light.primary,
      light: alpha(visionColors.light.primary, 0.8),
      dark: '#0062CC',
    },
    secondary: {
      main: visionColors.light.secondary,
    },
    error: {
      main: visionColors.light.error,
    },
    warning: {
      main: visionColors.light.warning,
    },
    info: {
      main: visionColors.light.info,
    },
    success: {
      main: visionColors.light.success,
    },
    background: {
      default: visionColors.light.background,
      paper: visionColors.light.paper,
    },
    text: {
      primary: visionColors.light.text,
      secondary: visionColors.light.gray[600],
    },
    grey: visionColors.light.gray,
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
    },
    subtitle2: {
      fontWeight: 500,
    },
    body1: {
      fontWeight: 400,
    },
    body2: {
      fontWeight: 400,
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 2px 4px rgba(0,0,0,0.05)',
    '0 4px 8px rgba(0,0,0,0.08)',
    '0 6px 12px rgba(0,0,0,0.1)',
    '0 8px 16px rgba(0,0,0,0.12)',
    '0 10px 20px rgba(0,0,0,0.15)',
    '0 12px 24px rgba(0,0,0,0.18)',
    '0 14px 28px rgba(0,0,0,0.2)',
    '0 16px 32px rgba(0,0,0,0.22)',
    '0 18px 36px rgba(0,0,0,0.25)',
    '0 20px 40px rgba(0,0,0,0.28)',
    '0 22px 44px rgba(0,0,0,0.3)',
    '0 24px 48px rgba(0,0,0,0.32)',
    '0 26px 52px rgba(0,0,0,0.35)',
    '0 28px 56px rgba(0,0,0,0.38)',
    '0 30px 60px rgba(0,0,0,0.4)',
    '0 32px 64px rgba(0,0,0,0.42)',
    '0 34px 68px rgba(0,0,0,0.45)',
    '0 36px 72px rgba(0,0,0,0.48)',
    '0 38px 76px rgba(0,0,0,0.5)',
    '0 40px 80px rgba(0,0,0,0.52)',
    '0 42px 84px rgba(0,0,0,0.55)',
    '0 44px 88px rgba(0,0,0,0.58)',
    '0 46px 92px rgba(0,0,0,0.6)',
    '0 48px 96px rgba(0,0,0,0.62)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        body::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        body::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.05);
          border-radius: 3px;
        }
        body::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.15);
          border-radius: 3px;
        }
        body::-webkit-scrollbar-thumb:hover {
          background: rgba(0,0,0,0.25);
        }
      `,
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: '16px',
          transition: 'all 0.2s ease-in-out',
        },
        elevation1: {
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        },
        elevation2: {
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: '12px',
          padding: '8px 16px',
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${alpha(visionColors.light.primary, 0.9)}, ${alpha(visionColors.light.tertiary, 0.9)})`,
          backdropFilter: 'blur(10px)',
          boxShadow: `0 2px 10px ${alpha(visionColors.light.primary, 0.2)}`,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          backdropFilter: 'blur(10px)',
          background: alpha(visionColors.light.paper, 0.7),
          border: '1px solid rgba(255,255,255,0.7)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(10px)',
          background: alpha(visionColors.light.paper, 0.7),
          boxShadow: 'none',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 42,
          height: 26,
          padding: 0,
        },
        switchBase: {
          padding: 1,
          '&.Mui-checked': {
            transform: 'translateX(16px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
              opacity: 1,
              background: visionColors.light.primary,
            },
          },
        },
        thumb: {
          width: 24,
          height: 24,
        },
        track: {
          borderRadius: 13,
          opacity: 1,
          backgroundColor: 'rgba(0,0,0,0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.2s ease-in-out',
            backgroundColor: alpha(visionColors.light.gray[100], 0.8),
            '& fieldset': {
              borderColor: alpha(visionColors.light.gray[300], 0.8),
            },
            '&:hover fieldset': {
              borderColor: visionColors.light.primary,
            },
          },
        },
      },
    },
  },
});

// Creating the dark theme
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: visionColors.dark.primary,
      light: alpha(visionColors.dark.primary, 0.8),
      dark: '#0062CC',
    },
    secondary: {
      main: visionColors.dark.secondary,
    },
    error: {
      main: visionColors.dark.error,
    },
    warning: {
      main: visionColors.dark.warning,
    },
    info: {
      main: visionColors.dark.info,
    },
    success: {
      main: visionColors.dark.success,
    },
    background: {
      default: visionColors.dark.background,
      paper: visionColors.dark.paper,
    },
    text: {
      primary: visionColors.dark.text,
      secondary: visionColors.dark.gray[500],
    },
    grey: visionColors.dark.gray,
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
    },
    subtitle2: {
      fontWeight: 500,
    },
    body1: {
      fontWeight: 400,
    },
    body2: {
      fontWeight: 400,
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 2px 4px rgba(0,0,0,0.2)',
    '0 4px 8px rgba(0,0,0,0.25)',
    '0 6px 12px rgba(0,0,0,0.3)',
    '0 8px 16px rgba(0,0,0,0.35)',
    '0 10px 20px rgba(0,0,0,0.4)',
    '0 12px 24px rgba(0,0,0,0.45)',
    '0 14px 28px rgba(0,0,0,0.5)',
    '0 16px 32px rgba(0,0,0,0.55)',
    '0 18px 36px rgba(0,0,0,0.6)',
    '0 20px 40px rgba(0,0,0,0.65)',
    '0 22px 44px rgba(0,0,0,0.7)',
    '0 24px 48px rgba(0,0,0,0.75)',
    '0 26px 52px rgba(0,0,0,0.8)',
    '0 28px 56px rgba(0,0,0,0.85)',
    '0 30px 60px rgba(0,0,0,0.9)',
    '0 32px 64px rgba(0,0,0,0.92)',
    '0 34px 68px rgba(0,0,0,0.94)',
    '0 36px 72px rgba(0,0,0,0.96)',
    '0 38px 76px rgba(0,0,0,0.98)',
    '0 40px 80px rgba(0,0,0,1)',
    '0 42px 84px rgba(0,0,0,1)',
    '0 44px 88px rgba(0,0,0,1)',
    '0 46px 92px rgba(0,0,0,1)',
    '0 48px 96px rgba(0,0,0,1)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        body::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        body::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.05);
          border-radius: 3px;
        }
        body::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.15);
          border-radius: 3px;
        }
        body::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.25);
        }
      `,
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: '16px',
          transition: 'all 0.2s ease-in-out',
        },
        elevation1: {
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
        },
        elevation2: {
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: '12px',
          padding: '8px 16px',
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${alpha(visionColors.dark.primary, 0.9)}, ${alpha(visionColors.dark.tertiary, 0.9)})`,
          backdropFilter: 'blur(10px)',
          boxShadow: `0 2px 10px ${alpha(visionColors.dark.primary, 0.3)}`,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          backdropFilter: 'blur(10px)',
          background: alpha(visionColors.dark.paper, 0.7),
          border: '1px solid rgba(255,255,255,0.1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(10px)',
          background: alpha(visionColors.dark.paper, 0.7),
          boxShadow: 'none',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 42,
          height: 26,
          padding: 0,
        },
        switchBase: {
          padding: 1,
          '&.Mui-checked': {
            transform: 'translateX(16px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
              opacity: 1,
              background: visionColors.dark.primary,
            },
          },
        },
        thumb: {
          width: 24,
          height: 24,
        },
        track: {
          borderRadius: 13,
          opacity: 1,
          backgroundColor: 'rgba(255,255,255,0.15)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.2s ease-in-out',
            backgroundColor: alpha(visionColors.dark.paper, 0.5),
            '& fieldset': {
              borderColor: alpha(visionColors.dark.gray[300], 0.5),
            },
            '&:hover fieldset': {
              borderColor: visionColors.dark.primary,
            },
          },
        },
      },
    },
  },
});
