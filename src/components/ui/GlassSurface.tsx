import React from 'react';
import { Box, Paper, PaperProps, alpha, useTheme } from '@mui/material';

export interface GlassSurfaceProps extends Omit<PaperProps, 'elevation'> {
  /**
   * The intensity of the blur effect (0-1)
   */
  blurIntensity?: number;
  
  /**
   * The opacity of the glass panel (0-1)
   */
  opacity?: number;
  
  /**
   * The depth effect level (0-3)
   * Higher values create more pronounced depth with shadows
   */
  depth?: 0 | 1 | 2 | 3;
  
  /**
   * Whether the surface should have a subtle inner border glow
   */
  glowBorder?: boolean;
  
  /**
   * Optional background gradient
   */
  gradient?: string;
}

/**
 * A glass-like surface component inspired by visionOS design
 */
const GlassSurface: React.FC<GlassSurfaceProps> = ({
  children,
  blurIntensity = 0.8,
  opacity = 0.7,
  depth = 1,
  glowBorder = false,
  gradient,
  sx,
  ...props
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  const getDepthShadow = () => {
    switch (depth) {
      case 0:
        return 'none';
      case 1:
        return `0 4px 12px ${alpha(theme.palette.common.black, 0.05)}, 
                0 1px 3px ${alpha(theme.palette.common.black, 0.08)}`;
      case 2:
        return `0 8px 24px ${alpha(theme.palette.common.black, 0.08)}, 
                0 2px 6px ${alpha(theme.palette.common.black, 0.12)}`;
      case 3:
        return `0 16px 38px ${alpha(theme.palette.common.black, 0.10)}, 
                0 4px 12px ${alpha(theme.palette.common.black, 0.16)}`;
      default:
        return `0 4px 12px ${alpha(theme.palette.common.black, 0.05)}`;
    }
  };
  
  // Colors adjusted for dark/light mode with less opacity
  const backgroundColor = isDarkMode
    ? alpha(theme.palette.background.paper, 0.3 * opacity)
    : alpha(theme.palette.background.paper, 0.5 * opacity);
    
  const borderColor = isDarkMode
    ? alpha(theme.palette.common.white, 0.05)
    : alpha(theme.palette.common.white, 0.15);

  const backdropFilter = `blur(${blurIntensity * 20}px)`;
  
  const glowStyles = glowBorder
    ? {
        boxShadow: `0 0 0 1px ${isDarkMode ? alpha(theme.palette.primary.main, 0.2) : alpha(theme.palette.primary.light, 0.2)}, ${getDepthShadow()}`,
      }
    : { boxShadow: getDepthShadow() };

  // Check if sx contains a border: 'none' property
  const hasBorderNone = sx && typeof sx === 'object' && 'border' in sx && sx.border === 'none';

  return (
    <Paper
      {...props}
      elevation={0}
      sx={{
        position: 'relative',
        backgroundColor,
        backdropFilter,
        borderRadius: '16px',
        border: hasBorderNone ? 'none' : `1px solid ${borderColor}`,
        transition: 'all 0.3s ease-in-out',
        overflow: 'hidden',
        ...glowStyles,
        '&:hover': {
          transform: depth > 0 ? 'translateY(-2px)' : 'none',
          boxShadow: depth > 0 ? getDepthShadow() : 'none',
        },
        '& .MuiCardContent-root': {
          borderRadius: 'inherit',
          height: '100%',
        },
        ...sx,
      }}
    >
      {gradient && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: gradient,
            opacity: 0.03,
            zIndex: 0,
            borderRadius: 'inherit',
          }}
        />
      )}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          height: '100%',
          borderRadius: 'inherit',
        }}
      >
        {children}
      </Box>
    </Paper>
  );
};

export default GlassSurface; 