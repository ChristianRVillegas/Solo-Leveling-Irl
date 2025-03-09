import React, { useState, useEffect } from 'react';
import { useGame } from '../../contexts/GameContext';
import { useAnalyticsContext } from '../../contexts/AnalyticsContext';

/**
 * BasicStatGrid
 * 
 * A heat map visualization showing points earned from completed tasks by stat and day.
 * Uses a consistent blue color scheme with varying intensities based on point values.
 */
const BasicStatGrid = () => {
  const { taskHistory, STATS } = useGame();
  const { rawStats } = useAnalyticsContext();
  const [activityData, setActivityData] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);
  const [debugInfo, setDebugInfo] = useState({ 
    hasTaskHistory: false, 
    taskCount: 0,
    recentTasks: [],
    processedDates: {}
  });
  
  // Process task history data with improved debugging
  useEffect(() => {
    console.log("Raw task history:", taskHistory);
    
    // Ensure we have task history
    if (!taskHistory || !Array.isArray(taskHistory) || taskHistory.length === 0) {
      console.log("No task history found or empty array");
      setDebugInfo({
        hasTaskHistory: false,
        taskCount: 0,
        recentTasks: [],
        processedDates: {}
      });
      return;
    }
    
    console.log("Task history length:", taskHistory.length);
    
    const data = {};
    const recentTasksInfo = [];
    const processedDates = new Set();
    
    // DEBUG: Log a sample task to see its structure
    console.log("Sample task:", taskHistory[0]);
    
    // Process each task and count points by day and stat
    taskHistory.forEach((task, index) => {
      // Log the first few tasks for debugging
      if (index < 5) {
        console.log(`Task ${index}:`, task);
      }
      
      // Skip tasks without completion date
      if (!task.completedAt) {
        console.log(`Task ${index} has no completedAt date`);
        return;
      }
      
      // Format the date for consistent lookup
      const taskDate = new Date(task.completedAt);
      const dateKey = taskDate.toISOString().split('T')[0];
      console.log(`Processing task ${index} from date ${dateKey}`);
      
      // Add to processed dates
      processedDates.add(dateKey);
      
      // Add to recent tasks debug info
      if (recentTasksInfo.length < 5) {
        recentTasksInfo.push({
          id: task.id || `task_${index}`,
          name: task.name,
          completedAt: task.completedAt,
          dateKey: dateKey,
          statId: task.statId,
          points: task.points || 0
        });
      }
      
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
        console.log(`Added ${task.points} points to ${task.statId} on ${dateKey}`);
      }
    });
    
    console.log("Processed activity data:", data);
    console.log("Processed dates:", [...processedDates]);
    
    setActivityData(data);
    setDebugInfo({
      hasTaskHistory: true,
      taskCount: taskHistory.length,
      recentTasks: recentTasksInfo,
      processedDates: [...processedDates]
    });
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
        backgroundColor: '#374151', // Dark background for empty cells
        border: '1px solid #4B5563',  // Darker border
        width: '20px',
        height: '20px'
      };
    }
    
    // Base color for all cells - using the blue from the key
    const baseColor = '#60A5FA'; // Blue color used in the key
    
    // Calculate intensity based on points
    let intensity;
    if (points <= 2) intensity = 0.2;      // Lightest blue
    else if (points <= 4) intensity = 0.4;  // Light blue
    else if (points <= 8) intensity = 0.6;  // Medium blue
    else if (points <= 12) intensity = 0.8; // Dark blue
    else intensity = 1.0;                   // Darkest blue
    
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
      <div style={{ 
        marginTop: '20px', 
        padding: '16px', 
        backgroundColor: '#1F2937', 
        borderRadius: '8px',
        border: '1px solid #374151'
      }}>
        <h4 style={{ fontWeight: 'bold', marginBottom: '12px', color: '#E5E7EB' }}>
          {new Date(selectedDay).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric',
            month: 'long', 
            day: 'numeric' 
          })}
        </h4>
        
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>Total Points</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#E5E7EB' }}>{totalPoints}</div>
        </div>
        
        <div>
          <div style={{ fontSize: '0.875rem', color: '#9CA3AF', marginBottom: '8px' }}>Stats Breakdown</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {statEntries.map(([stat, points]) => {
              const statInfo = STATS.find(s => s.id === stat);
              const statName = statInfo ? statInfo.name : stat;
              
              return (
                <div 
                  key={stat}
                  style={{ 
                    backgroundColor: '#60A5FA', // Using consistent blue color
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '9999px',
                    fontSize: '0.875rem'
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
  
  // Render debug information
  const renderDebugInfo = () => {
    return (
      <div style={{
        marginTop: '20px',
        padding: '16px',
        backgroundColor: '#1F2937',
        borderRadius: '8px',
        border: '1px solid #374151',
        fontSize: '0.875rem',
        color: '#E5E7EB'
      }}>
        <h4 style={{ fontWeight: 'bold', marginBottom: '12px' }}>Debug Information</h4>
        
        <div style={{ marginBottom: '8px' }}>
          <div style={{ color: '#9CA3AF' }}>Task History Available:</div>
          <div>{debugInfo.hasTaskHistory ? 'Yes' : 'No'}</div>
        </div>
        
        <div style={{ marginBottom: '8px' }}>
          <div style={{ color: '#9CA3AF' }}>Number of Tasks:</div>
          <div>{debugInfo.taskCount}</div>
        </div>
        
        <div style={{ marginBottom: '8px' }}>
          <div style={{ color: '#9CA3AF' }}>Processed Dates:</div>
          <div>{Array.isArray(debugInfo.processedDates) ? JSON.stringify(debugInfo.processedDates) : 'None'}</div>
        </div>
        
        <div>
          <div style={{ color: '#9CA3AF', marginBottom: '4px' }}>Recent Tasks:</div>
          <pre style={{ 
            maxHeight: '200px', 
            overflow: 'auto',
            fontSize: '0.75rem',
            backgroundColor: '#111827',
            padding: '8px',
            borderRadius: '4px'
          }}>
            {JSON.stringify(debugInfo.recentTasks, null, 2)}
          </pre>
        </div>
        
        <div style={{ marginTop: '16px', color: '#9CA3AF' }}>
          <p>This grid shows points earned from completed tasks for each stat category.</p>
          <p>Each cell represents a day, and the color intensity shows how many points you earned that day for the corresponding stat.</p>
          <p>If you're not seeing any data, it may be because:</p>
          <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginTop: '8px' }}>
            <li>You haven't completed any tasks yet</li>
            <li>Your task history isn't being loaded correctly</li>
            <li>The tasks were completed outside the 30-day window shown</li>
          </ul>
        </div>
      </div>
    );
  };
  
  const days = getLast30Days();
  const statsList = STATS ? STATS.map(stat => stat.id) : Object.keys(rawStats);
  
  // Early return for no stats
  if (statsList.length === 0) {
    return (
      <div style={{ fontFamily: 'system-ui, sans-serif', color: '#E5E7EB', padding: '16px' }}>
        <p>No stats data available yet.</p>
      </div>
    );
  }
  
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#E5E7EB' }}>
      <h3 style={{ fontSize: '1.125rem', fontWeight: '500', marginBottom: '1rem' }}>
        Stat Activity Grid (Points Earned Daily)
      </h3>
      
      <div style={{ overflowX: 'auto' }}>
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
                    color: '#9CA3AF',
                    width: '20px',
                    textAlign: 'center'
                  }}
                >
                  {index % 5 === 0 ? (
                    <div style={{ whiteSpace: 'nowrap' }}>
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
                        <div 
                          style={getCellStyle(points)}
                        >
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        alignItems: 'center',
        margin: '12px 0'
      }}>
        <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Fewer</span>
        <div style={{ display: 'flex', margin: '0 8px' }}>
          {[0.2, 0.4, 0.6, 0.8, 1].map((opacity, i) => (
            <div 
              key={i}
              style={{
                width: '14px',
                height: '14px',
                backgroundColor: '#60A5FA',
                opacity: opacity,
                marginLeft: i > 0 ? '4px' : 0,
                border: '1px solid #4B5563',
                borderRadius: '2px'
              }}
            ></div>
          ))}
        </div>
        <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>More</span>
      </div>
      
      {renderDayDetails()}
      
      {/* Add debug information to help troubleshoot */}
      {renderDebugInfo()}
      
      <div style={{ 
        marginTop: '16px',
        padding: '12px',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        borderRadius: '8px',
        border: '1px solid rgba(37, 99, 235, 0.3)',
        fontSize: '0.875rem',
        color: '#93C5FD'
      }}>
        <p>This grid shows your daily activity for each stat category over the past 30 days.</p>
        <p style={{ marginTop: '4px' }}>Darker colors indicate more points earned on that day. Click on any cell to see details.</p>
      </div>
    </div>
  );
};

export default BasicStatGrid;