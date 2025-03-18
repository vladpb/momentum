import React, { useEffect, useRef } from 'react';
import { Box, useTheme } from '@mui/material';

interface VisionBackgroundProps {
  particles?: boolean;
  ambientLight?: boolean;
}

const VisionBackground: React.FC<VisionBackgroundProps> = ({ 
  particles = true, 
  ambientLight = true 
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const animationFrameRef = useRef<number | null>(null);
  
  // Refined background colors for better contrast
  const bgColor = isDarkMode 
    ? 'rgb(18, 20, 33)' // Slightly darker for better contrast
    : 'rgb(240, 242, 250)';
  
  useEffect(() => {
    if (!particles || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas to fill viewport completely
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Generate particles with optimized count based on screen size
    const particleCount = Math.min(
      Math.floor(window.innerWidth * window.innerHeight / 20000), 
      35
    );
    
    interface Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
    }

    const particlesArray: Particle[] = [];

    // Initialize particles with better visibility
    for (let i = 0; i < particleCount; i++) {
      const size = Math.random() * 2.5 + 0.5;
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const speedX = (Math.random() - 0.5) * 0.15;
      const speedY = (Math.random() - 0.5) * 0.15;
      
      const color = isDarkMode 
        ? `rgba(110, 100, 220, ${Math.random() * 0.4 + 0.15})` 
        : `rgba(100, 140, 220, ${Math.random() * 0.3 + 0.1})`;
      
      particlesArray.push({
        x, y, size, speedX, speedY, color
      });
    }

    // Optimized animation function
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particlesArray.forEach(particle => {
        // Move particle
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Wrap around edges
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.y > canvas.height) particle.y = 0;
        if (particle.y < 0) particle.y = canvas.height;
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
      });
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Cleanup function
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [particles, isDarkMode]);

  return (
    <Box
      sx={{
        position: 'fixed', // Changed from 'absolute' to 'fixed'
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw', // Changed from 100% to 100vw
        height: '100vh', // Changed from 100% to 100vh
        background: bgColor,
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      {ambientLight && (
        <>
          {/* Top right glow */}
          <Box
            sx={{
              position: 'absolute',
              top: '-20%',
              right: '-10%',
              width: '70%',
              height: '70%',
              borderRadius: '50%',
              background: isDarkMode 
                ? 'radial-gradient(circle, rgba(110, 70, 200, 0.4) 0%, rgba(90, 50, 180, 0) 70%)'
                : 'radial-gradient(circle, rgba(180, 210, 255, 0.45) 0%, rgba(180, 210, 255, 0) 70%)',
              zIndex: 0,
              pointerEvents: 'none',
            }}
          />
          
          {/* Bottom left glow */}
          <Box
            sx={{
              position: 'absolute',
              bottom: '-10%',
              left: '-5%',
              width: '60%',
              height: '60%',
              borderRadius: '50%',
              background: isDarkMode 
                ? 'radial-gradient(circle, rgba(90, 70, 170, 0.35) 0%, rgba(70, 50, 150, 0) 70%)'
                : 'radial-gradient(circle, rgba(160, 200, 255, 0.35) 0%, rgba(160, 200, 255, 0) 70%)',
              zIndex: 0,
              pointerEvents: 'none',
            }}
          />
          
          {/* Middle accent */}
          <Box
            sx={{
              position: 'absolute',
              top: '40%',
              left: '30%',
              width: '40%',
              height: '40%',
              borderRadius: '50%',
              background: isDarkMode 
                ? 'radial-gradient(circle, rgba(140, 60, 200, 0.2) 0%, rgba(120, 40, 180, 0) 75%)'
                : 'radial-gradient(circle, rgba(140, 180, 250, 0.2) 0%, rgba(140, 180, 250, 0) 75%)',
              zIndex: 0,
              pointerEvents: 'none',
            }}
          />
        </>
      )}
      
      {/* Canvas for particles */}
      {particles && (
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />
      )}
    </Box>
  );
};

export default VisionBackground; 