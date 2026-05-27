// src/hooks/useMobileLayout.js
// Simple hook that returns whether we're on mobile
// Use this in any component that needs mobile-specific logic

import { useState, useEffect } from 'react';

export function useMobileLayout() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  const [isSmall,  setIsSmall]  = useState(() => window.innerWidth <= 380);

  useEffect(() => {
    const handler = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsSmall(window.innerWidth <= 380);
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return { isMobile, isSmall };
}