import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useAuth } from './AuthContext';
import { saveGameState, getGameState } from '../services/firestoreService';

// Game constants
const STATS = [
  {
    id: 'discipline',
    name: 'Discipline',
    description: 'Organization, routine adherence, mindful choices',
    icon: '📋'
  },
  {
    id: 'linguist',
    name: 'Linguist',
    description: 'Language learning, communication, writing',
    icon: '🗣️'
  },
  {
    id: 'stamina',
    name: 'Stamina',
    description: 'Cardio, endurance, energy management',
    icon: '🏃'
  },
  {
    id: 'strength',
    name: 'Strength',
    description: 'Physical power, resistance training',
    icon: '💪'
  },
  {
    id: 'intelligence',
    name: 'Intelligence',
    description: 'Learning, problem-solving, mental growth',
    icon: '🧠'
  },
  {
    id: 'concentration',
    name: 'Concentration',
    description: 'Focus, meditation, attention span',
    icon: '🧘'
  }
];

const TASK_TYPES = {
  SIMPLE: { id: 'simple', name: 'Simple Habit', points: 1, timeRequired: '5-15 min' },
  REGULAR: { id: 'regular', name: 'Regular Practice', points: 2, timeRequired: '15-30 min' },
  CHALLENGE: { id: 'challenge', name: 'Challenge', points: 3, timeRequired: '30-60 min' },
  MAJOR: { id: 'major', name: 'Major Effort', points: 5, timeRequired: '1+ hours' },
  MILESTONE: { id: 'milestone', name: 'Milestone', points: 8, timeRequired: 'Achievement' }
};

const LEVELS = [
  { range: [1, 10], pointsPerLevel: 10 },
  { range: [11, 20], pointsPerLevel: 15 },
  { range: [21, 30], pointsPerLevel: 25 },
  { range: [31, 40], pointsPerLevel: 40 },
  { range: [41, 50], pointsPerLevel: 60 },
  { range: [51, 60], pointsPerLevel: 85 },
  { range: [61, 70], pointsPerLevel: 115 },
  { range: [71, 80], pointsPerLevel: 150 },
  { range: [81, 90], pointsPerLevel: 190 },
  { range: [91, 100], pointsPerLevel: 250 }
];

const RANKS = [
  { name: 'Beginner', range: [0, 9] },
  { name: 'Novice', range: [10, 19] },
  { name: 'Apprentice', range: [20, 29] },
  { name: 'Adept', range: [30, 39] },
  { name: 'Expert', range: [40, 49] },
  { name: 'Master', range: [50, 59] },
  { name: 'Grandmaster', range: [60, 69] },
  { name: 'Legend', range: [70, 79] },
  { name: 'Mythic', range: [80, 89] },
  { name: 'Sovereign', range: [90, 99] },
  { name: 'Transcendent', range: [100, Infinity] }
];

const STREAK_BONUSES = [
  { range: [3, 7], bonus: 0.15 },
  { range: [8, 14], bonus: 0.20 },
  { range: [15, 30], bonus: 0.25 },
  { range: [31, Infinity], bonus: 0.30 }
];

// Initial state for a new player
const initialState = {
  playerName: 'Player',
  profilePicture: null,
  stats: STATS.reduce((acc, stat) => {
    acc[stat.id] = {
      level: 1,
      points: 0,
      lifetimePoints: 0,
      history: []
    };
    return acc;
  }, {}),
  tasks: [],
  completedTasks: [],
  streak: {
    current: 0,
    lastCompletionDate: null
  },
  taskHistory: []
};

// Utility functions
const getPointsToNextLevel = (level) => {
  for (const levelRange of LEVELS) {
    if (level >= levelRange.range[0] && level <= levelRange.range[1]) {
      return levelRange.pointsPerLevel;
    }
  }
  return LEVELS[LEVELS.length - 1].pointsPerLevel; // Default to highest level
};

const getRank = (level) => {
  for (const rank of RANKS) {
    if (level >= rank.range[0] && level <= rank.range[1]) {
      return rank.name;
    }
  }
  return RANKS[RANKS.length - 1].name; // Default to highest rank
};

const getStreakBonus = (streakDays) => {
  for (const bonus of STREAK_BONUSES) {
    if (streakDays >= bonus.range[0] && streakDays <= bonus.range[1]) {
      return bonus.bonus;
    }
  }
  return STREAK_BONUSES[STREAK_BONUSES.length - 1].bonus; // Default to highest bonus
};

