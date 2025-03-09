import React, { useState } from 'react';
import { useAchievement } from '../contexts/AchievementContext';
import { useTheme } from '../contexts/ThemeContext';
import { format } from 'date-fns';

/**
 * Achievements page component displays all achievements grouped by category
 * Shows both locked and unlocked achievements with progress indicators
 */
const Achievements = () => {
  const { achievementsByCategory } = useAchievement();
  const { theme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Get all unique categories
  const categories = Object.keys(achievementsByCategory);
  
  // Set the first category as selected if none is selected
  if (categories.length > 0 && !selectedCategory) {
    setSelectedCategory(categories[0]);
  }
  
  // Filter achievements by selected category
  const displayedAchievements = selectedCategory 
    ? achievementsByCategory[selectedCategory] 
    : [];
  
  // Count of unlocked achievements
  const unlockedCount = Object.values(achievementsByCategory)
    .flat()
    .filter(achievement => achievement.unlocked)
    .length;
  
  // Total number of achievements
  const totalCount = Object.values(achievementsByCategory)
    .flat()
    .length;
  
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-md">
        <h2 className="text-2xl">Achievements</h2>
        <div style={{ 
          padding: '4px 12px', 
          borderRadius: 'var(--border-radius-md)',
          backgroundColor: theme.card
        }}>
          {unlockedCount} / {totalCount} Unlocked
        </div>
      </div>
      
      {/* Category Tabs */}
      <div className="card mb-lg">
        <div style={{ 
          display: 'flex', 
          gap: 'var(--spacing-md)',
          overflowX: 'auto',
          paddingBottom: 'var(--spacing-sm)',
          marginBottom: 'var(--spacing-md)'
        }}>
          {categories.map(category => (
            <button
              key={category}
              className={`btn ${selectedCategory === category ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
        
        {/* Achievement Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-md">
          {displayedAchievements.map(achievement => (
            <AchievementCard 
              key={achievement.id} 
              achievement={achievement} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Achievement Card component 
 * Displays individual achievement with unlock status and progress
 */
const AchievementCard = ({ achievement }) => {
  const { theme } = useTheme();
  
  return (
    <div 
      className={`card ${achievement.unlocked ? 'animate-fade-in' : ''}`}
      style={{
        borderLeft: achievement.unlocked 
          ? `3px solid ${theme.success}` 
          : '3px solid rgba(255, 255, 255, 0.1)',
        opacity: achievement.unlocked ? 1 : 0.7,
        transition: 'all var(--transition-normal)'
      }}
    >
      <div className="flex gap-md items-start">
        <div 
          style={{ 
            fontSize: '2rem',
            backgroundColor: achievement.unlocked 
              ? 'rgba(16, 185, 129, 0.1)' 
              : 'rgba(255, 255, 255, 0.05)',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          {achievement.icon}
        </div>
        
        <div style={{ flex: 1 }}>
          <h3 
            style={{ 
              margin: 0, 
              marginBottom: 'var(--spacing-xs)',
              color: achievement.unlocked ? theme.success : theme.text
            }}
          >
            {achievement.title}
            
            {achievement.unlocked && (
              <span 
                style={{ 
                  marginLeft: 'var(--spacing-sm)',
                  fontSize: '0.75rem',
                  opacity: 0.7
                }}
              >
                • Unlocked
              </span>
            )}
          </h3>
          
          <p 
            style={{ 
              margin: 0, 
              marginBottom: 'var(--spacing-sm)',
              fontSize: '0.875rem'
            }}
          >
            {achievement.description}
          </p>
          
          {/* Progress Bar */}
          {!achievement.unlocked && achievement.progress && (
            <div style={{ marginTop: 'var(--spacing-sm)' }}>
              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 'var(--spacing-xs)',
                  fontSize: '0.75rem'
                }}
              >
                <span>Progress</span>
                <span>
                  {achievement.progress.current} / {achievement.progress.target}
                </span>
              </div>
              
              <div className="progress-bar">
                <div 
                  className="progress-bar-fill"
                  style={{ 
                    width: `${(achievement.progress.current / achievement.progress.target) * 100}%`,
                    backgroundColor: theme.primary
                  }}
                ></div>
              </div>
            </div>
          )}
          
          {/* Unlock Date */}
          {achievement.unlocked && achievement.unlockedAt && (
            <div 
              style={{ 
                fontSize: '0.75rem',
                marginTop: 'var(--spacing-sm)',
                color: theme.text,
                opacity: 0.7
              }}
            >
              Unlocked on {format(new Date(achievement.unlockedAt), 'MMM d, yyyy')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Achievements;
