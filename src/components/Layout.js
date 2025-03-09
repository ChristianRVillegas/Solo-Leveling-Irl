import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAchievement } from '../contexts/AchievementContext';
import { useAuth } from '../contexts/AuthContext';
import AchievementNotification from './achievements/AchievementNotification';
import AnimatedStreakCounter from './AnimatedStreakCounter';
import ProfilePicture from './ProfilePicture';

const Layout = ({ children }) => {
  const { currentUser } = useAuth();
  const { playerName, getOverallLevel, getOverallRank, streak, profilePicture } = useGame();
  const { theme } = useTheme();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  const closeMenu = () => {
    setMenuOpen(false);
  };

  const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User';

  
  const { unreadNotifications } = useAchievement();

  const navLinks = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/profile', label: 'Profile', icon: '👤' },
    { path: '/stats', label: 'Stats', icon: '📈' },
    { path: '/tasks', label: 'Tasks', icon: '✅' },
    { path: '/calendar', label: 'Calendar', icon: '📅' },
    { path: '/analytics', label: 'Analytics', icon: '🔍' },
    { path: '/achievements', label: 'Achievements', icon: '🏆', badge: unreadNotifications.length > 0 },
    { path: '/settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <div className="app-container">
      {/* Header */}
      <header 
        style={{ 
          backgroundColor: theme.card,
          height: 'var(--header-height)',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 var(--spacing-lg)',
          borderBottom: `1px solid ${theme.border}`
        }}
      >
        <div className="flex items-center gap-md">
          <button 
            className="md:hidden btn btn-outline"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
          
          <Link to="/" style={{ textDecoration: 'none', color: theme.text }}>
            <h1 style={{ margin: 0, fontSize: '1.25rem', cursor: 'pointer' }}>
              Solo Leveling IRL
            </h1>
          </Link>
        </div>
        
        <div className="flex items-center gap-md">
          <Link to="/profile" style={{ textDecoration: 'none' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--spacing-sm)',
              background: 'rgba(0, 0, 0, 0.2)',
              padding: '4px 12px',
              borderRadius: 'var(--border-radius-md)',
              cursor: 'pointer',
              transition: 'background-color var(--transition-fast)',
              color: theme.text,
            }}>
              <span>Lv.{getOverallLevel()}</span>
              <div style={{ 
                width: '1px', 
                height: '20px', 
                background: 'rgba(255, 255, 255, 0.2)' 
              }}></div>
              <span>{getOverallRank()}</span>
            </div>
          </Link>
          
          <AnimatedStreakCounter streak={streak.current} />
          
          <Link to="/profile" style={{ textDecoration: 'none' }}>
            <ProfilePicture
              size="small"
              src={profilePicture}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 0 8px rgba(99, 102, 241, 0.6)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </Link>
        </div>
      </header>

      {/* Sidebar */}
      <nav 
        style={{ 
          backgroundColor: theme.card,
          width: 'var(--sidebar-width)',
          position: 'fixed',
          top: 'var(--header-height)',
          left: menuOpen ? 0 : '-100%',
          bottom: 0,
          zIndex: 90,
          overflowY: 'auto',
          transition: 'left var(--transition-normal)',
          borderRight: `1px solid ${theme.border}`,
          boxShadow: 'var(--shadow-md)',
          padding: 'var(--spacing-md) 0',
          display: 'flex',
          flexDirection: 'column'
        }}
        className="md:flex"
      >
        <div style={{ flex: 1 }}>
          {navLinks.map(link => (
            <Link 
              key={link.path}
              to={link.path}
              onClick={closeMenu}
              style={{ 
                display: 'flex',
                alignItems: 'center',
                padding: 'var(--spacing-md) var(--spacing-lg)',
                color: location.pathname === link.path ? theme.primary : theme.text,
                borderLeft: `3px solid ${location.pathname === link.path ? theme.primary : 'transparent'}`,
                background: location.pathname === link.path ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                transition: 'all var(--transition-fast)'
              }}
            >
              <span style={{ fontSize: '1.25rem', marginRight: 'var(--spacing-md)' }}>
                {link.icon}
              </span>
              {link.label}
              {link.badge && (
                <div style={{
                  marginLeft: 'var(--spacing-sm)',
                  backgroundColor: theme.accent,
                  color: 'white',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {unreadNotifications.length}
                </div>
              )}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile overlay */}
      {menuOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 80,
            display: 'block'
          }}
          className="md:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Main content */}
      <div className="main-content">
        <main className="content-area">
          {children}
        </main>
      </div>
      
      {/* Achievement notification */}
      <AchievementNotification />
    </div>
  );
};

export default Layout;