// Reducer function
const gameReducer = (state, action) => {
  switch (action.type) {
    case 'SET_PLAYER_NAME':
      return {
        ...state,
        playerName: action.payload
      };
      
    case 'SET_PROFILE_PICTURE':
      return {
        ...state,
        profilePicture: action.payload
      };
      
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, {
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          ...action.payload
        }]
      };
      
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload)
      };
      
    case 'COMPLETE_TASK': {
      const { taskId } = action.payload;
      const task = state.tasks.find(t => t.id === taskId);
      
      if (!task) return state;
      
      const today = format(new Date(), 'yyyy-MM-dd');
      const lastDate = state.streak.lastCompletionDate;
      const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
      
      // Update streak
      let newStreak = state.streak.current;
      if (!lastDate) {
        newStreak = 1;
      } else if (lastDate === yesterday) {
        newStreak += 1;
      } else if (lastDate !== today) {
        newStreak = 1;
      }
      
      // Calculate bonus
      const streakBonus = getStreakBonus(newStreak);
      const bonusPoints = Math.floor(TASK_TYPES[task.type.toUpperCase()].points * streakBonus);
      const totalPoints = TASK_TYPES[task.type.toUpperCase()].points + bonusPoints;
      
      // Update stat
      const statState = state.stats[task.statId];
      let newPoints = statState.points + totalPoints;
      let newLevel = statState.level;
      let newLifetimePoints = (statState.lifetimePoints || 0) + totalPoints;
      
      // Level up if enough points
      const pointsToNextLevel = getPointsToNextLevel(newLevel);
      if (newPoints >= pointsToNextLevel) {
        newPoints -= pointsToNextLevel;
        newLevel += 1;
      }
      
      // Add completed task to history
      const completedTask = {
        ...task,
        completedAt: new Date().toISOString(),
        points: totalPoints,
        basePoints: TASK_TYPES[task.type.toUpperCase()].points,
        bonusPoints
      };
      
      return {
        ...state,
        stats: {
          ...state.stats,
          [task.statId]: {
            ...statState,
            points: newPoints,
            level: newLevel,
            lifetimePoints: newLifetimePoints,
            history: [...statState.history, {
              date: today,
              points: totalPoints,
              task: task.name
            }]
          }
        },
        tasks: state.tasks.filter(t => t.id !== taskId),
        completedTasks: [...state.completedTasks, completedTask],
        streak: {
          current: newStreak,
          lastCompletionDate: today
        },
        taskHistory: [...state.taskHistory, completedTask]
      };
    }
    
    case 'RESET_GAME':
      return initialState;
      
    case 'IMPORT_GAME_STATE':
      return action.payload;
      
    default:
      return state;
  }
};

