import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useGame } from './GameContext';
import { format, addDays, parseISO, isSameDay, startOfWeek, endOfWeek, isWithinInterval, isBefore } from 'date-fns';

// Create a context for the enhanced task system
const TaskContext = createContext();

// Custom hook to use the task context
export const useTask = () => useContext(TaskContext);

/**
 * Frequency options for recurring tasks
 */
export const FREQUENCY_TYPES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  SPECIFIC_DAYS: 'specificDays'
};

/**
 * Days of the week for specific day selection
 */
export const DAYS_OF_WEEK = [
  { id: 0, name: 'Sunday', shortName: 'Sun' },
  { id: 1, name: 'Monday', shortName: 'Mon' },
  { id: 2, name: 'Tuesday', shortName: 'Tue' },
  { id: 3, name: 'Wednesday', shortName: 'Wed' },
  { id: 4, name: 'Thursday', shortName: 'Thu' },
  { id: 5, name: 'Friday', shortName: 'Fri' },
  { id: 6, name: 'Saturday', shortName: 'Sat' }
];

/**
 * Template categories for task templates
 */
export const TEMPLATE_CATEGORIES = [
  { id: 'recommended', name: 'Recommended', icon: '⭐' },
  { id: 'favorites', name: 'Favorites', icon: '❤️' },
  { id: 'personal', name: 'Personal', icon: '👤' }
];

/**
 * Pre-defined task templates to get users started
 */
const DEFAULT_TEMPLATES = [
  // Discipline templates
  {
    id: 'template-discipline-1',
    name: 'Morning routine',
    statId: 'discipline',
    type: 'simple',
    category: 'recommended',
    isTemplate: true
  },
  {
    id: 'template-discipline-2',
    name: 'Deep clean workspace',
    statId: 'discipline',
    type: 'regular',
    category: 'recommended',
    isTemplate: true
  },
  {
    id: 'template-discipline-3',
    name: 'Weekly meal prep',
    statId: 'discipline',
    type: 'challenge',
    category: 'recommended',
    isTemplate: true
  },
  
  // Linguist templates
  {
    id: 'template-linguist-1',
    name: 'Language practice',
    statId: 'linguist',
    type: 'regular',
    category: 'recommended',
    isTemplate: true
  },
  {
    id: 'template-linguist-2',
    name: 'Read book chapter',
    statId: 'linguist',
    type: 'regular',
    category: 'recommended',
    isTemplate: true
  },
  {
    id: 'template-linguist-3',
    name: 'Journal writing',
    statId: 'linguist',
    type: 'simple',
    category: 'recommended',
    isTemplate: true
  },
  
  // Stamina templates
  {
    id: 'template-stamina-1',
    name: '15-minute walk',
    statId: 'stamina',
    type: 'simple',
    category: 'recommended',
    isTemplate: true
  },
  {
    id: 'template-stamina-2',
    name: '30-minute jog',
    statId: 'stamina',
    type: 'regular',
    category: 'recommended',
    isTemplate: true
  },
  {
    id: 'template-stamina-3',
    name: 'HIIT workout',
    statId: 'stamina',
    type: 'challenge',
    category: 'recommended',
    isTemplate: true
  },
  
  // Strength templates
  {
    id: 'template-strength-1',
    name: 'Quick stretching',
    statId: 'strength',
    type: 'simple',
    category: 'recommended',
    isTemplate: true
  },
  {
    id: 'template-strength-2',
    name: 'Bodyweight exercises',
    statId: 'strength',
    type: 'regular',
    category: 'recommended',
    isTemplate: true
  },
  {
    id: 'template-strength-3',
    name: 'Weightlifting session',
    statId: 'strength',
    type: 'challenge',
    category: 'recommended',
    isTemplate: true
  },
  
  // Agility templates
  {
    id: 'template-agility-1',
    name: 'Basic stretching routine',
    statId: 'agility',
    type: 'simple',
    category: 'recommended',
    isTemplate: true
  },
  {
    id: 'template-agility-2',
    name: 'Yoga session',
    statId: 'agility',
    type: 'regular',
    category: 'recommended',
    isTemplate: true
  },
  {
    id: 'template-agility-3',
    name: 'Balance practice',
    statId: 'agility',
    type: 'regular',
    category: 'recommended',
    isTemplate: true
  },
  {
    id: 'template-agility-4',
    name: 'Full mobility workout',
    statId: 'agility',
    type: 'challenge',
    category: 'recommended',
    isTemplate: true
  },
  
  // Intelligence templates
  {
    id: 'template-intelligence-1',
    name: 'Brain puzzle',
    statId: 'intelligence',
    type: 'simple',
    category: 'recommended',
    isTemplate: true
  },
  {
    id: 'template-intelligence-2',
    name: 'Study session',
    statId: 'intelligence',
    type: 'regular',
    category: 'recommended',
    isTemplate: true
  },
  {
    id: 'template-intelligence-3',
    name: 'Online course module',
    statId: 'intelligence',
    type: 'challenge',
    category: 'recommended',
    isTemplate: true
  },
  
  // Concentration templates
  {
    id: 'template-concentration-1',
    name: '5-minute meditation',
    statId: 'concentration',
    type: 'simple',
    category: 'recommended',
    isTemplate: true
  },
  {
    id: 'template-concentration-2',
    name: '25-minute focused work',
    statId: 'concentration',
    type: 'regular',
    category: 'recommended',
    isTemplate: true
  },
  {
    id: 'template-concentration-3',
    name: 'Deep work session',
    statId: 'concentration',
    type: 'challenge',
    category: 'recommended',
    isTemplate: true
  }
];

