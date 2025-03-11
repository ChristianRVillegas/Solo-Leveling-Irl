import { TITLES, TITLE_CATEGORIES } from './titleDefinitions';
import { db } from '../../firebase/config';
import { doc, getDoc, updateDoc, arrayUnion, setDoc } from 'firebase/firestore';

/**
 * Check if a user meets the requirements for a specific title
 * @param {object} gameState - The user's game state
 * @param {object} title - The title to check
 * @returns {boolean} True if requirements are met
 */
export const checkTitleRequirements = (gameState, title) => {
  const { requirements } = title;
  
  // Check stat-based requirements
  if (requirements.stat && requirements.level) {
    const stat = gameState.stats?.[requirements.stat];
    if (!stat || stat.level < requirements.level) {
      return false;
    }
  }
  
  // Check multi-stat requirements
  if (requirements.multistat) {
    if (requirements.allStats) {
      // Check if all stats meet the level requirement
      const allStats = ['discipline', 'linguist', 'stamina', 'strength', 'intelligence', 'concentration'];
      return allStats.every(statId => {
        const stat = gameState.stats?.[statId];
        return stat && stat.level >= requirements.level;
      });
    } else if (requirements.stats) {
      // Check if specific stats meet their level requirements
      return requirements.stats.every(statReq => {
        const stat = gameState.stats?.[statReq.stat];
        return stat && stat.level >= statReq.level;
      });
    }
  }
  
  // Check streak requirement
  if (requirements.streak) {
    return gameState.streak?.current >= requirements.streak;
  }
  
  // Check tasks completed requirement
  if (requirements.tasksCompleted) {
    return gameState.completedTasks?.length >= requirements.tasksCompleted;
  }
  
  // Check days active requirement
  if (requirements.daysActive) {
    // This would require tracking when the user account was created
    // For now, we'll count the number of days with completed tasks
    if (!gameState.completedTasks || gameState.completedTasks.length === 0) {
      return false;
    }
    
    const uniqueDates = new Set();
    gameState.completedTasks.forEach(task => {
      if (task.completedAt) {
        const date = new Date(task.completedAt).toDateString();
        uniqueDates.add(date);
      }
    });
    
    return uniqueDates.size >= requirements.daysActive;
  }
  
  // Check challenge-based requirements
  if (requirements.wonChallenge) {
    // This would require checking challenge history
    // This would be implemented when connecting to the challenges system
    return false;
  }
  
  return false;
};

/**
 * Check all titles and return those that the user has earned
 * @param {object} gameState - The user's game state
 * @returns {array} Array of earned title objects
 */
export const checkAllTitles = (gameState) => {
  return TITLES.filter(title => checkTitleRequirements(gameState, title));
};

/**
 * Award a title to a user
 * @param {string} userId - The user ID
 * @param {string} titleId - The title ID to award
 * @returns {Promise} Promise that resolves when the title is awarded
 */
export const awardTitle = async (userId, titleId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const userTitles = userData.titles || [];
      
      // Check if the user already has this title
      if (!userTitles.includes(titleId)) {
        await updateDoc(userRef, {
          titles: arrayUnion(titleId)
        });
      }
    } else {
      // Create user document if it doesn't exist
      await setDoc(userRef, {
        titles: [titleId]
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error awarding title:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Select a title to display on the user's profile
 * @param {string} userId - The user ID
 * @param {string} titleId - The title ID to select
 * @returns {Promise} Promise that resolves when the title is selected
 */
export const selectTitle = async (userId, titleId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const userTitles = userData.titles || [];
      
      // Verify the user has this title
      if (!userTitles.includes(titleId)) {
        return { success: false, error: 'You do not have this title' };
      }
      
      await updateDoc(userRef, {
        selectedTitle: titleId
      });
      
      return { success: true };
    } else {
      return { success: false, error: 'User data not found' };
    }
  } catch (error) {
    console.error('Error selecting title:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Remove the selected title from the user's profile
 * @param {string} userId - The user ID
 * @returns {Promise} Promise that resolves when the title is removed
 */
export const removeSelectedTitle = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      selectedTitle: null
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error removing title:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get a user's titles
 * @param {string} userId - The user ID
 * @returns {Promise} Promise that resolves with the user's titles
 */
export const getUserTitles = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        success: true,
        titles: userData.titles || [],
        selectedTitle: userData.selectedTitle || null
      };
    } else {
      return { success: true, titles: [], selectedTitle: null };
    }
  } catch (error) {
    console.error('Error getting user titles:', error);
    return { success: false, error: error.message, titles: [], selectedTitle: null };
  }
};

/**
 * Check if a user has earned new titles
 * @param {string} userId - The user ID
 * @param {object} gameState - The user's game state
 * @returns {Promise} Promise that resolves with newly earned titles
 */
export const checkForNewTitles = async (userId, gameState) => {
  try {
    // Get current user titles
    const { titles: currentTitles } = await getUserTitles(userId);
    
    // Check for earned titles
    const earnedTitles = checkAllTitles(gameState);
    
    // Filter for new titles
    const newTitles = earnedTitles.filter(title => !currentTitles.includes(title.id));
    
    // Award new titles
    for (const title of newTitles) {
      await awardTitle(userId, title.id);
    }
    
    return { success: true, newTitles };
  } catch (error) {
    console.error('Error checking for new titles:', error);
    return { success: false, error: error.message, newTitles: [] };
  }
};
