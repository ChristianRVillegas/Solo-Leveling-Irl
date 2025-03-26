import React from 'react';
import { getTitleById } from '../../utils/titles/titleDefinitions';

/**
 * Component to display a user's selected title
 * @param {object} props
 * @param {string} props.titleId - The ID of the title to display
 * @param {string} props.userName - The name of the user (optional)
 * @param {boolean} props.showIcon - Whether to show the title icon (default: true)
 * @param {string} props.size - Size of the title display (small, medium, large)
 * @param {object} props.style - Additional styles to apply
 */
const TitleDisplay = ({ titleId, userName, showIcon = true, size = 'medium', style = {} }) => {
  if (!titleId) return null;
  
  const title = getTitleById(titleId);
  if (!title) return null;
  
  // Determine font size based on size prop
  let fontSize;
  switch (size) {
    case 'small':
      fontSize = '0.75rem';
      break;
    case 'medium':
      fontSize = '0.875rem';
      break;
    case 'large':
      fontSize = '1rem';
      break;
    default:
      fontSize = '0.875rem';
  }
  
  return (
    <div 
      style={{ 
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: '4px',
        backgroundColor: `${title.rarity.color}33`, // Add transparency
        color: title.rarity.color,
        fontWeight: 'bold',
        fontSize,
        ...style
      }}
    >
      {showIcon && title.icon && (
        <span style={{ marginRight: '4px' }}>{title.icon}</span>
      )}
      <span>
        {title.name}
        {userName && ` ${userName}`}
      </span>
    </div>
  );
};

export default TitleDisplay;