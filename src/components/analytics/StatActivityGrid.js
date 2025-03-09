import React, { useState, useEffect } from 'react';
import { useGame } from '../../contexts/GameContext';
import { useAnalyticsContext } from '../../contexts/AnalyticsContext';

/**
 * StatActivityGrid
 * 
 * A simplified activity grid that shows stat progress over time
 * using a basic grid layout with fixed styling.
 */
const StatActivityGrid = () => {
  const { taskHistory } = useGame();
  const { rawStats } = useAnalyticsContext();
  const [activityData, setActivityData] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);
  
  // Hardcoded colors for each stat to avoid theme import issues
  const statColors = {
    strength: '#ef4444',      // Red
    intelligence: '#3b82f6',  // Blue
    charisma: '#8b5cf6',      // Purple
    vitality: '#10b981',      // Green
    agility: '#f59e0b',       // Amber
    wisdom: '#6366f1',        // Indigo
    discipline: '#ec4899',    // Pink
    linguist: '#14b8a6',      // Teal
    stamina: '#f97316',       // Orange
    concentration: '#8b5cf6'  // Purple
  };
  
  // Get the last N days
  const getDays = (numDays = 30) => {
    const days = [];
    const today = new Date();
    
    for (let i = numDays - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      days.push(date);
    }
    
    return days;
  };
  
  // Format date for storage key
  const formatDateKey = (date) => {
    return date.toISOString().split('T')[0];
  };
  
  // Format date for display
  const formatDateDisplay = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Process task history data
  useEffect(() => {
    if (!taskHistory || !taskHistory.length) return;
    
    const data = {};
    
    // Process each task
    taskHistory.forEach(task => {
      if (!task.completedAt || !task.rewards || !task.rewards.stats) return;
      
      const date = new Date(task.completedAt);
      const dateKey = formatDateKey(date);
      
      if (!data[dateKey]) {
        data[dateKey] = {};
      }
      
      // Add stats points from task
      Object.entries(task.rewards.stats).forEach(([stat, points]) => {
        if (!data[dateKey][stat]) {
          data[dateKey][stat] = 0;
        }
        data[dateKey][stat] += points;
      });
    });
    
    setActivityData(data);
  }, [taskHistory]);
  
  // Get opacity based on points - using higher values for better visibility
  const getOpacity = (points) => {
    if (!points || points === 0) return 0.15; // Very light but visible
    if (points < 3) return 0.4;  // More visible for low points
    if (points < 6) return 0.65;
    if (points < 10) return 0.85;
    return 1;
  };
  
  // Get a specific color for each stat
  const getStatColor = (stat) => {
    return statColors[stat.toLowerCase()] || '#6366f1';
  };
  
  // Get cell background - ensure empty cells are visible
  const getCellBackground = (stat, points) => {
    const color = getStatColor(stat);
    const opacity = getOpacity(points);
    
    if (points === 0) {
      // For empty cells, use a light gray with border
      return {
        backgroundColor: 'rgba(200, 200, 200, 0.15)',
        border: '1px solid rgba(200, 200, 200, 0.3)'
      };
    }
    
    // For cells with data, use the stat color with opacity
    return {
      backgroundColor: color,
      opacity: opacity,
      border: `1px solid ${color}`
    };
  };
  
  // Render the day details when a cell is clicked
  const renderDayDetails = () => {
    if (!selectedDay || !activityData[selectedDay]) return null;
    
    const dayStats = activityData[selectedDay];
    const statEntries = Object.entries(dayStats).filter(([_, points]) => points > 0);
    
    if (statEntries.length === 0) return null;
    
    const totalPoints = statEntries.reduce((sum, [_, points]) => sum + points, 0);
    const date = new Date(selectedDay);
    
    return (
      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h4 className="font-medium mb-3 dark:text-white">
          {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </h4>
        
        <div className="mb-3">
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Points</div>
          <div className="text-xl font-bold dark:text-white">{totalPoints}</div>
        </div>
        
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Stats Breakdown</div>
          <div className="flex flex-wrap gap-2">
            {statEntries.map(([stat, points]) => (
              <div 
                key={stat}
                className="text-white text-sm px-2 py-1 rounded-full" 
                style={{ backgroundColor: getStatColor(stat) }}
              >
                {stat}: +{points}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  // Get days to display
  const days = getDays(30);
  const statsList = Object.keys(rawStats);
  
  return (
    <div className="w-full">
      <h3 className="text-lg font-medium mb-4 dark:text-white">Stat Activity Grid</h3>
      
      {/* Date labels */}
      <div className="flex mb-2 pl-24">
        {days.map((day, index) => (
          <div 
            key={index} 
            className="text-xs text-gray-500 dark:text-gray-400 w-8 flex-shrink-0 text-center overflow-visible"
            style={{ fontSize: '0.7rem' }}
          >
            {/* Show more date labels */}
            {(index % 5 === 0) && formatDateDisplay(day)}
          </div>
        ))}
      </div>
      
      {/* Activity grid */}
      <div className="mb-4">
        {statsList.map(stat => (
          <div key={stat} className="flex items-center mb-3">
            <div className="w-24 text-sm font-medium text-right pr-3 dark:text-white">{stat}</div>
            <div className="flex">
              {days.map((day, index) => {
                const dateKey = formatDateKey(day);
                const points = activityData[dateKey]?.[stat] || 0;
                
                return (
                  <div 
                    key={index}
                    className="w-8 h-8 flex-shrink-0 m-0.5 rounded cursor-pointer hover:transform hover:scale-110 transition-transform duration-200"
                    style={getCellBackground(stat, points)}
                    onClick={() => setSelectedDay(dateKey)}
                    title={`${stat}: ${points} points on ${formatDateDisplay(day)}`}
                  >
                    {/* Optional: Add text inside the cell for high values */}
                    {points >= 10 && (
                      <span className="flex items-center justify-center w-full h-full text-xs text-white font-bold">
                        {points}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex justify-end items-center mt-2 mb-4">
        <span className="text-xs text-gray-600 dark:text-gray-400">Fewer</span>
        <div className="flex mx-2">
          <div className="w-4 h-4 opacity-15 bg-blue-600 border border-gray-300 dark:border-gray-700 rounded-sm"></div>
          <div className="w-4 h-4 opacity-40 bg-blue-600 border border-gray-300 dark:border-gray-700 rounded-sm ml-1"></div>
          <div className="w-4 h-4 opacity-65 bg-blue-600 border border-gray-300 dark:border-gray-700 rounded-sm ml-1"></div>
          <div className="w-4 h-4 opacity-85 bg-blue-600 border border-gray-300 dark:border-gray-700 rounded-sm ml-1"></div>
          <div className="w-4 h-4 opacity-100 bg-blue-600 border border-gray-300 dark:border-gray-700 rounded-sm ml-1"></div>
        </div>
        <span className="text-xs text-gray-600 dark:text-gray-400">More</span>
      </div>
      
      {/* Selected day details */}
      {renderDayDetails()}
      
      {/* Info text */}
      <div className="text-sm text-gray-600 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800 mt-4">
        <p>This grid shows your daily activity for each stat category over the past 30 days.</p>
        <p className="mt-1">Darker colors indicate more points earned on that day. Click on any cell to see details.</p>
      </div>
    </div>
  );
};

export default StatActivityGrid;