// Initial state
const initialState = {
  templates: DEFAULT_TEMPLATES,
  recurringTasks: [],
  scheduledTasks: []
};

/**
 * Reducer function to handle all task-related actions
 */
const taskReducer = (state, action) => {
  switch (action.type) {
    // Template management
    case 'ADD_TEMPLATE':
      return {
        ...state,
        templates: [...state.templates, {
          id: `template-${Date.now()}`,
          isTemplate: true,
          ...action.payload
        }]
      };
      
    case 'DELETE_TEMPLATE':
      return {
        ...state,
        templates: state.templates.filter(template => template.id !== action.payload)
      };
      
    case 'UPDATE_TEMPLATE':
      return {
        ...state,
        templates: state.templates.map(template => 
          template.id === action.payload.id ? { ...template, ...action.payload } : template
        )
      };
      
    // Recurring task management
    case 'ADD_RECURRING_TASK':
      return {
        ...state,
        recurringTasks: [...state.recurringTasks, {
          id: `recurring-${Date.now()}`,
          createdAt: new Date().toISOString(),
          lastGenerated: null,
          ...action.payload
        }]
      };
      
    case 'UPDATE_RECURRING_TASK':
      return {
        ...state,
        recurringTasks: state.recurringTasks.map(task => 
          task.id === action.payload.id ? { ...task, ...action.payload } : task
        )
      };
      
    case 'DELETE_RECURRING_TASK':
      return {
        ...state,
        recurringTasks: state.recurringTasks.filter(task => task.id !== action.payload)
      };
      
    case 'UPDATE_RECURRING_TASK_GENERATION':
      return {
        ...state,
        recurringTasks: state.recurringTasks.map(task => 
          task.id === action.payload.id ? 
            { ...task, lastGenerated: action.payload.date } : 
            task
        )
      };
      
    // Scheduled task management
    case 'ADD_SCHEDULED_TASK':
      return {
        ...state,
        scheduledTasks: [...state.scheduledTasks, {
          id: `scheduled-${Date.now()}`,
          createdAt: new Date().toISOString(),
          ...action.payload
        }]
      };
      
    case 'UPDATE_SCHEDULED_TASK':
      return {
        ...state,
        scheduledTasks: state.scheduledTasks.map(task => 
          task.id === action.payload.id ? { ...task, ...action.payload } : task
        )
      };
      
    case 'DELETE_SCHEDULED_TASK':
      return {
        ...state,
        scheduledTasks: state.scheduledTasks.filter(task => task.id !== action.payload)
      };
      
    case 'IMPORT_TASK_STATE':
      return action.payload;
      
    default:
      return state;
  }
};

