import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import StreakParticle from './StreakParticle';

/**
 * An animated streak counter with fire animation
 * 
 * @param {Object} props
 * @param {number} props.streak - Current streak count
 */
const AnimatedStreakCounter = ({ streak = 0 }) => {
  const { theme } = useTheme();
  const [prevStreak, setPrevStreak] = useState(streak);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showFire, setShowFire] = useState(false);
  const [particles, setParticles] = useState([]);
  const countRef = useRef(null);
  const fireRef = useRef(null);
  const containerRef = useRef(null);
  
  // Generate particles for the celebration effect
  const generateParticles = () => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const newParticles = [];
    const colors = [theme.accent, theme.primary, '#FFD700', '#FF6B35']; // Fire colors
    
    // Generate 12 particles
    for (let i = 0; i < 12; i++) {
      // Calculate random position offset from center
      const x = centerX + (Math.random() * 20 - 10);
      const y = centerY - Math.random() * 5;
      
      newParticles.push({
        id: Date.now() + i,
        x,
        y,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 200,
        size: 5 + Math.random() * 7
      });
    }
    
    setParticles(newParticles);
    
    // Clear particles after animation
    setTimeout(() => {
      setParticles([]);
    }, 2000);
  };
  
  // Handle click on streak counter for interactive animation
  const handleClick = () => {
    // Manually trigger animation on click for fun interaction
    setIsAnimating(true);
    generateParticles();
    
    // Fire animation
    if (fireRef.current) {
      fireRef.current.style.transform = 'translateY(-15px) scale(1.8)';
      fireRef.current.style.opacity = '1';
    }
    
    // Number bounce animation
    if (countRef.current) {
      countRef.current.style.transform = 'scale(1.5)';
      countRef.current.style.color = theme.accent;
    }
    
    // Reset animations after they complete
    setTimeout(() => {
      if (fireRef.current) {
        fireRef.current.style.transform = 'translateY(0) scale(1)';
        fireRef.current.style.opacity = '0.9';
      }
      
      if (countRef.current) {
        countRef.current.style.transform = 'scale(1)';
        countRef.current.style.color = streak >= 3 ? theme.accent : theme.text;
      }
      
      setIsAnimating(false);
    }, 800);
  };
  
  useEffect(() => {
    // Only animate when streak increases
    if (streak > prevStreak) {
      // Start animation
      setIsAnimating(true);
      setShowFire(true);
      generateParticles();
      
      // Fire animation
      if (fireRef.current) {
        fireRef.current.style.transform = 'translateY(-10px) scale(1.5)';
        fireRef.current.style.opacity = '1';
      }
      
      // Number bounce animation
      if (countRef.current) {
        countRef.current.style.transform = 'scale(1.3)';
        countRef.current.style.color = theme.accent;
      }
      
      // Reset animations after they complete
      const animTimeout = setTimeout(() => {
        if (fireRef.current) {
          fireRef.current.style.transform = 'translateY(0) scale(1)';
          fireRef.current.style.opacity = '0.9';
        }
        
        if (countRef.current) {
          countRef.current.style.transform = 'scale(1)';
          countRef.current.style.color = streak >= 3 ? theme.accent : theme.text;
        }
        
        setIsAnimating(false);
      }, 800);
      
      // Update previous streak
      setPrevStreak(streak);
      
      return () => clearTimeout(animTimeout);
    } else {
      // Update previous streak without animation
      setPrevStreak(streak);
    }
  }, [streak, prevStreak, theme]);
  
  return (
    <div 
      ref={containerRef}
      onClick={handleClick}
      style={{ 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--spacing-xs)',
        background: streak >= 3 ? 'rgba(249, 115, 22, 0.2)' : 'rgba(0, 0, 0, 0.2)',
        padding: '4px 12px',
        borderRadius: 'var(--border-radius-md)',
        position: 'relative',
        overflow: 'visible', // Changed to visible to allow particles to flow out
        cursor: 'pointer',
        transition: 'transform 0.2s ease',
      }}
      onMouseOver={(e) => {
        if (!isAnimating) {
          e.currentTarget.style.transform = 'scale(1.05)';
        }
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      <div
        ref={fireRef}
        className="animate-flame"
        style={{
          fontSize: '1.25rem',
          transition: 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.5s ease',
          opacity: 0.9,
          filter: streak >= 3 ? 'none' : 'grayscale(40%)',
        }}
      >
        🔥
      </div>
      
      <span
        ref={countRef}
        style={{
          color: streak >= 3 ? theme.accent : theme.text,
          fontWeight: 'bold',
          transition: 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), color 0.3s ease',
        }}
      >
        {streak}
      </span>
      
      <span style={{ color: streak >= 3 ? theme.accent : theme.text }}>
        day{streak !== 1 ? 's' : ''}
      </span>
      
      {isAnimating && (
        <div className="animate-pulse"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle, ${theme.accent}20 0%, transparent 70%)`,
          }}
        />
      )}
      
      {/* Render particles */}
      {particles.map(particle => (
        <StreakParticle
          key={particle.id}
          x={particle.x}
          y={particle.y}
          color={particle.color}
          delay={particle.delay}
          size={particle.size}
        />
      ))}
    </div>
  );
};

export default AnimatedStreakCounter;