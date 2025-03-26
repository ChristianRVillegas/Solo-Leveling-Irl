import React, { useState, useEffect } from 'react';
import { useGame } from '../../contexts/GameContext';
import { useAnalyticsContext } from '../../contexts/AnalyticsContext';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * BasicStatGrid
 * 
 * A heat map visualization showing points earned from completed tasks by stat and day.
 * Uses a consistent blue color scheme with varying intensities based on point values.
 */
const BasicStatGrid = () => {
  const { taskHistory, STATS } = useGame();
  const { rawStats } = useAnalyticsContext();
  const { theme } = useTheme();
  const [activityData, setActivityData] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);
  
  // Process task history data
  useEffect(() => {
    // Ensure we have task history
    if (!taskHistory || !Array.isArray(taskHistory) || taskHistory.length === 0) {
      return;
    }
    
    const data = {};
    
    // Process each task and count points by day and stat
    taskHistory.forEach((task) => {
      // Skip tasks without completion date
      if (!task.completedAt) {
        return;
      }
      
      // Format the date for consistent lookup
      const taskDate = new Date(task.completedAt);
      const dateKey = taskDate.toISOString().split('T')[0];
      
      // Initialize date entry if needed
      if (!data[dateKey]) {
        data[dateKey] = {};
      }
      
      // Add points from task to the corresponding stat
      if (task.statId && (task.points || task.points === 0)) {
        if (!data[dateKey][task.statId]) {
          data[dateKey][task.statId] = 0;
        }
        data[dateKey][task.statId] += task.points;
      }
    });
    
    setActivityData(data);
  }, [taskHistory]);
  
  // Get the last 30 days
  const getLast30Days = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0); // Normalize to start of day
      days.push(date);
    }
    
    return days;
  };
  
  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get cell background style based on points
  const getCellStyle = (points) => {
    if (!points || points === 0) {
      return {
        backgroundColor: theme.backgroundDark,
        border: `1px solid ${theme.border}`,
        width: '20px',
        height: '20px'
      };
    }
    
    // Base color for cells
    const baseColor = theme.primary;
    
    // Calculate intensity based on points
    let intensity;
    if (points <= 2) intensity = 0.2;      // Lightest shade
    else if (points <= 4) intensity = 0.4;  // Light shade
    else if (points <= 8) intensity = 0.6;  // Medium shade
    else if (points <= 12) intensity = 0.8; // Dark shade
    else intensity = 1.0;                   // Darkest shade
    
    return {
      backgroundColor: baseColor,
      opacity: intensity,
      border: `1px solid ${baseColor}`,
      width: '20px',
      height: '20px',
      cursor: 'pointer'
    };
  };
  
  // Show details when a cell is clicked
  const renderDayDetails = () => {
    if (!selectedDay || !activityData[selectedDay]) return null;
    
    const dayStats = activityData[selectedDay];
    const statEntries = Object.entries(dayStats).filter(([_, points]) => points > 0);
    
    if (statEntries.length === 0) return null;
    
    const totalPoints = statEntries.reduce((sum, [_, points]) => sum + points, 0);
    
    return (
      <div className="card mt-4">
        <h4 className="font-bold mb-3">
          {new Date(selectedDay).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric',
            month: 'long', 
            day: 'numeric' 
          })}
        </h4>
        
        <div className="mb-3">
          <div className="text-sm opacity-70">Total Points</div>
          <div className="text-xl font-bold">{totalPoints}</div>
        </div>
        
        <div>
          <div className="text-sm opacity-70 mb-2">Stats Breakdown</div>
          <div className="flex flex-wrap gap-2">
            {statEntries.map(([stat, points]) => {
              const statInfo = STATS.find(s => s.id === stat);
              const statName = statInfo ? statInfo.name : stat;
              
              return (
                <div 
                  key={stat}
                  className="px-2 py-1 rounded-full text-sm"
                  style={{ 
                    backgroundColor: theme.primary,
                    color: 'white',
                  }}
                >
                  {statName}: +{points}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const days = getLast30Days();
  const statsList = STATS ? STATS.map(stat => stat.id) : Object.keys(rawStats);
  
  // Early return for no stats
  if (statsList.length === 0) {
    return (
      <div className="text-center py-8">
        <p>No stats data available yet.</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="overflow-x-auto">
        <table style={{ 
          borderCollapse: 'separate', 
          borderSpacing: '3px',
          width: '100%'
        }}>
          <thead>
            <tr>
              <th style={{ width: '120px', textAlign: 'right', padding: '0 8px' }}></th>
              {days.map((day, index) => (
                <th 
                  key={index} 
                  style={{ 
                    padding: '4px 0', 
                    fontSize: '0.75rem', 
                    fontWeight: 'normal',
                    opacity: 0.7,
                    width: '20px',
                    textAlign: 'center'
                  }}
                >
                  {index % 5 === 0 ? (
                    <div className="whitespace-nowrap">
                      <div>{day.toLocaleDateString('en-US', { month: 'short' })}</div>
                      <div>{day.getDate()}</div>
                    </div>
                  ) : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {statsList.map(stat => {
              const statInfo = STATS.find(s => s.id === stat);
              const statName = statInfo ? statInfo.name : stat;
              
              return (
                <tr key={stat}>
                  <td style={{ 
                    padding: '4px 8px', 
                    textAlign: 'right', 
                    fontWeight: '500',
                    fontSize: '0.875rem'
                  }}>
                    {statInfo && statInfo.icon ? <span style={{ marginRight: '4px' }}>{statInfo.icon}</span> : null}
                    {statName}
                  </td>
                  {days.map((day, index) => {
                    const dateKey = day.toISOString().split('T')[0];
                    const points = activityData[dateKey]?.[stat] || 0;
                    
                    return (
                      <td 
                        key={index}
                        onClick={() => setSelectedDay(dateKey)}
                        title={`${statName}: ${points} points on ${formatDate(day)}`}
                        style={{
                          padding: 0
                        }}
                      >
                        <div style={getCellStyle(points)}></div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-end items-center my-3">
        <span className="text-xs opacity-70">Fewer</span>
        <div className="flex mx-2">
          {[0.2, 0.4, 0.6, 0.8, 1].map((opacity, i) => (
            <div 
              key={i}
              style={{
                width: '14px',
                height: '14px',
                backgroundColor: theme.primary,
                opacity: opacity,
                marginLeft: i > 0 ? '4px' : 0,
                border: `1px solid ${theme.border}`,
                borderRadius: '2px'
              }}
            ></div>
          ))}
        </div>
        <span className="text-xs opacity-70">More</span>
      </div>
      
      {renderDayDetails()}
      
      <div className="card p-3 mt-4 bg-opacity-10" 
           style={{ backgroundColor: `${theme.primary}20`, borderColor: `${theme.primary}30` }}>
        <p className="text-sm">This grid shows your daily activity for each stat category over the past 30 days.</p>
        <p className="text-sm mt-1">Darker colors indicate more points earned on that day. Click on any cell to see details.</p>
      </div>
    </div>
  );
};

export default BasicStatGrid;