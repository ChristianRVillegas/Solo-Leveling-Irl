import React, { useState, useEffect } from 'react';
import { useAchievement } from '../../contexts/AchievementContext';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Component that displays a notification when achievements are unlocked
 * Animates in from the bottom right, stays for a few seconds, then animates out
 */
const AchievementNotification = () => {
  const { unreadNotifications, markNotificationRead, clearNotification, achievements } = useAchievement();
  const [currentNotification, setCurrentNotification] = useState(null);
  const [visible, setVisible] = useState(false);
  const [achievement, setAchievement] = useState(null);
  const { theme } = useTheme();
  
  // Handle notifications one at a time
  useEffect(() => {
    // If there's already a notification being displayed, don't do anything
    if (currentNotification || unreadNotifications.length === 0) return;
    
    // Get the first unread notification
    const notification = unreadNotifications[0];
    
    // Find the corresponding achievement
    const achievement = achievements.find(
      a => a.id === notification.achievementId
    );
    
    if (!achievement) {
      // If achievement not found, clear the notification
      clearNotification(notification.id);
      return;
    }
    
    // Set the current notification and achievement
    setCurrentNotification(notification);
    setAchievement(achievement);
    
    // Mark notification as read
    markNotificationRead(notification.id);
    
    // Show the notification
    setVisible(true);
    
    // Hide the notification after 5 seconds
    const hideTimer = setTimeout(() => {
      setVisible(false);
    }, 5000);
    
    // Clean up timers
    return () => {
      clearTimeout(hideTimer);
    };
    
  }, [unreadNotifications, currentNotification, markNotificationRead, clearNotification]);
  
  // Handle animation end
  const handleAnimationEnd = () => {
    if (!visible && currentNotification) {
      // Clear the notification after the hide animation completes
      clearNotification(currentNotification.id);
      setCurrentNotification(null);
      setAchievement(null);
    }
  };
  
  // If no notification is being displayed, return null
  if (!currentNotification || !achievement) {
    return null;
  }
  
  return (
    <div 
      style={{
        position: 'fixed',
        bottom: 'var(--spacing-lg)',
        right: 'var(--spacing-lg)',
        maxWidth: '300px',
        zIndex: 1000,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.3s ease-in-out',
      }}
      onAnimationEnd={handleAnimationEnd}
    >
      <div 
        style={{
          backgroundColor: theme.card,
          color: theme.text,
          padding: 'var(--spacing-md)',
          borderRadius: 'var(--border-radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          borderLeft: `3px solid ${theme.success}`,
        }}
      >
        <div 
          style={{ 
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'var(--spacing-md)'
          }}
        >
          <div 
            style={{ 
              fontSize: '2rem',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            {achievement.icon}
          </div>
          
          <div>
            <h4 
              style={{ 
                margin: 0, 
                marginBottom: 'var(--spacing-xs)',
                color: theme.success
              }}
            >
              Achievement Unlocked!
            </h4>
            
            <h3 
              style={{ 
                margin: 0, 
                marginBottom: 'var(--spacing-xs)'
              }}
            >
              {achievement.title}
            </h3>
            
            <p 
              style={{ 
                margin: 0, 
                fontSize: '0.875rem'
              }}
            >
              {achievement.description}
            </p>
          </div>
        </div>
        
        <button 
          style={{
            position: 'absolute',
            top: 'var(--spacing-xs)',
            right: 'var(--spacing-xs)',
            background: 'none',
            border: 'none',
            color: theme.text,
            opacity: 0.5,
            cursor: 'pointer',
            fontSize: '0.75rem',
            padding: '2px 5px',
          }}
          onClick={() => setVisible(false)}
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default AchievementNotification;
