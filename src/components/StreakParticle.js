import React, { useState, useEffect } from 'react';

/**
 * A single fire particle that animates upward
 */
const StreakParticle = ({ x, y, color, delay, size = 10 }) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    // Small delay before starting animation
    const timer = setTimeout(() => {
      setMounted(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay]);
  
  return mounted ? (
    <div
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        backgroundColor: color,
        opacity: 0,
        pointerEvents: 'none',
        animation: `particle 1s ease-out ${delay}ms forwards`,
      }}
    />
  ) : null;
};

export default StreakParticle;
