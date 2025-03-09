import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useGame } from './GameContext';

// Create context
const AchievementContext = createContext();

// Custom hook to use the achievement context
export const useAchievement = () => useContext(AchievementContext);

/**
 * Define all achievements with their categories, titles, descriptions, 
 * icons, and criteria for unlocking
 */
const ACHIEVEMENTS = [
  // Streak Achievements
  {
    id: 'streak-3',
    category: 'Streak',
    title: 'Habit Former',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    criteria: (gameState) => gameState.streak.current >= 3,
    progressFn: (gameState) => ({
      current: Math.min(gameState.streak.current, 3),
      target: 3
    }),
  },
  {
    id: 'streak-7',
    category: 'Streak',
    title: 'Consistency is Key',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    criteria: (gameState) => gameState.streak.current >= 7,
    progressFn: (gameState) => ({
      current: Math.min(gameState.streak.current, 7),
      target: 7
    }),
  },
  {
    id: 'streak-14',
    category: 'Streak',
    title: 'Fortnight Warrior',
    description: 'Maintain a 14-day streak',
    icon: '🔥',
    criteria: (gameState) => gameState.streak.current >= 14,
    progressFn: (gameState) => ({
      current: Math.min(gameState.streak.current, 14),
      target: 14
    }),
  },
  {
    id: 'streak-30',
    category: 'Streak',
    title: 'Monthly Master',
    description: 'Maintain a 30-day streak',
    icon: '🔥',
    criteria: (gameState) => gameState.streak.current >= 30,
    progressFn: (gameState) => ({
      current: Math.min(gameState.streak.current, 30),
      target: 30
    }),
  },
  {
    id: 'streak-90',
    category: 'Streak',
    title: 'Quarterly Champion',
    description: 'Maintain a 90-day streak',
    icon: '🏆',
    criteria: (gameState) => gameState.streak.current >= 90,
    progressFn: (gameState) => ({
      current: Math.min(gameState.streak.current, 90),
      target: 90
    }),
  },
  
  // Overall Level Achievements
  {
    id: 'level-5',
    category: 'Level',
    title: 'Beginner\'s Growth',
    description: 'Reach overall level 5',
    icon: '⭐',
    criteria: (gameState) => {
      const totalLevel = Object.values(gameState.stats).reduce((sum, stat) => sum + stat.level, 0);
      return Math.floor(totalLevel / 6) >= 5;
    },
    progressFn: (gameState) => {
      const totalLevel = Object.values(gameState.stats).reduce((sum, stat) => sum + stat.level, 0);
      const currentLevel = Math.floor(totalLevel / 6);
      return {
        current: Math.min(currentLevel, 5),
        target: 5
      };
    },
  },
  {
    id: 'level-10',
    category: 'Level',
    title: 'Rising Star',
    description: 'Reach overall level 10',
    icon: '⭐',
    criteria: (gameState) => {
      const totalLevel = Object.values(gameState.stats).reduce((sum, stat) => sum + stat.level, 0);
      return Math.floor(totalLevel / 6) >= 10;
    },
    progressFn: (gameState) => {
      const totalLevel = Object.values(gameState.stats).reduce((sum, stat) => sum + stat.level, 0);
      const currentLevel = Math.floor(totalLevel / 6);
      return {
        current: Math.min(currentLevel, 10),
        target: 10
      };
    },
  },
  {
    id: 'level-25',
    category: 'Level',
    title: 'Dedicated Improver',
    description: 'Reach overall level 25',
    icon: '🌟',
    criteria: (gameState) => {
      const totalLevel = Object.values(gameState.stats).reduce((sum, stat) => sum + stat.level, 0);
      return Math.floor(totalLevel / 6) >= 25;
    },
    progressFn: (gameState) => {
      const totalLevel = Object.values(gameState.stats).reduce((sum, stat) => sum + stat.level, 0);
      const currentLevel = Math.floor(totalLevel / 6);
      return {
        current: Math.min(currentLevel, 25),
        target: 25
      };
    },
  },
  {
    id: 'level-50',
    category: 'Level',
    title: 'Transformation Master',
    description: 'Reach overall level 50',
    icon: '💫',
    criteria: (gameState) => {
      const totalLevel = Object.values(gameState.stats).reduce((sum, stat) => sum + stat.level, 0);
      return Math.floor(totalLevel / 6) >= 50;
    },
    progressFn: (gameState) => {
      const totalLevel = Object.values(gameState.stats).reduce((sum, stat) => sum + stat.level, 0);
      const currentLevel = Math.floor(totalLevel / 6);
      return {
        current: Math.min(currentLevel, 50),
        target: 50
      };
    },
  },
  
  // Task Completion Achievements
  {
    id: 'tasks-10',
    category: 'Tasks',
    title: 'Task Starter',
    description: 'Complete 10 tasks',
    icon: '✅',
    criteria: (gameState) => gameState.completedTasks.length >= 10,
    progressFn: (gameState) => ({
      current: Math.min(gameState.completedTasks.length, 10),
      target: 10
    }),
  },
  {
    id: 'tasks-50',
    category: 'Tasks',
    title: 'Task Enthusiast',
    description: 'Complete 50 tasks',
    icon: '✅',
    criteria: (gameState) => gameState.completedTasks.length >= 50,
    progressFn: (gameState) => ({
      current: Math.min(gameState.completedTasks.length, 50),
      target: 50
    }),
  },
  {
    id: 'tasks-100',
    category: 'Tasks',
    title: 'Task Master',
    description: 'Complete 100 tasks',
    icon: '🏅',
    criteria: (gameState) => gameState.completedTasks.length >= 100,
    progressFn: (gameState) => ({
      current: Math.min(gameState.completedTasks.length, 100),
      target: 100
    }),
  },
  {
    id: 'tasks-milestone-5',
    category: 'Tasks',
    title: 'Milestone Achiever',
    description: 'Complete 5 milestone tasks',
    icon: '🏆',
    criteria: (gameState) => {
      return gameState.completedTasks.filter(task => task.type === 'milestone').length >= 5;
    },
    progressFn: (gameState) => {
      const milestoneCount = gameState.completedTasks.filter(task => task.type === 'milestone').length;
      return {
        current: Math.min(milestoneCount, 5),
        target: 5
      };
    },
  },
  
  // Stat Specific Achievements
  {
    id: 'stat-discipline-10',
    category: 'Stats',
    title: 'Disciplined Mind',
    description: 'Reach level 10 in Discipline',
    icon: '📋',
    criteria: (gameState) => gameState.stats.discipline.level >= 10,
    progressFn: (gameState) => ({
      current: Math.min(gameState.stats.discipline.level, 10),
      target: 10
    }),
  },
  {
    id: 'stat-linguist-10',
    category: 'Stats',
    title: 'Word Weaver',
    description: 'Reach level 10 in Linguist',
    icon: '🗣️',
    criteria: (gameState) => gameState.stats.linguist.level >= 10,
    progressFn: (gameState) => ({
      current: Math.min(gameState.stats.linguist.level, 10),
      target: 10
    }),
  },
  {
    id: 'stat-stamina-10',
    category: 'Stats',
    title: 'Endurance Runner',
    description: 'Reach level 10 in Stamina',
    icon: '🏃',
    criteria: (gameState) => gameState.stats.stamina.level >= 10,
    progressFn: (gameState) => ({
      current: Math.min(gameState.stats.stamina.level, 10),
      target: 10
    }),
  },
  {
    id: 'stat-strength-10',
    category: 'Stats',
    title: 'Power Lifter',
    description: 'Reach level 10 in Strength',
    icon: '💪',
    criteria: (gameState) => gameState.stats.strength.level >= 10,
    progressFn: (gameState) => ({
      current: Math.min(gameState.stats.strength.level, 10),
      target: 10
    }),
  },
  {
    id: 'stat-intelligence-10',
    category: 'Stats',
    title: 'Knowledge Seeker',
    description: 'Reach level 10 in Intelligence',
    icon: '🧠',
    criteria: (gameState) => gameState.stats.intelligence.level >= 10,
    progressFn: (gameState) => ({
      current: Math.min(gameState.stats.intelligence.level, 10),
      target: 10
    }),
  },
  {
    id: 'stat-concentration-10',
    category: 'Stats',
    title: 'Focused Mind',
    description: 'Reach level 10 in Concentration',
    icon: '🧘',
    criteria: (gameState) => gameState.stats.concentration.level >= 10,
    progressFn: (gameState) => ({
      current: Math.min(gameState.stats.concentration.level, 10),
      target: 10
    }),
  },
  
  // Balance Achievement
  {
    id: 'balanced-stats-10',
    category: 'Stats',
    title: 'Jack of All Trades',
    description: 'Get all stats to at least level 10',
    icon: '⚖️',
    criteria: (gameState) => {
      return Object.values(gameState.stats).every(stat => stat.level >= 10);
    },
    progressFn: (gameState) => {
      const statsAtLeast10 = Object.values(gameState.stats).filter(stat => stat.level >= 10).length;
      return {
        current: statsAtLeast10,
        target: 6 // Number of stats
      };
    },
  },
];

