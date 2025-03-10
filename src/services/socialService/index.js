import { db } from '../../firebase/config';
import { collection, query, where, getDocs, orderBy, limit, startAt, endAt, doc, setDoc, getDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove, Timestamp } from 'firebase/firestore';

/**
 * Search for users by display name
 * @param {string} searchQuery - The search query
 * @param {string} currentUserId - Current user's ID to exclude from results
 * @param {number} resultLimit - Maximum number of results to return
 * @returns {Promise<Array>} - Array of user objects
 */
export const searchUsers = async (searchQuery, currentUserId, resultLimit = 10) => {
  try {
    const searchQueryLower = searchQuery.toLowerCase();
    const usersRef = collection(db, 'gameStates');
    
    // For simplicity, just do a basic query to get all users
    // In a real implementation, you'd want to create a separate users collection
    // with searchable fields and proper indexing
    const usersSnapshot = await getDocs(usersRef);
    
    // Filter and transform results
    const results = [];
    
    usersSnapshot.forEach(doc => {
      // Skip current user
      if (doc.id === currentUserId) return;
      
      const data = doc.data();
      const playerName = data.playerName || '';
      
      // Filter by name contains search query (case insensitive)
      if (playerName.toLowerCase().includes(searchQueryLower)) {
        // Format the user data for the UI
        results.push({
          id: doc.id,
          displayName: playerName,
          profilePicture: data.profilePicture,
          level: data.stats ? 
            Math.floor(Object.values(data.stats).reduce((sum, stat) => sum + stat.level, 0) / 6) : 
            1,
          rank: getOverallRank(data)
        });
      }
    });
    
    // Sort by name and limit results
    return results
      .sort((a, b) => a.displayName.localeCompare(b.displayName))
      .slice(0, resultLimit);
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

/**
 * Send a friend request to another user
 * @param {string} senderId - ID of the user sending the request
 * @param {string} recipientId - ID of the user receiving the request
 * @returns {Promise<boolean>} - True if successful
 */
export const sendFriendRequest = async (senderId, recipientId) => {
  try {
    // In a production app, we'd use a transaction to ensure consistency
    // For now, simple document updates will suffice
    
    // Add to sender's outgoing requests
    const senderRef = doc(db, 'friends', senderId);
    const senderDoc = await getDoc(senderRef);
    
    if (senderDoc.exists()) {
      await updateDoc(senderRef, {
        sentRequests: arrayUnion({
          userId: recipientId,
          timestamp: Timestamp.now()
        })
      });
    } else {
      await setDoc(senderRef, {
        sentRequests: [{
          userId: recipientId,
          timestamp: Timestamp.now()
        }],
        pendingRequests: [],
        friends: []
      });
    }
    
    // Add to recipient's incoming requests
    const recipientRef = doc(db, 'friends', recipientId);
    const recipientDoc = await getDoc(recipientRef);
    
    if (recipientDoc.exists()) {
      await updateDoc(recipientRef, {
        pendingRequests: arrayUnion({
          userId: senderId,
          timestamp: Timestamp.now()
        })
      });
    } else {
      await setDoc(recipientRef, {
        sentRequests: [],
        pendingRequests: [{
          userId: senderId,
          timestamp: Timestamp.now()
        }],
        friends: []
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error sending friend request:', error);
    return false;
  }
};

/**
 * Get all friend requests for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of friend request objects
 */
export const getFriendRequests = async (userId) => {
  try {
    const docRef = doc(db, 'friends', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data().pendingRequests || [];
    }
    return [];
  } catch (error) {
    console.error('Error getting friend requests:', error);
    throw error;
  }
};

/**
 * Get all outgoing friend requests for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of sent friend request objects
 */
export const getSentRequests = async (userId) => {
  try {
    const docRef = doc(db, 'friends', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data().sentRequests || [];
    }
    return [];
  } catch (error) {
    console.error('Error getting sent requests:', error);
    throw error;
  }
};

/**
 * Get all friends for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of friend objects
 */
export const getFriends = async (userId) => {
  // This will be implemented later
  return [];
};

/**
 * Helper function to calculate overall rank based on game state
 * @param {Object} gameState - The user's game state
 * @returns {string} - Rank name
 */
const getOverallRank = (gameState) => {
  if (!gameState.stats) return 'Beginner';
  
  const totalLevel = Object.values(gameState.stats).reduce((sum, stat) => sum + stat.level, 0);
  const overallLevel = Math.floor(totalLevel / 6); // 6 is the number of stats
  
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
  
  for (const rank of RANKS) {
    if (overallLevel >= rank.range[0] && overallLevel <= rank.range[1]) {
      return rank.name;
    }
  }
  
  return RANKS[0].name; // Default to first rank if not found
};

export default {
  searchUsers,
  sendFriendRequest,
  getFriendRequests,
  getFriends
};
