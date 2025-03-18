import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Box, useTheme } from '@mui/material';

interface VisionBackgroundProps {
  particles?: boolean;
  ambientLight?: boolean;
}

interface Blob {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  color: string;
  speedX: number;
  speedY: number;
  growing: boolean;
  maxSize: number;
  minSize: number;
  blur: number;
  lifespan: number;
  currentLife: number;
  isPermanent?: boolean;
}

const VisionBackground: React.FC<VisionBackgroundProps> = ({ 
  particles = true, 
  ambientLight = true 
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const blobCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const animationFrameRef = useRef<number | null>(null);
  const blobAnimationFrameRef = useRef<number | null>(null);
  const blobsRef = useRef<Blob[]>([]);
  const [initialized, setInitialized] = useState(false);
  const nextBlobId = useRef(1);
  const lastCheckTimeRef = useRef(0);
  
  // Refined background colors for better contrast
  const bgColor = isDarkMode 
    ? 'rgb(18, 20, 33)' // Slightly darker for better contrast
    : 'rgb(240, 242, 250)';
  
  // Enhanced color palettes with more variety
  const darkModeColors = [
    'rgba(110, 70, 200, 0.4)',   // Purple
    'rgba(90, 50, 180, 0.35)',   // Blue-purple
    'rgba(140, 60, 200, 0.3)',   // Violet
    'rgba(180, 100, 240, 0.25)', // Pink-purple
    'rgba(60, 90, 210, 0.3)',    // Blue
    'rgba(200, 120, 210, 0.25)', // Pink
    'rgba(70, 130, 220, 0.3)',   // Light blue
  ];
  
  const lightModeColors = [
    'rgba(180, 210, 255, 0.3)',  // Light blue
    'rgba(160, 200, 255, 0.25)', // Sky blue
    'rgba(140, 180, 250, 0.2)',  // Pale blue
    'rgba(200, 190, 255, 0.25)', // Lavender
    'rgba(220, 180, 250, 0.2)',  // Light purple
    'rgba(240, 180, 220, 0.15)', // Light pink
    'rgba(170, 210, 230, 0.25)', // Aqua blue
  ];

  // Create a random blob - moved to useCallback to prevent recreation
  const createRandomBlob = useCallback((colorPalette: string[], isPermanent: boolean = false) => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Larger size for permanent blobs
    const sizeFactor = isPermanent ? 0.4 : 0.2;
    const varianceFactor = isPermanent ? 0.05 : 0.1;
    
    const minSize = Math.min(windowWidth, windowHeight) * (sizeFactor + Math.random() * varianceFactor);
    const maxSize = minSize * (1.3 + Math.random() * 0.7);
    
    // Permanent blobs have infinite lifespan; temporary ones are 15-30 seconds
    const lifespan = isPermanent ? Number.MAX_SAFE_INTEGER : 15000 + Math.random() * 15000;
    
    // Slower movement for permanent blobs
    const speedFactor = isPermanent ? 0.05 : 0.2;
    
    // Higher opacity for permanent blobs
    const opacityBase = isPermanent ? 0.15 : 0.1;
    const opacityVariance = isPermanent ? 0.1 : 0.2;
    
    return {
      id: nextBlobId.current++,
      x: Math.random() * windowWidth,
      y: Math.random() * windowHeight,
      size: minSize,
      opacity: Math.random() * opacityVariance + opacityBase,
      color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
      speedX: (Math.random() - 0.5) * speedFactor,
      speedY: (Math.random() - 0.5) * speedFactor,
      growing: Math.random() > 0.5,
      maxSize,
      minSize,
      // Less blur for permanent blobs so they're more visible
      blur: isPermanent ? Math.random() * 30 + 40 : Math.random() * 40 + 60,
      lifespan,
      currentLife: 0,
      isPermanent
    };
  }, []);

  // Create permanent blobs
  const createPermanentBlobs = useCallback(() => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const colorPalette = isDarkMode ? darkModeColors : lightModeColors;
    const permanentBlobs: Blob[] = [];
    
    // Create 3 permanent blobs positioned strategically
    // First blob: top-left quadrant
    permanentBlobs.push({
      ...createRandomBlob(colorPalette, true),
      x: windowWidth * 0.25,
      y: windowHeight * 0.25
    });
    
    // Second blob: near center-right
    permanentBlobs.push({
      ...createRandomBlob(colorPalette, true),
      x: windowWidth * 0.7,
      y: windowHeight * 0.45
    });
    
    // Third blob: bottom-center
    permanentBlobs.push({
      ...createRandomBlob(colorPalette, true),
      x: windowWidth * 0.4,
      y: windowHeight * 0.75
    });
    
    return permanentBlobs;
  }, [isDarkMode, darkModeColors, lightModeColors, createRandomBlob]);

  // Initialize blobs - only once
  useEffect(() => {
    if (!ambientLight || initialized) return;
    
    // Create initial set of blobs
    const generateInitialBlobs = () => {
      const colorPalette = isDarkMode ? darkModeColors : lightModeColors;
      
      // First add permanent blobs
      const permanentBlobs = createPermanentBlobs();
      
      // Then add temporary blobs (6-8 of them)
      const count = Math.floor(Math.random() * 3) + 6;
      
      const initialBlobs: Blob[] = [...permanentBlobs];
      
      for (let i = 0; i < count; i++) {
        initialBlobs.push(createRandomBlob(colorPalette));
      }
      
      blobsRef.current = initialBlobs;
      setInitialized(true);
    };
    
    generateInitialBlobs();
  }, [ambientLight, initialized, isDarkMode, createRandomBlob, createPermanentBlobs, darkModeColors, lightModeColors]);
  
  // Separate effect for adding blobs periodically
  useEffect(() => {
    if (!ambientLight || !initialized) return;
    
    // Add new blobs more frequently (every 3-5 seconds)
    const addBlobInterval = setInterval(() => {
      const colorPalette = isDarkMode ? darkModeColors : lightModeColors;
      
      // Only add temporary blobs if we have fewer than 12 total
      const temporaryBlobCount = blobsRef.current.filter(blob => !blob.isPermanent).length;
      const shouldAddBlob = temporaryBlobCount < 9;
      
      if (shouldAddBlob) {
        const newBlob = createRandomBlob(colorPalette);
        blobsRef.current = [...blobsRef.current, newBlob];
      }
    }, 3000 + Math.random() * 2000);
    
    return () => {
      clearInterval(addBlobInterval);
    };
  }, [ambientLight, isDarkMode, initialized, createRandomBlob, darkModeColors, lightModeColors]);
  
  // Animate blobs
  useEffect(() => {
    if (!ambientLight || !blobCanvasRef.current || !initialized) return;
    
    const canvas = blobCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Use a timestamp-based animation to ensure smooth performance
    let lastTime = 0;
    
    const animateBlobs = (timestamp: number) => {
      // Calculate delta time for smooth animation regardless of frame rate
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Check if we need to add more blobs (every 2 seconds)
      if (timestamp - lastCheckTimeRef.current > 2000) {
        lastCheckTimeRef.current = timestamp;
        
        // Count visible non-permanent blobs
        const visibleTempBlobs = blobsRef.current.filter(blob => 
          !blob.isPermanent && 
          blob.currentLife < blob.lifespan * 0.8 && 
          blob.currentLife > blob.lifespan * 0.1
        ).length;
        
        // If we have fewer than 5 visible temporary blobs, add more
        if (visibleTempBlobs < 5) {
          const colorPalette = isDarkMode ? darkModeColors : lightModeColors;
          const numToAdd = Math.min(8 - visibleTempBlobs, 3); // Add up to 3 blobs at once
          
          for (let i = 0; i < numToAdd; i++) {
            blobsRef.current.push(createRandomBlob(colorPalette));
          }
        }
      }
      
      // Update blobs without using state updates inside animation loop
      blobsRef.current = blobsRef.current.filter(blob => {
        // Update blob lifespan
        blob.currentLife += deltaTime;
        
        // Only remove if too old and not permanent
        if (!blob.isPermanent && blob.currentLife > blob.lifespan) {
          return false;
        }
        
        // Calculate opacity based on life stage - fade in and fade out
        let opacityMultiplier = 1;
        
        if (!blob.isPermanent) {
          const fadeInDuration = blob.lifespan * 0.1;
          const fadeOutStart = blob.lifespan * 0.8;
          
          if (blob.currentLife < fadeInDuration) {
            // Fade in
            opacityMultiplier = blob.currentLife / fadeInDuration;
          } else if (blob.currentLife > fadeOutStart) {
            // Fade out
            opacityMultiplier = 1 - ((blob.currentLife - fadeOutStart) / (blob.lifespan - fadeOutStart));
          }
        }
        
        // Apply opacity based on life cycle
        const displayOpacity = (blob.opacity * opacityMultiplier);
        
        // Skip rendering extremely transparent blobs
        if (displayOpacity < 0.01) return true;
        
        // Move blob
        let newX = blob.x + blob.speedX * (deltaTime / 16); // Normalize to 60fps
        let newY = blob.y + blob.speedY * (deltaTime / 16);
        
        // Bounce off edges with some padding
        const padding = blob.size / 2;
        if (newX < -padding) {
          newX = -padding;
          blob.speedX *= -1;
        }
        if (newX > canvas.width + padding) {
          newX = canvas.width + padding;
          blob.speedX *= -1;
        }
        if (newY < -padding) {
          newY = -padding;
          blob.speedY *= -1;
        }
        if (newY > canvas.height + padding) {
          newY = canvas.height + padding;
          blob.speedY *= -1;
        }
        
        // Grow or shrink (more slowly)
        let growSpeed = 0.1 * (deltaTime / 16);
        // Even slower for permanent blobs
        if (blob.isPermanent) {
          growSpeed *= 0.5;
        }
        
        let newSize = blob.size;
        if (blob.growing) {
          newSize += growSpeed;
          if (newSize >= blob.maxSize) {
            blob.growing = false;
          }
        } else {
          newSize -= growSpeed;
          if (newSize <= blob.minSize) {
            blob.growing = true;
          }
        }
        
        // Draw blob with uneven shape
        ctx.save();
        ctx.filter = `blur(${blob.blur}px)`;
        
        // Create an uneven, organic blob shape
        ctx.beginPath();
        const angleStep = Math.PI * 2 / 12; // More points for smoother shape
        const radiusVariance = 0.3; // 30% variance in radius
        
        // Use consistent random variations by using the blob's ID
        const randSeeds = Array(12).fill(0).map((_, i) => 
          Math.sin(blob.id * 100 + i * 10) * 0.5 + 0.5
        );
        
        for (let i = 0; i < 12; i++) {
          const angle = i * angleStep;
          // Use consistent random variation for this point
          const radiusVariation = 1 - radiusVariance / 2 + randSeeds[i] * radiusVariance;
          const radius = newSize * radiusVariation / 2;
          
          const x = newX + Math.cos(angle) * radius;
          const y = newY + Math.sin(angle) * radius;
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            // Use bezier curves for smoother transitions with consistent control points
            const prevAngle = (i - 1) * angleStep;
            const prevRad = newSize * (1 - radiusVariance / 2 + randSeeds[i-1] * radiusVariance) / 2;
            const prevX = newX + Math.cos(prevAngle) * prevRad;
            const prevY = newY + Math.sin(prevAngle) * prevRad;
            
            // Generate control points based on blob id for consistency
            const cpVariation = Math.sin(blob.id * 200 + i * 20) * 10;
            const cp1x = prevX + (x - prevX) * 0.5 + cpVariation;
            const cp1y = prevY + (y - prevY) * 0.5 + cpVariation;
            
            ctx.quadraticCurveTo(cp1x, cp1y, x, y);
          }
        }
        ctx.closePath();
        
        // Fill with gradient for more depth
        const gradient = ctx.createRadialGradient(newX, newY, 0, newX, newY, newSize);
        const baseColor = blob.color.replace(/[\d.]+\)$/g, '');
        gradient.addColorStop(0, `${baseColor}${displayOpacity * 1.5})`);
        gradient.addColorStop(1, `${baseColor}0)`);
        
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.restore();
        
        // Update blob properties
        blob.x = newX;
        blob.y = newY;
        blob.size = newSize;
        
        return true;
      });
      
      blobAnimationFrameRef.current = requestAnimationFrame(animateBlobs);
    };
    
    blobAnimationFrameRef.current = requestAnimationFrame(animateBlobs);
    
    return () => {
      if (blobAnimationFrameRef.current) {
        cancelAnimationFrame(blobAnimationFrameRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [ambientLight, initialized, isDarkMode, darkModeColors, lightModeColors, createRandomBlob]);

  // Particle animation
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
      Math.floor(window.innerWidth * window.innerHeight / 18000), 
      45 // Increased particle count
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
    
    // Enhanced particle colors
    const particleColors = isDarkMode
      ? [
          'rgba(110, 100, 220, 0.4)',
          'rgba(140, 90, 230, 0.35)',
          'rgba(160, 120, 250, 0.3)',
          'rgba(200, 140, 255, 0.25)',
          'rgba(100, 150, 230, 0.35)',
        ]
      : [
          'rgba(100, 140, 220, 0.25)',
          'rgba(120, 160, 240, 0.2)',
          'rgba(140, 180, 250, 0.15)',
          'rgba(160, 140, 255, 0.2)',
          'rgba(180, 170, 240, 0.18)',
        ];

    // Initialize particles with better visibility
    for (let i = 0; i < particleCount; i++) {
      const size = Math.random() * 3 + 0.5; // Slightly larger particles
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const speedX = (Math.random() - 0.5) * 0.25; // More movement
      const speedY = (Math.random() - 0.5) * 0.25;
      
      const color = particleColors[Math.floor(Math.random() * particleColors.length)];
      
      particlesArray.push({
        x, y, size, speedX, speedY, color
      });
    }

    // Optimized animation function
    let lastTime = 0;
    const animate = (timestamp: number) => {
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particlesArray.forEach(particle => {
        // Move particle with delta time
        particle.x += particle.speedX * (deltaTime / 16);
        particle.y += particle.speedY * (deltaTime / 16);
        
        // Wrap around edges
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.y > canvas.height) particle.y = 0;
        if (particle.y < 0) particle.y = canvas.height;
        
        // Draw particle with slight blur for softer look
        ctx.save();
        ctx.shadowBlur = 5;
        ctx.shadowColor = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
        ctx.restore();
      });
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    
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
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        background: bgColor,
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      {/* Blob canvas */}
      {ambientLight && (
        <canvas
          ref={blobCanvasRef}
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
            zIndex: 2,
            pointerEvents: 'none',
          }}
        />
      )}
    </Box>
  );
};

export default VisionBackground;