// Initial state
const initialState = {
  unlockedAchievements: [],
  notifications: [],
  lastChecked: null,
};

// Reducer function
const achievementReducer = (state, action) => {
  switch (action.type) {
    case 'UNLOCK_ACHIEVEMENT':
      // Check if achievement is already unlocked
      if (state.unlockedAchievements.some(a => a.id === action.payload.id)) {
        return state;
      }
      
      return {
        ...state,
        unlockedAchievements: [...state.unlockedAchievements, {
          ...action.payload,
          unlockedAt: new Date().toISOString()
        }],
        notifications: [
          ...state.notifications,
          {
            id: Date.now().toString(),
            achievementId: action.payload.id,
            read: false,
            createdAt: new Date().toISOString()
          }
        ]
      };
      
    case 'CLEAR_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification.id !== action.payload
        )
      };
      
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? { ...notification, read: true }
            : notification
        )
      };
      
    case 'SET_LAST_CHECKED':
      return {
        ...state,
        lastChecked: action.payload
      };
      
    case 'IMPORT_ACHIEVEMENTS_STATE':
      return action.payload;
      
    default:
      return state;
  }
};

// Provider component
export const AchievementProvider = ({ children }) => {
  // Get game state
  const gameState = useGame();
  
  // Initialize achievement state from localStorage or use initialState
  const [state, dispatch] = useReducer(achievementReducer, initialState, () => {
    const savedState = localStorage.getItem('achievementsState');
    return savedState ? JSON.parse(savedState) : initialState;
  });
  
  // Save achievement state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('achievementsState', JSON.stringify(state));
  }, [state]);
  
  // Check for newly unlocked achievements whenever game state changes
  useEffect(() => {
    // Skip if gameState isn't available yet
    if (!gameState) return;
    
    // Set current time as last checked
    dispatch({ 
      type: 'SET_LAST_CHECKED', 
      payload: new Date().toISOString() 
    });
    
    // Check each achievement
    ACHIEVEMENTS.forEach(achievement => {
      // Skip if already unlocked
      if (state.unlockedAchievements.some(a => a.id === achievement.id)) {
        return;
      }
      
      // Check if criteria are met
      if (achievement.criteria(gameState)) {
        // Unlock the achievement
        dispatch({
          type: 'UNLOCK_ACHIEVEMENT',
          payload: achievement
        });
      }
    });
  }, [gameState, state.unlockedAchievements]);
  
  /**
   * Get all achievements with their unlock status and progress
   * @returns {Array} Array of achievement objects with status and progress information
   */
  const getAllAchievements = () => {
    return ACHIEVEMENTS.map(achievement => {
      const unlocked = state.unlockedAchievements.find(a => a.id === achievement.id);
      const progress = achievement.progressFn(gameState);
      
      return {
        ...achievement,
        unlocked: !!unlocked,
        unlockedAt: unlocked ? unlocked.unlockedAt : null,
        progress
      };
    });
  };
  
  /**
   * Get achievements grouped by category
   * @returns {Object} Object with category keys and arrays of achievements as values
   */
  const getAchievementsByCategory = () => {
    const achievements = getAllAchievements();
    return achievements.reduce((acc, achievement) => {
      if (!acc[achievement.category]) {
        acc[achievement.category] = [];
      }
      acc[achievement.category].push(achievement);
      return acc;
    }, {});
  };
  
  /**
   * Get unread notifications for newly unlocked achievements
   * @returns {Array} Array of notification objects
   */
  const getUnreadNotifications = () => {
    return state.notifications.filter(notification => !notification.read);
  };
  
  /**
   * Mark a notification as read
   * @param {string} notificationId - ID of the notification to mark as read
   */
  const markNotificationRead = (notificationId) => {
    dispatch({
      type: 'MARK_NOTIFICATION_READ',
      payload: notificationId
    });
  };
  
  /**
   * Clear a notification
   * @param {string} notificationId - ID of the notification to clear
   */
  const clearNotification = (notificationId) => {
    dispatch({
      type: 'CLEAR_NOTIFICATION',
      payload: notificationId
    });
  };
  
  // Create context value
  const value = {
    ...state,
    achievements: getAllAchievements(),
    achievementsByCategory: getAchievementsByCategory(),
    unreadNotifications: getUnreadNotifications(),
    markNotificationRead,
    clearNotification
  };
  
  return (
    <AchievementContext.Provider value={value}>
      {children}
    </AchievementContext.Provider>
  );
};
