import React, { useState, useEffect } from 'react';
import { useAnalyticsContext } from '../../contexts/AnalyticsContext';
import { useGame } from '../../contexts/GameContext';

/**
 * SimpleStatHeatmap Component - A simplified version to avoid rendering issues
 */
const SimpleStatHeatmap = () => {
  const { taskHistory } = useGame();
  const { rawStats } = useAnalyticsContext();
  const [heatmapData, setHeatmapData] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  
  // Process task history to get daily stat points
  useEffect(() => {
    if (!taskHistory || taskHistory.length === 0) return;
    
    const statsByDate = {};
    
    // Fill in data from task history
    taskHistory.forEach(task => {
      if (!task.completedAt || !task.rewards || !task.rewards.stats) return;
      
      const dateKey = new Date(task.completedAt).toISOString().split('T')[0];
      
      if (!statsByDate[dateKey]) {
        statsByDate[dateKey] = {};
      }
      
      Object.entries(task.rewards.stats).forEach(([stat, points]) => {
        if (!statsByDate[dateKey][stat]) {
          statsByDate[dateKey][stat] = 0;
        }
        statsByDate[dateKey][stat] += points;
      });
    });
    
    setHeatmapData(statsByDate);
  }, [taskHistory]);
  
  // Get stat colors
  const getStatColor = (stat) => {
    const colors = {
      strength: '#ef4444',
      intelligence: '#3b82f6',
      charisma: '#8b5cf6',
      vitality: '#10b981',
      agility: '#f59e0b',
      wisdom: '#6366f1',
    };
    
    return colors[stat.toLowerCase()] || '#6366f1';
  };
  
  // Format date
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Show details for selected date
  const renderDateDetails = () => {
    if (!selectedDate || !heatmapData[selectedDate]) return null;
    
    const dateData = heatmapData[selectedDate];
    
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="font-medium mb-3">{formatDate(selectedDate)}</h4>
        <div className="space-y-2">
          {Object.entries(dateData).map(([stat, points]) => (
            <div key={stat} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: getStatColor(stat) }}
              ></div>
              <span>{stat}: </span>
              <span className="font-medium ml-1">+{points} points</span>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Get dates for the last 30 days
  const getLast30Days = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  };
  
  const last30Days = getLast30Days();
  const statTypes = Object.keys(rawStats);
  
  if (statTypes.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>No stats data available yet.</p>
      </div>
    );
  }
  
  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-3">Stats Activity Heatmap</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-left">Stat</th>
              {last30Days.map((date, index) => (
                <th key={date} className="p-2 text-center">
                  {index % 7 === 0 ? formatDate(date).split(',')[0] : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {statTypes.map(stat => (
              <tr key={stat}>
                <td className="p-2 font-medium">{stat}</td>
                {last30Days.map(date => {
                  const points = heatmapData[date]?.[stat] || 0;
                  const opacity = points === 0 ? 0.1 : 
                                  points < 3 ? 0.3 : 
                                  points < 6 ? 0.6 : 
                                  points < 10 ? 0.8 : 1;
                  
                  return (
                    <td 
                      key={`${stat}-${date}`} 
                      className="p-1 text-center cursor-pointer"
                      onClick={() => setSelectedDate(date)}
                    >
                      <div 
                        className="w-6 h-6 mx-auto rounded"
                        style={{ 
                          backgroundColor: getStatColor(stat),
                          opacity: opacity
                        }}
                        title={`${stat}: ${points} points on ${formatDate(date)}`}
                      ></div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {renderDateDetails()}
      
      <div className="mt-4 text-sm text-gray-600">
        <p>This heatmap shows your daily activity for each stat category.</p>
        <p>Darker colors indicate more points earned on that day.</p>
        <p>Click on a cell to see details for that day.</p>
      </div>
    </div>
  );
};

export default SimpleStatHeatmap;