export const TaskProvider = ({ children }) => {
  // Get game state to sync with
  const gameState = useGame();
  
  // Initialize state from localStorage or default
  const [state, dispatch] = useReducer(taskReducer, initialState, () => {
    const savedState = localStorage.getItem('taskState');
    return savedState ? JSON.parse(savedState) : initialState;
  });
  
  // Save state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('taskState', JSON.stringify(state));
  }, [state]);
  
  /**
   * Generate recurring tasks for the day if needed
   * This checks if any recurring tasks should be created for today
   */
  useEffect(() => {
    if (!gameState || !gameState.dispatch) return;
    
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    const dayOfWeek = today.getDay();
    
    // For each recurring task, check if we need to generate a new task
    state.recurringTasks.forEach(recurringTask => {
      // Skip if already generated today
      if (recurringTask.lastGenerated === todayStr) {
        return;
      }
      
      // Check frequency conditions
      let shouldGenerate = false;
      
      switch (recurringTask.frequency) {
        case FREQUENCY_TYPES.DAILY:
          shouldGenerate = true;
          break;
        
        case FREQUENCY_TYPES.WEEKLY:
          // If the day of week matches the recurrence day (or it's been more than a week)
          if (recurringTask.lastGenerated) {
            const lastGenDate = parseISO(recurringTask.lastGenerated);
            const daysSinceLastGen = Math.floor((today - lastGenDate) / (1000 * 60 * 60 * 24));
            shouldGenerate = daysSinceLastGen >= 7;
          } else {
            // First time - check if it's the right day of week
            shouldGenerate = recurringTask.frequencyConfig.dayOfWeek === dayOfWeek;
          }
          break;
        
        case FREQUENCY_TYPES.SPECIFIC_DAYS:
          // Check if today is one of the specified days
          shouldGenerate = recurringTask.frequencyConfig.daysOfWeek.includes(dayOfWeek);
          break;
          
        default:
          shouldGenerate = false;
      }
      
      if (shouldGenerate) {
        // Generate a new task in the game context
        gameState.dispatch({
          type: 'ADD_TASK',
          payload: {
            name: recurringTask.name,
            statId: recurringTask.statId,
            type: recurringTask.type,
            fromRecurring: recurringTask.id
          }
        });
        
        // Update the last generated date
        dispatch({
          type: 'UPDATE_RECURRING_TASK_GENERATION',
          payload: {
            id: recurringTask.id,
            date: todayStr
          }
        });
      }
    });
  }, [state.recurringTasks, gameState]);
  
  /**
   * Convert scheduled tasks to actual tasks when their scheduled date arrives
   */
  useEffect(() => {
    if (!gameState || !gameState.dispatch) return;
    
    const today = new Date();
    
    // Check for scheduled tasks that are due
    const dueTasks = state.scheduledTasks.filter(task => {
      const scheduledDate = parseISO(task.scheduledDate);
      return isSameDay(scheduledDate, today) || isBefore(scheduledDate, today);
    });
    
    // Add each due task to the game state and remove from scheduled
    dueTasks.forEach(task => {
      // Add to game tasks
      gameState.dispatch({
        type: 'ADD_TASK',
        payload: {
          name: task.name,
          statId: task.statId,
          type: task.type
        }
      });
      
      // Remove from scheduled tasks
      dispatch({
        type: 'DELETE_SCHEDULED_TASK',
        payload: task.id
      });
    });
  }, [state.scheduledTasks, gameState]);
  
  /**
   * Get task templates filtered by category
   * @param {string} category - Category to filter by, or 'all'
   * @returns {Array} Filtered templates
   */
  const getTemplatesByCategory = (category = 'all') => {
    if (category === 'all') {
      return state.templates;
    }
    return state.templates.filter(template => template.category === category);
  };
  
  /**
   * Get templates filtered by stat
   * @param {string} statId - Stat ID to filter by, or 'all'
   * @returns {Array} Filtered templates
   */
  const getTemplatesByStat = (statId = 'all') => {
    if (statId === 'all') {
      return state.templates;
    }
    return state.templates.filter(template => template.statId === statId);
  };
  
  /**
   * Get scheduled tasks for a specific date
   * @param {Date} date - Date to get tasks for
   * @returns {Array} Tasks scheduled for the date
   */
  const getTasksForDate = (date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    // Get scheduled tasks for this date
    const scheduledForDate = state.scheduledTasks.filter(task => {
      const taskDate = format(parseISO(task.scheduledDate), 'yyyy-MM-dd');
      return taskDate === formattedDate;
    });
    
    // Add recurring tasks that would trigger on this date
    const dayOfWeek = date.getDay();
    const recurringForDate = state.recurringTasks.filter(task => {
      switch (task.frequency) {
        case FREQUENCY_TYPES.DAILY:
          return true;
        case FREQUENCY_TYPES.WEEKLY:
          return task.frequencyConfig.dayOfWeek === dayOfWeek;
        case FREQUENCY_TYPES.SPECIFIC_DAYS:
          return task.frequencyConfig.daysOfWeek.includes(dayOfWeek);
        default:
          return false;
      }
    });
    
    return [...scheduledForDate, ...recurringForDate];
  };
  
  /**
   * Get tasks for a specific week
   * @param {Date} date - Date within the week
   * @returns {Object} Map of dates to tasks
   */
  const getTasksForWeek = (date) => {
    const weekStart = startOfWeek(date);
    const weekEnd = endOfWeek(date);
    
    // Initialize map with each day of the week
    const weekMap = {};
    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i);
      weekMap[format(day, 'yyyy-MM-dd')] = [];
    }
    
    // Add scheduled tasks
    state.scheduledTasks.forEach(task => {
      const taskDate = parseISO(task.scheduledDate);
      if (isWithinInterval(taskDate, { start: weekStart, end: weekEnd })) {
        const dateKey = format(taskDate, 'yyyy-MM-dd');
        weekMap[dateKey].push(task);
      }
    });
    
    // Add recurring tasks
    state.recurringTasks.forEach(task => {
      for (let i = 0; i < 7; i++) {
        const day = addDays(weekStart, i);
        const dayOfWeek = day.getDay();
        let shouldAdd = false;
        
        switch (task.frequency) {
          case FREQUENCY_TYPES.DAILY:
            shouldAdd = true;
            break;
          case FREQUENCY_TYPES.WEEKLY:
            shouldAdd = task.frequencyConfig.dayOfWeek === dayOfWeek;
            break;
          case FREQUENCY_TYPES.SPECIFIC_DAYS:
            shouldAdd = task.frequencyConfig.daysOfWeek.includes(dayOfWeek);
            break;
          default:
            shouldAdd = false;
        }
        
        if (shouldAdd) {
          const dateKey = format(day, 'yyyy-MM-dd');
          weekMap[dateKey].push(task);
        }
      }
    });
    
    return weekMap;
  };
  
  /**
   * Generate task suggestions based on user stats
   * Suggests tasks for stats that are lagging behind
   * @param {number} count - Number of suggestions to generate
   * @returns {Array} Suggested tasks
   */
  const getSuggestedTasks = (count = 3) => {
    if (!gameState || !gameState.stats) {
      return [];
    }
    
    // Find stats with the lowest levels
    const statLevels = Object.entries(gameState.stats).map(([id, data]) => ({
      id,
      level: data.level
    }));
    
    // Sort by level (ascending)
    statLevels.sort((a, b) => a.level - b.level);
    
    // Get templates for the lowest level stats
    const suggestions = [];
    const usedTemplateIds = new Set();
    
    // Start with recommended templates for lowest stats
    for (const statLevel of statLevels) {
      const statTemplates = state.templates.filter(t => 
        t.statId === statLevel.id && 
        t.category === 'recommended' && 
        !usedTemplateIds.has(t.id)
      );
      
      // Randomize selection within each stat
      const shuffled = [...statTemplates].sort(() => 0.5 - Math.random());
      
      // Add to suggestions
      for (const template of shuffled) {
        if (suggestions.length >= count) break;
        suggestions.push(template);
        usedTemplateIds.add(template.id);
      }
      
      if (suggestions.length >= count) break;
    }
    
    // If we still need more, add random templates
    if (suggestions.length < count) {
      const remaining = state.templates.filter(t => !usedTemplateIds.has(t.id));
      const shuffled = [...remaining].sort(() => 0.5 - Math.random());
      
      for (const template of shuffled) {
        if (suggestions.length >= count) break;
        suggestions.push(template);
      }
    }
    
    return suggestions;
  };
  
  /**
   * Save a task as a template
   * @param {Object} task - Task to save as template
   */
  const saveAsTemplate = (task) => {
    dispatch({
      type: 'ADD_TEMPLATE',
      payload: {
        name: task.name,
        statId: task.statId,
        type: task.type,
        category: 'personal'
      }
    });
  };
  
  // Create context value
  const value = {
    ...state,
    dispatch,
    getTemplatesByCategory,
    getTemplatesByStat,
    getTasksForDate,
    getTasksForWeek,
    getSuggestedTasks,
    saveAsTemplate,
    FREQUENCY_TYPES,
    DAYS_OF_WEEK,
    TEMPLATE_CATEGORIES
  };
  
  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};