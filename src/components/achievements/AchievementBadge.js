import React from 'react';
import { useAchievement } from '../../contexts/AchievementContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Link } from 'react-router-dom';

/**
 * Component that displays recent achievements and progress in the dashboard
 */
const AchievementBadge = () => {
  const { achievements } = useAchievement();
  const { theme } = useTheme();
  
  // Get unlocked achievements, sorted by unlock date (most recent first)
  const unlockedAchievements = achievements
    .filter(achievement => achievement.unlocked)
    .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt));
  
  // Get locked achievements with the most progress
  const lockedAchievements = achievements
    .filter(achievement => !achievement.unlocked)
    .sort((a, b) => {
      const aProgress = a.progress ? a.progress.current / a.progress.target : 0;
      const bProgress = b.progress ? b.progress.current / b.progress.target : 0;
      return bProgress - aProgress;
    });
  
  // Get total unlocked and total achievement count
  const unlockedCount = unlockedAchievements.length;
  const totalCount = achievements.length;
  
  return (
    <div className="card">
      <div className="flex justify-between items-center mb-md">
        <h3 className="text-xl">Achievements</h3>
        <Link 
          to="/achievements" 
          style={{ 
            color: theme.primary,
            textDecoration: 'none'
          }}
        >
          View All
        </Link>
      </div>
      
      <div style={{ marginBottom: 'var(--spacing-md)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-xs)' }}>
          <span>Progress</span>
          <span>{unlockedCount} / {totalCount}</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-bar-fill"
            style={{ 
              width: `${(unlockedCount / totalCount) * 100}%`,
              backgroundColor: theme.primary
            }}
          ></div>
        </div>
      </div>
      
      {/* Recently Unlocked Achievements */}
      {unlockedAchievements.length > 0 && (
        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          <h4 style={{ marginBottom: 'var(--spacing-sm)', fontSize: '0.875rem', fontWeight: 'bold' }}>
            Recently Unlocked
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
            {unlockedAchievements.slice(0, 2).map(achievement => (
              <div 
                key={achievement.id}
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)',
                  padding: 'var(--spacing-sm)',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: 'var(--border-radius-md)',
                  borderLeft: `2px solid ${theme.success}`
                }}
              >
                <div 
                  style={{ 
                    fontSize: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {achievement.icon}
                </div>
                
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>
                    {achievement.title}
                  </div>
                  <div style={{ fontSize: '0.75rem' }}>
                    {achievement.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Next Achievements to Unlock */}
      {lockedAchievements.length > 0 && (
        <div>
          <h4 style={{ marginBottom: 'var(--spacing-sm)', fontSize: '0.875rem', fontWeight: 'bold' }}>
            Next to Unlock
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
            {lockedAchievements.slice(0, 2).map(achievement => (
              <div 
                key={achievement.id}
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)',
                  padding: 'var(--spacing-sm)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 'var(--border-radius-md)',
                  borderLeft: `2px solid ${theme.primary}`
                }}
              >
                <div 
                  style={{ 
                    fontSize: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0.5
                  }}
                >
                  {achievement.icon}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>
                    {achievement.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', marginBottom: 'var(--spacing-xs)' }}>
                    {achievement.description}
                  </div>
                  
                  {achievement.progress && (
                    <div>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        fontSize: '0.7rem',
                        marginBottom: '2px'
                      }}>
                        <span>Progress</span>
                        <span>{achievement.progress.current} / {achievement.progress.target}</span>
                      </div>
                      
                      <div style={{
                        height: '4px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '2px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${(achievement.progress.current / achievement.progress.target) * 100}%`,
                          backgroundColor: theme.primary,
                          borderRadius: '2px'
                        }}></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementBadge;
