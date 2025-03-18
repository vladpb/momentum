import React from 'react';
import { Button, ButtonProps, alpha, useTheme } from '@mui/material';

interface VisionButtonProps extends ButtonProps {
  /**
   * Whether to use a glass effect for the button
   */
  glass?: boolean;
  
  /**
   * Whether to add a subtle glow effect
   */
  glow?: boolean;
}

/**
 * A button component inspired by visionOS design language
 */
const VisionButton: React.FC<VisionButtonProps> = ({
  children,
  variant = 'contained',
  color = 'primary',
  glass = true,
  glow = false,
  sx,
  ...props
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // For glass effect
  const getGlassStyles = () => {
    if (!glass) return {};
    
    const baseColor = color === 'inherit' 
      ? theme.palette.background.paper
      : theme.palette[color]?.main || theme.palette.primary.main;
      
    return {
      backgroundColor: alpha(baseColor, variant === 'contained' ? 0.8 : 0.1),
      backdropFilter: 'blur(10px)',
      borderColor: alpha(baseColor, 0.3),
      '&:hover': {
        backgroundColor: alpha(baseColor, variant === 'contained' ? 0.9 : 0.2),
        ...(variant !== 'contained' && {
          color: theme.palette.primary.dark,
          '& .MuiButton-startIcon, & .MuiButton-endIcon, & .MuiSvgIcon-root': {
            color: theme.palette.primary.dark,
          },
        })
      }
    };
  };
  
  // For glow effect
  const getGlowStyles = () => {
    if (!glow) return {};
    
    const glowColor = color === 'inherit'
      ? (isDarkMode ? theme.palette.common.white : theme.palette.common.black)
      : theme.palette[color]?.main || theme.palette.primary.main;
      
    return {
      boxShadow: `0 0 15px ${alpha(glowColor, 0.3)}`,
      '&:hover': {
        boxShadow: `0 0 20px ${alpha(glowColor, 0.4)}`
      }
    };
  };

  return (
    <Button
      variant={variant}
      color={color}
      {...props}
      sx={{
        borderRadius: '12px',
        textTransform: 'none',
        padding: '8px 16px',
        transition: 'all 0.2s ease-in-out',
        fontWeight: 500,
        border: variant === 'outlined' ? `1px solid` : 'none',
        ...getGlassStyles(),
        ...getGlowStyles(),
        '&:active': {
          transform: 'scale(0.98)',
        },
        ...(variant === 'contained' && {
          '&:hover': {
            '& .MuiButton-startIcon, & .MuiButton-endIcon, & .MuiSvgIcon-root': {
              color: alpha(theme.palette.primary.contrastText, 0.9),
            },
          }
        }),
        ...sx
      }}
    >
      {children}
    </Button>
  );
};

export default VisionButton; 