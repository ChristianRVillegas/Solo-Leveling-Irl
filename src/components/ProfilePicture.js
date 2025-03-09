import React from 'react';
import { useGame } from '../contexts/GameContext';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Reusable profile picture component that displays user avatar or initials
 * 
 * @param {Object} props
 * @param {string} props.src - Image source URL
 * @param {string} props.alt - Alternative text for the image
 * @param {string} props.size - Size of the avatar (small, medium, large)
 * @param {string} props.className - Additional CSS classes
 * @param {function} props.onClick - Click handler
 */
const ProfilePicture = ({ 
  src, 
  alt, 
  size = "medium", 
  className = "", 
  onClick,
  showBorder = true
}) => {
  const { playerName } = useGame();
  const { theme } = useTheme();

  // Calculate size based on prop
  const getSizeStyle = () => {
    switch (size) {
      case "small":
        return { width: '36px', height: '36px', fontSize: '1rem' };
      case "large":
        return { width: '120px', height: '120px', fontSize: '3rem' };
      case "medium":
      default:
        return { width: '64px', height: '64px', fontSize: '1.5rem' };
    }
  };

  // Get initial from player name
  const getInitial = () => {
    return playerName ? playerName.charAt(0).toUpperCase() : '?';
  };

  const sizeStyle = getSizeStyle();

  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        ...sizeStyle,
        borderRadius: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        border: showBorder ? `2px solid ${theme.primary}` : 'none',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.text,
        fontWeight: 'bold',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        position: 'relative',
      }}
    >
      {src ? (
        <img
          src={src}
          alt={alt || `${playerName}'s profile picture`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        getInitial()
      )}
    </div>
  );
};

export default ProfilePicture;