// Create context
const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  
  // Load game state when user changes
  useEffect(() => {
    const loadGameState = async () => {
      if (currentUser) {
        console.log("Loading game state for user:", currentUser.uid);
        setLoading(true);
        setInitialLoad(true);
        
        try {
          const gameState = await getGameState(currentUser.uid);
          
          if (gameState) {
            console.log("Found Firestore game state for user", currentUser.uid, "Data:", JSON.stringify(gameState).substring(0, 100) + "...");
            
            // Verify the game state has valid data before using it
            let hasValidData = false;
            
            // Check if there's any non-initial task history
            if (gameState.taskHistory && gameState.taskHistory.length > 0) {
              hasValidData = true;
              console.log("Found valid task history with", gameState.taskHistory.length, "entries");
            }
            
            // Check if any stats have levels above 1 or points above 0
            if (gameState.stats) {
              Object.entries(gameState.stats).forEach(([statId, stat]) => {
                if (stat.level > 1 || stat.points > 0 || (stat.history && stat.history.length > 0)) {
                  hasValidData = true;
                  console.log(`Found valid stat data for ${statId}: level ${stat.level}, points ${stat.points}`);
                }
              });
            }
            
            // Check if migration is needed for lifetimePoints
            let needsMigration = false;
            if (gameState.stats) {
              Object.values(gameState.stats).forEach(stat => {
                if (stat.lifetimePoints === undefined) {
                  needsMigration = true;
                }
              });
            }
            
            // Perform migration if needed
            if (needsMigration) {
              console.log("Migrating data to include lifetimePoints");
              
              // Calculate lifetime points for all stats
              if (gameState.taskHistory && gameState.taskHistory.length > 0) {
                Object.keys(gameState.stats).forEach(statId => {
                  const statTasks = gameState.taskHistory.filter(task => task.statId === statId);
                  const totalPoints = statTasks.reduce((sum, task) => sum + (task.points || 0), 0);
                  
                  gameState.stats[statId].lifetimePoints = totalPoints;
                });
              } else {
                // If no task history, approximate based on levels
                Object.keys(gameState.stats).forEach(statId => {
                  const stat = gameState.stats[statId];
                  let approximateLifetimePoints = stat.points || 0;
                  
                  // Add points for each level achieved
                  for (let lvl = 1; lvl < stat.level; lvl++) {
                    approximateLifetimePoints += getPointsToNextLevel(lvl);
                  }
                  
                  gameState.stats[statId].lifetimePoints = approximateLifetimePoints;
                });
              }
              
              // Save the migrated data back to Firebase
              try {
                await saveGameState(currentUser.uid, gameState);
                console.log("Migrated game state saved to Firestore");
              } catch (error) {
                console.error('Error saving migrated game state:', error);
              }
            }
            
            if (hasValidData) {
              dispatch({
                type: 'IMPORT_GAME_STATE',
                payload: gameState
              });
            } else {
              console.warn("Found game state appears to be empty or reset - creating fresh state");
              const newUserState = {
                ...initialState,
                playerName: currentUser.displayName || currentUser.email.split('@')[0]
              };
              
              dispatch({
                type: 'IMPORT_GAME_STATE',
                payload: newUserState
              });
            }
          } else {
            console.log("No game state found for user, creating new one");
            // Only reset if we need to create new state
            dispatch({ type: 'RESET_GAME' });
            
            // Customize with display name
            const newUserState = {
              ...initialState,
              playerName: currentUser.displayName || currentUser.email.split('@')[0]
            };
            
            dispatch({
              type: 'IMPORT_GAME_STATE',
              payload: newUserState
            });
            
            // Create a new game state in Firestore
            await saveGameState(currentUser.uid, newUserState);
          }
        } catch (error) {
          console.error('Error loading game state from Firestore:', error);
          // Fallback to user-specific localStorage if Firestore fails
          const savedState = localStorage.getItem(`gameState_${currentUser.uid}`);
          if (savedState) {
            console.log("Using localStorage fallback for user", currentUser.uid);
            dispatch({
              type: 'IMPORT_GAME_STATE',
              payload: JSON.parse(savedState)
            });
          }
        } finally {
          setLoading(false);
          // Wait before allowing saves
          setTimeout(() => {
            setInitialLoad(false);
            console.log("Ready to save state changes");
          }, 1000);
        }
      } else {
        // Demo mode: If no user is logged in, use a demo state
        console.log("No user logged in, using demo mode");
        const demoState = localStorage.getItem('gameState_demo');
        if (demoState) {
          dispatch({
            type: 'IMPORT_GAME_STATE',
            payload: JSON.parse(demoState)
          });
        }
        setLoading(false);
        setInitialLoad(false);
      }
    };
    
    loadGameState();
  }, [currentUser]);
  
  // Save game state to Firestore whenever it changes
  useEffect(() => {
    const saveState = async () => {
      // Don't save during initial load or while loading
      if (initialLoad || loading) {
        console.log("Skipping save during loading phase");
        return;
      }
      
      if (currentUser) {
        // Check if state has any meaningful data before saving
        let hasData = false;
        
        // Check if there's any task history
        if (state.taskHistory && state.taskHistory.length > 0) {
          hasData = true;
        }
        
        // Check if any stats have non-zero values
        if (state.stats) {
          Object.values(state.stats).forEach(stat => {
            if (stat.level > 1 || stat.points > 0 || (stat.history && stat.history.length > 0)) {
              hasData = true;
            }
          });
        }
        
        // Save to user-specific localStorage as a backup
        localStorage.setItem(`gameState_${currentUser.uid}`, JSON.stringify(state));
        
        // Only save to Firestore if there's actual data
        if (hasData) {
          try {
            console.log("Saving state to Firestore, state sample:", JSON.stringify(state).substring(0, 100) + "...");
            await saveGameState(currentUser.uid, state);
            console.log("Game state saved to Firestore for user", currentUser.uid);
          } catch (error) {
            console.error('Error saving game state to Firestore:', error);
          }
        } else {
          console.log("Skipping save to Firestore - state appears to be empty");
        }
      } else if (!currentUser) {
        // Save to demo storage if not logged in
        localStorage.setItem('gameState_demo', JSON.stringify(state));
      }
    };
    
    saveState();
  }, [state, currentUser, loading, initialLoad]);
  
  // Utilities for components
  const getOverallLevel = () => {
    const totalLevel = Object.values(state.stats).reduce((sum, stat) => sum + stat.level, 0);
    return Math.floor(totalLevel / STATS.length);
  };
  
  const getOverallRank = () => {
    return getRank(getOverallLevel());
  };
  
  const getTodaysTasks = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return state.completedTasks.filter(task => 
      format(new Date(task.completedAt), 'yyyy-MM-dd') === today
    );
  };
  
  const value = {
    ...state,
    dispatch,
    loading,
    STATS,
    TASK_TYPES,
    LEVELS,
    RANKS,
    STREAK_BONUSES,
    getPointsToNextLevel,
    getRank,
    getStreakBonus,
    getOverallLevel,
    getOverallRank,
    getTodaysTasks
  };
  
  // Show loading indicator when data is being loaded
  if (currentUser && loading) {
    return <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
        Loading your game data...
      </div>
      <div>Please wait while we fetch your progress</div>
    </div>;
  }
  
  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};