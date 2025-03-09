import React from 'react';
import { useTask } from '../../contexts/TaskContext';
import { useGame } from '../../contexts/GameContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Link } from 'react-router-dom';

/**
 * Component that displays task suggestions based on user's current stats
 * Can be used on Dashboard or Tasks page to recommend tasks
 */
const TaskSuggestions = ({ limit = 3, showTitle = true, onSelect = null }) => {
  const { getSuggestedTasks } = useTask();
  const { STATS } = useGame();
  const { theme } = useTheme();
  
  // Get suggested tasks
  const suggestedTasks = getSuggestedTasks(limit);
  
  if (suggestedTasks.length === 0) {
    return null;
  }
  
  return (
    <div className="card animate-fade-in" style={{ borderLeft: `3px solid ${theme.accent}` }}>
      {showTitle && (
        <div className="flex justify-between items-center mb-md">
          <h3 className="text-xl" style={{ color: theme.accent }}>Suggested Tasks</h3>
          <Link to="/tasks" style={{ color: theme.primary, textDecoration: 'none' }}>
            More Tasks
          </Link>
        </div>
      )}
      
      <p className="mb-md" style={{ fontSize: '0.875rem' }}>
        These tasks are suggested based on your current stat levels.
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-md">
        {suggestedTasks.map((task, index) => {
          const statInfo = STATS.find(s => s.id === task.statId);
          
          return (
            <div 
              key={index}
              className="card"
              style={{ 
                margin: 0, 
                cursor: onSelect ? 'pointer' : 'default',
                transition: 'all var(--transition-fast)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)'
              }}
              onClick={onSelect ? () => onSelect(task) : undefined}
            >
              <div className="flex items-center gap-md">
                <div style={{ fontSize: '1.5rem' }}>{statInfo.icon}</div>
                <div>
                  <h4 style={{ margin: 0, marginBottom: '4px' }}>{task.name}</h4>
                  <div style={{ fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{statInfo.name}</span>
                    <span>{task.type} task</span>
                  </div>
                </div>
              </div>
              
              {onSelect && (
                <button 
                  className="btn btn-primary mt-md"
                  style={{ width: '100%' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(task);
                  }}
                >
                  Add Task
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskSuggestions;
