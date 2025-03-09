import React, { useState, useEffect } from 'react';
import { useAnalyticsContext } from '../../contexts/AnalyticsContext';
import { useGame } from '../../contexts/GameContext';
import { RiInformationLine, RiCalendarLine, RiBarChartLine } from 'react-icons/ri';
import ColorTheme from '../../styles/ColorTheme';

/**
 * StatHeatmap Component
 * 
 * Creates a GitHub-like activity heatmap that shows daily stat progress
 * with color intensity indicating amount of points earned per stat type.
 * 
 * Each stat type has its own row with color-coded squares.
 */
const StatHeatmap = () => {
  const { taskHistory } = useGame();
  const { rawStats } = useAnalyticsContext();
  const [heatmapData, setHeatmapData] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [tooltipInfo, setTooltipInfo] = useState(null);
  
  // Number of days to display (limited to 60 for better visibility)
  const daysToShow = 60;
  
  // Generate dates for display (most recent daysToShow days)
  const getDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);
      dates.push(date);
    }
    
    return dates;
  };
  
  // Format date as YYYY-MM-DD for lookup
  const formatDateKey = (date) => {
    return date.toISOString().split('T')[0];
  };
  
  // Process task history to get daily stat points
  useEffect(() => {
    if (!taskHistory || taskHistory.length === 0) return;
    
    const statsByDate = {};
    const statTypes = Object.keys(rawStats);
    
    // Initialize with empty data for all dates and stats
    const dates = getDates();
    dates.forEach(date => {
      const dateKey = formatDateKey(date);
      statsByDate[dateKey] = {};
      
      statTypes.forEach(stat => {
        statsByDate[dateKey][stat] = 0;
      });
    });
    
    // Fill in actual data from task history
    taskHistory.forEach(task => {
      if (!task.completedAt || !task.rewards || !task.rewards.stats) return;
      
      const taskDate = new Date(task.completedAt);
      taskDate.setHours(0, 0, 0, 0);
      const dateKey = formatDateKey(taskDate);
      
      // Only include if date is within our display range
      if (statsByDate[dateKey]) {
        Object.entries(task.rewards.stats).forEach(([stat, points]) => {
          if (statsByDate[dateKey][stat] !== undefined) {
            statsByDate[dateKey][stat] += points;
          } else {
            statsByDate[dateKey][stat] = points;
          }
        });
      }
    });
    
    setHeatmapData(statsByDate);
  }, [taskHistory, rawStats]);
  
  // Format date for display
  const formatDateDisplay = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Determine cell color based on points
  const getCellColor = (stat, points) => {
    if (points === 0) return '#ebedf0'; // Empty cell color
    
    // Get base color for this stat
    const baseColor = ColorTheme.statColors[stat.toLowerCase()] || '#4f46e5';
    
    // Convert hex to RGB for opacity adjustments
    const hexToRgb = (hex) => {
      const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
      
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };
    
    const rgb = hexToRgb(baseColor);
    if (!rgb) return baseColor;
    
    // Calculate opacity based on points
    let opacity;
    if (points >= 10) opacity = 1.0;
    else if (points >= 6) opacity = 0.8;
    else if (points >= 3) opacity = 0.6;
    else opacity = 0.4;
    
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
  };
  
  // Render the date details panel when a cell is clicked
  const renderDateDetails = () => {
    if (!selectedDate || !heatmapData[selectedDate]) return null;
    
    const dateData = heatmapData[selectedDate];
    const formattedDate = formatDateDisplay(selectedDate);
    const statEntries = Object.entries(dateData).filter(([_, points]) => points > 0);
    const totalPoints = statEntries.reduce((sum, [_, points]) => sum + points, 0);
    
    if (totalPoints === 0) return null;
    
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="font-medium mb-3 flex items-center">
          <RiCalendarLine className="mr-2 h-5 w-5 text-gray-600" />
          {formattedDate} Summary
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-3 rounded shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500">Total Points</div>
            <div className="text-xl font-semibold">{totalPoints}</div>
          </div>
          
          {statEntries.length > 0 && (
            <div className="col-span-2 bg-white p-3 rounded shadow-sm border border-gray-100">
              <div className="text-sm text-gray-500 mb-2">Stats Breakdown</div>
              <div className="flex flex-wrap gap-2">
                {statEntries.map(([stat, points]) => (
                  <div 
                    key={stat} 
                    className="flex items-center px-2 py-1 rounded-full text-white text-sm"
                    style={{ backgroundColor: ColorTheme.statColors[stat.toLowerCase()] || '#4f46e5' }}
                  >
                    {stat}: +{points} pts
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Generate a tooltip for cell hover
  const renderTooltip = () => {
    if (!tooltipInfo) return null;
    
    const { date, stat, points, x, y } = tooltipInfo;
    
    return (
      <div 
        className="fixed bg-white px-3 py-2 rounded shadow-lg border border-gray-200 text-sm z-50"
        style={{ 
          left: `${x + 15}px`,
          top: `${y - 40}px`
        }}
      >
        <div className="font-medium">{formatDateDisplay(date)}</div>
        <div className="mt-1">
          <span className="font-medium">{stat}:</span> {points} points
        </div>
      </div>
    );
  };
  
  // If no data, show a message
  if (Object.keys(heatmapData).length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <RiInformationLine className="mx-auto mb-2 h-10 w-10" />
        <p>Not enough activity data available yet.</p>
        <p className="text-sm mt-2">Complete more tasks to see your stats heatmap!</p>
      </div>
    );
  }
  
  const dates = getDates();
  const statTypes = Object.keys(rawStats);
  
  return (
    <div className="pb-4">
      {/* Heading */}
      <h3 className="text-lg font-medium mb-3 flex items-center">
        <RiBarChartLine className="mr-2 h-5 w-5 text-gray-700" />
        Stats Activity Heatmap
      </h3>
      
      {/* Main heatmap container */}
      <div className="relative bg-white p-4 rounded-lg border border-gray-200 overflow-x-auto">
        {renderTooltip()}
        
        {/* Date labels */}
        <div className="flex ml-24 mb-2">
          {dates.map((date, idx) => {
            // Only show labels for 1st and 15th of month
            const day = date.getDate();
            const showLabel = day === 1 || day === 15;
            return (
              <div key={`date-${idx}`} className="w-6 mx-0.5 relative">
                {showLabel && (
                  <div className="absolute text-xs text-gray-500 whitespace-nowrap -top-6 left-0">
                    {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Heatmap grid */}
        <div className="mt-5">
          {statTypes.map(stat => (
            <div key={stat} className="flex items-center mb-4">
              <div className="w-24 text-sm font-medium text-right pr-2">{stat}</div>
              <div className="flex">
                {dates.map((date, idx) => {
                  const dateKey = formatDateKey(date);
                  const points = heatmapData[dateKey]?.[stat] || 0;
                  
                  return (
                    <div 
                      key={`${stat}-${idx}`}
                      className="w-6 h-6 mx-0.5 rounded border border-gray-200 cursor-pointer transition-transform hover:scale-110"
                      style={{ backgroundColor: getCellColor(stat, points) }}
                      onClick={() => setSelectedDate(dateKey)}
                      onMouseEnter={(e) => setTooltipInfo({
                        date: dateKey,
                        stat,
                        points,
                        x: e.clientX,
                        y: e.clientY
                      })}
                      onMouseLeave={() => setTooltipInfo(null)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div className="mt-3 flex justify-between items-center">
          <div className="text-xs text-gray-500">Click on a cell to see details for that day</div>
          
          <div className="flex items-center">
            <span className="text-xs text-gray-600 mr-2">Fewer</span>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-sm border border-gray-300 bg-gray-200"></div>
              <div className="w-3 h-3 ml-1 rounded-sm border border-gray-300 bg-indigo-200"></div>
              <div className="w-3 h-3 ml-1 rounded-sm border border-gray-300 bg-indigo-400"></div>
              <div className="w-3 h-3 ml-1 rounded-sm border border-gray-300 bg-indigo-600"></div>
              <div className="w-3 h-3 ml-1 rounded-sm border border-gray-300 bg-indigo-800"></div>
            </div>
            <span className="text-xs text-gray-600 ml-2">More</span>
          </div>
        </div>
      </div>
      
      {/* Selected date details panel */}
      {renderDateDetails()}
      
      {/* Info message */}
      <div className="mt-4 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
        <div className="flex items-start">
          <RiInformationLine className="h-5 w-5 mr-2 text-blue-500 mt-0.5" />
          <div>
            <p>This heatmap shows your daily activity for each stat category.</p>
            <p className="mt-1">Darker colors indicate more points earned on that day.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatHeatmap;