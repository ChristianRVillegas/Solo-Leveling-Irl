import React, { createContext, useContext, useState, useEffect } from 'react';
import { useGame } from './GameContext';
import { useTask } from './TaskContext';
import { useAchievement } from './AchievementContext';

// Create Analytics Context
const AnalyticsContext = createContext();

// Custom hook for using the Analytics Context
export const useAnalyticsContext = () => useContext(AnalyticsContext);

// Analytics Provider Component
export const AnalyticsProvider = ({ children }) => {
  // Access data from other contexts
  const { stats, taskHistory, LEVELS, getPointsToNextLevel } = useGame();
  const { tasks, completedTasks } = useTask();
  const { achievements, unlockedAchievements } = useAchievement();
  
  // Calculate total points for each stat (converting levels to points)
  const calculateTotalPoints = (statLevel, currentPoints) => {
    let totalPoints = currentPoints;
    
    // Add points for each completed level
    for (let level = 1; level < statLevel; level++) {
      totalPoints += getPointsToNextLevel(level);
    }
    
    return totalPoints;
  };
  
  // Get raw stat points
  const rawStats = {};
  Object.entries(stats).forEach(([statId, statData]) => {
    rawStats[statId] = calculateTotalPoints(statData.level, statData.points);
  });
  
  // State for analytics data
  const [activityPatterns, setActivityPatterns] = useState({});
  const [statCorrelations, setStatCorrelations] = useState([]);
  const [weeklyProgress, setWeeklyProgress] = useState({});
  const [monthlyProgress, setMonthlyProgress] = useState({});
  const [goalProgress, setGoalProgress] = useState([]);
  const [insights, setInsights] = useState([]);
  
  // Helper function to convert date to local timezone key
  const formatDateToLocalKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Helper function to safely extract points from various task formats
  const extractTaskPoints = (task, statType) => {
    // Direct statId and points format
    if (task.statId === statType && (task.points || task.points === 0)) {
      return task.points;
    }
    
    // Rewards.stats format
    if (task.rewards && task.rewards.stats && 
        (task.rewards.stats[statType] || task.rewards.stats[statType] === 0)) {
      return task.rewards.stats[statType];
    }
    
    return 0; // Default if no points found
  };
  
  // Calculate activity patterns (most active times/days)
  useEffect(() => {
    if (!taskHistory || taskHistory.length === 0) return;
    
    // Initialize patterns object
    const patterns = {
      byDay: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }, // Sunday to Saturday
      byHour: Array(24).fill(0).reduce((acc, _, idx) => ({...acc, [idx]: 0}), {}),
      byWeek: {},
      byMonth: {},
    };
    
    // Process task history
    taskHistory.forEach(task => {
      const date = new Date(task.completedAt);
      
      // By day of week
      patterns.byDay[date.getDay()]++;
      
      // By hour
      patterns.byHour[date.getHours()]++;
      
      // By week (ISO week number)
      const weekNumber = getWeekNumber(date);
      const weekKey = `${date.getFullYear()}-W${weekNumber}`;
      patterns.byWeek[weekKey] = (patterns.byWeek[weekKey] || 0) + 1;
      
      // By month
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      patterns.byMonth[monthKey] = (patterns.byMonth[monthKey] || 0) + 1;
    });
    
    setActivityPatterns(patterns);
  }, [taskHistory]);
  
  // Calculate stat correlations
  useEffect(() => {
    if (!taskHistory || taskHistory.length === 0) return;
    
    // Group task history by date (using local timezone)
    const tasksByDate = taskHistory.reduce((acc, task) => {
      // Skip tasks without completion date
      if (!task.completedAt) return acc;
      
      const dateKey = formatDateToLocalKey(new Date(task.completedAt));
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(task);
      return acc;
    }, {});
    
    // Calculate daily stat changes
    const dailyStatChanges = Object.keys(tasksByDate).map(date => {
      const dailyStats = { date };
      
      // Sum up stat changes for each stat type on this day
      tasksByDate[date].forEach(task => {
        // Process each stat type for this task
        Object.keys(stats).forEach(statType => {
          // Use the helper function to extract points
          const points = extractTaskPoints(task, statType);
          if (points !== 0) {
            dailyStats[statType] = (dailyStats[statType] || 0) + points;
          }
        });
      });
      
      return dailyStats;
    });
    
    // Calculate correlations between stats
    const statTypes = Object.keys(stats);
    const correlations = [];
    
    for (let i = 0; i < statTypes.length; i++) {
      for (let j = i + 1; j < statTypes.length; j++) {
        const statA = statTypes[i];
        const statB = statTypes[j];
        
        // Filter days where both stats were affected
        const relevantDays = dailyStatChanges.filter(day => 
          day[statA] !== undefined && day[statB] !== undefined
        );
        
        if (relevantDays.length > 3) { // Only calculate if we have enough data points
          const correlation = calculateCorrelation(
            relevantDays.map(day => day[statA]),
            relevantDays.map(day => day[statB])
          );
          
          correlations.push({
            statA,
            statB,
            correlation: parseFloat(correlation.toFixed(2)),
            strength: getCorrelationStrength(correlation),
            dataPoints: relevantDays.length,
          });
        }
      }
    }
    
    setStatCorrelations(correlations);
  }, [taskHistory, stats]);
  
  // Generate weekly and monthly progress reports
  useEffect(() => {
    if (!taskHistory || taskHistory.length === 0) return;
    
    // Weekly progress
    const weekly = {};
    // Monthly progress
    const monthly = {};
    
    // Current date for reference
    const now = new Date();
    
    // Process last 6 weeks
    for (let i = 0; i < 6; i++) {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() - (i * 7));
      const weekNumber = getWeekNumber(targetDate);
      const weekKey = `${targetDate.getFullYear()}-W${weekNumber}`;
      
      // Initialize weekly data
      weekly[weekKey] = {
        tasks: {
          completed: 0,
          total: 0,
        },
        stats: Object.keys(rawStats).reduce((acc, stat) => ({...acc, [stat]: 0}), {}),
        achievements: 0,
      };
    }
    
    // Process last 6 months
    for (let i = 0; i < 6; i++) {
      const targetDate = new Date(now);
      targetDate.setMonth(now.getMonth() - i);
      const monthKey = `${targetDate.getFullYear()}-${targetDate.getMonth() + 1}`;
      
      // Initialize monthly data
      monthly[monthKey] = {
        tasks: {
          completed: 0,
          total: 0,
        },
        stats: Object.keys(rawStats).reduce((acc, stat) => ({...acc, [stat]: 0}), {}),
        achievements: 0,
      };
    }
    
    // Process task history for stats
    taskHistory.forEach(task => {
      // Skip tasks without completion date
      if (!task.completedAt) return;
      
      const taskDate = new Date(task.completedAt);
      
      // Use local timezone for date calculations
      const dateKey = formatDateToLocalKey(taskDate);
      const weekNumber = getWeekNumber(taskDate);
      const weekKey = `${taskDate.getFullYear()}-W${weekNumber}`;
      const monthKey = `${taskDate.getFullYear()}-${taskDate.getMonth() + 1}`;
      
      // Update weekly data if the week exists in our report
      if (weekly[weekKey]) {
        weekly[weekKey].tasks.completed++;
        
        // Process each stat type using the helper function
        Object.keys(weekly[weekKey].stats).forEach(statType => {
          const points = extractTaskPoints(task, statType);
          if (points !== 0 && weekly[weekKey].stats[statType] !== undefined) {
            weekly[weekKey].stats[statType] += points;
          }
        });
      }
      
      // Update monthly data if the month exists in our report
      if (monthly[monthKey]) {
        monthly[monthKey].tasks.completed++;
        
        // Process each stat type using the helper function
        Object.keys(monthly[monthKey].stats).forEach(statType => {
          const points = extractTaskPoints(task, statType);
          if (points !== 0 && monthly[monthKey].stats[statType] !== undefined) {
            monthly[monthKey].stats[statType] += points;
          }
        });
      }
    });
    
    // Process achievement unlocks
    unlockedAchievements.forEach(achievement => {
      const unlockDate = new Date(achievement.unlockedAt);
      const weekNumber = getWeekNumber(unlockDate);
      const weekKey = `${unlockDate.getFullYear()}-W${weekNumber}`;
      const monthKey = `${unlockDate.getFullYear()}-${unlockDate.getMonth() + 1}`;
      
      if (weekly[weekKey]) {
        weekly[weekKey].achievements++;
      }
      
      if (monthly[monthKey]) {
        monthly[monthKey].achievements++;
      }
    });
    
    // Set the state
    setWeeklyProgress(weekly);
    setMonthlyProgress(monthly);
    
    // Generate insights based on the data
    generateInsights(weekly, monthly, activityPatterns, statCorrelations);
  }, [taskHistory, stats, unlockedAchievements, activityPatterns, statCorrelations]);
  
  // Generate insights from the analyzed data
  const generateInsights = (weekly, monthly, patterns, correlations) => {
    const newInsights = [];
    
    // Most productive day insight
    if (patterns && patterns.byDay) {
      const mostProductiveDay = Object.entries(patterns.byDay)
        .sort((a, b) => b[1] - a[1])[0];
      
      if (mostProductiveDay && mostProductiveDay[1] > 0) {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        newInsights.push({
          type: 'productivity',
          title: 'Most Productive Day',
          description: `${dayNames[mostProductiveDay[0]]} is your most productive day with ${mostProductiveDay[1]} completed tasks.`,
          icon: 'calendar',
        });
      }
    }
    
    // Most productive time insight
    if (patterns && patterns.byHour) {
      const mostProductiveHour = Object.entries(patterns.byHour)
        .sort((a, b) => b[1] - a[1])[0];
      
      if (mostProductiveHour && mostProductiveHour[1] > 0) {
        const hour = parseInt(mostProductiveHour[0]);
        const formattedHour = hour > 12 ? `${hour - 12} PM` : hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : `${hour} AM`;
        
        newInsights.push({
          type: 'productivity',
          title: 'Peak Productivity Hour',
          description: `You're most productive around ${formattedHour} with ${mostProductiveHour[1]} completed tasks.`,
          icon: 'clock',
        });
      }
    }
    
    // Strong correlation insights
    if (correlations && correlations.length) {
      const strongCorrelations = correlations.filter(c => 
        Math.abs(c.correlation) > 0.7 && c.dataPoints >= 5
      );
      
      strongCorrelations.forEach(corr => {
        const direction = corr.correlation > 0 ? 'positive' : 'negative';
        
        newInsights.push({
          type: 'correlation',
          title: `${corr.statA} & ${corr.statB} Connection`,
          description: `There's a strong ${direction} relationship between your ${corr.statA} and ${corr.statB} stats. ${direction === 'positive' ? 'As one increases, the other tends to increase too.' : 'As one increases, the other tends to decrease.'}`,
          icon: 'trending-up',
          correlation: corr,
        });
      });
    }
    
    // Weekly trend insights
    const weekKeys = Object.keys(weekly).sort();
    if (weekKeys.length >= 2) {
      const latestWeek = weekly[weekKeys[0]];
      const previousWeek = weekly[weekKeys[1]];
      
      // Task completion trend
      const taskDiff = latestWeek.tasks.completed - previousWeek.tasks.completed;
      const taskPercentChange = previousWeek.tasks.completed > 0 
        ? (taskDiff / previousWeek.tasks.completed) * 100 
        : 0;
      
      if (Math.abs(taskPercentChange) >= 20) {
        newInsights.push({
          type: 'trend',
          title: 'Weekly Task Trend',
          description: `You completed ${Math.abs(taskPercentChange).toFixed(0)}% ${taskDiff > 0 ? 'more' : 'fewer'} tasks this week compared to last week.`,
          icon: taskDiff > 0 ? 'trending-up' : 'trending-down',
          data: { current: latestWeek.tasks.completed, previous: previousWeek.tasks.completed }
        });
      }
      
      // Stat growth insights
      Object.keys(stats).forEach(statType => {
        const statDiff = latestWeek.stats[statType] - previousWeek.stats[statType];
        if (statDiff !== 0) {
          const growthRate = previousWeek.stats[statType] > 0 
            ? (statDiff / previousWeek.stats[statType]) * 100 
            : 0;
          
          if (Math.abs(growthRate) >= 25 || Math.abs(statDiff) >= 5) {
            newInsights.push({
              type: 'stat',
              title: `${statType} Development`,
              description: `Your ${statType} stat ${statDiff > 0 ? 'grew' : 'decreased'} by ${Math.abs(statDiff)} points this week${growthRate !== 0 ? ` (${Math.abs(growthRate).toFixed(0)}% ${statDiff > 0 ? 'increase' : 'decrease'})` : ''}.`,
              icon: statDiff > 0 ? 'arrow-up-circle' : 'arrow-down-circle',
              stat: statType,
              data: { current: latestWeek.stats[statType], previous: previousWeek.stats[statType] }
            });
          }
        }
      });
    }
    
    // Set the insights
    setInsights(newInsights);
  };
  
  // Helper function: Calculate Pearson correlation coefficient
  const calculateCorrelation = (arrayX, arrayY) => {
    const n = arrayX.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;
    let sumY2 = 0;
    
    for (let i = 0; i < n; i++) {
      sumX += arrayX[i];
      sumY += arrayY[i];
      sumXY += arrayX[i] * arrayY[i];
      sumX2 += arrayX[i] * arrayX[i];
      sumY2 += arrayY[i] * arrayY[i];
    }
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  };
  
  // Helper function: Get week number
  const getWeekNumber = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };
  
  // Helper function: Categorize correlation strength
  const getCorrelationStrength = (value) => {
    const absValue = Math.abs(value);
    if (absValue >= 0.8) return 'very strong';
    if (absValue >= 0.6) return 'strong';
    if (absValue >= 0.4) return 'moderate';
    if (absValue >= 0.2) return 'weak';
    return 'very weak';
  };
  
  // Helper: Format week key to readable date range
  const formatWeekKey = (weekKey) => {
    const [year, week] = weekKey.split('-W');
    // Calculate the start date of the week (Monday)
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dayOfWeek = simple.getDay();
    const weekStart = new Date(simple);
    weekStart.setDate(simple.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
    
    // Calculate the end date (Sunday)
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    // Format dates
    const startStr = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    return `${startStr} - ${endStr}`;
  };
  
  // Helper: Format month key to readable month
  const formatMonthKey = (monthKey) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };
  
  // Provide all analytics data and methods
  const value = {
    activityPatterns,
    statCorrelations,
    weeklyProgress,
    monthlyProgress,
    goalProgress,
    insights,
    rawStats,
    formatWeekKey,
    formatMonthKey,
  };
  
  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export default AnalyticsContext;