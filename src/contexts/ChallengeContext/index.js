import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useGame } from '../GameContext';
import { useNotification } from '../NotificationContext';
import { db } from '../../firebase/config';
import { 
  doc, 
  collection, 
  getDoc, 
  getDocs, 
  onSnapshot,
  query, 
  where, 
  addDoc,
  updateDoc, 
  arrayUnion, 
  serverTimestamp,
  orderBy,
  limit,
  writeBatch,
  setDoc
} from 'firebase/firestore';

// Define challenge types
export const CHALLENGE_TYPES = {
  STREAK_COMPETITION: {
    id: 'streak_competition',
    name: 'Streak Competition',
    description: 'Compete to maintain the longest daily streak of completed tasks',
    icon: '🔥'
  },
  LEVEL_RACE: {
    id: 'level_race',
    name: 'Level Race',
    description: 'Race to reach a specific level in a stat first',
    icon: '🏁'
  },
  WEEKLY_LEADERBOARD: {
    id: 'weekly_leaderboard',
    name: 'Weekly Leaderboard',
    description: 'Compete for the most points earned in a week',
    icon: '🏆'
  }
};

// Define challenge statuses
export const CHALLENGE_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  DECLINED: 'declined',
  CANCELED: 'canceled'
};

// Create the context
const ChallengeContext = createContext();

// Custom hook to use the challenge context
export const useChallenge = () => useContext(ChallengeContext);

export const ChallengeProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const { playerName, STATS } = useGame();
  const { sendNotification } = useNotification();
  
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [pendingChallenges, setPendingChallenges] = useState([]);
  const [pastChallenges, setPastChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [titles, setTitles] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState(null);

  // Load challenge data when user changes
  useEffect(() => {
    if (!currentUser) {
      setActiveChallenges([]);
      setPendingChallenges([]);
      setPastChallenges([]);
      setTitles([]);
      setSelectedTitle(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Set up real-time listener for challenges
    const fetchChallenges = async () => {
      try {
        // Get challenges where user is participant
        const userChallengesQuery = query(
          collection(db, 'challenges'),
          where('participants', 'array-contains', currentUser.uid)
        );
        
        const unsubscribe = onSnapshot(userChallengesQuery, (snapshot) => {
          const challengesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          // Filter by status
          setActiveChallenges(challengesData.filter(c => c.status === CHALLENGE_STATUS.ACTIVE));
          setPendingChallenges(challengesData.filter(c => c.status === CHALLENGE_STATUS.PENDING && c.recipientId === currentUser.uid));
          setPastChallenges(challengesData.filter(c => 
            [CHALLENGE_STATUS.COMPLETED, CHALLENGE_STATUS.DECLINED, CHALLENGE_STATUS.CANCELED].includes(c.status)
          ));
          
          setLoading(false);
        }, (error) => {
          console.error('Error getting challenges:', error);
          setLoading(false);
        });
        
        // Get user titles
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setTitles(userData.titles || []);
          setSelectedTitle(userData.selectedTitle || null);
        }
        
        return unsubscribe;
      } catch (error) {
        console.error('Error fetching challenges:', error);
        setLoading(false);
      }
    };
    
    const unsubscribePromise = fetchChallenges();
    
    return () => {
      unsubscribePromise.then(unsubscribe => {
        if (unsubscribe) {
          unsubscribe();
        }
      });
    };
  }, [currentUser]);

  // Create a new challenge
  const createChallenge = async (recipientId, type, parameters) => {
    if (!currentUser) return { success: false, error: 'Not authenticated' };

    try {
      // Verify the recipient exists
      const recipientDoc = await getDoc(doc(db, 'gameStates', recipientId));
      
      if (!recipientDoc.exists()) {
        return { success: false, error: 'Recipient not found' };
      }
      
      const recipientData = recipientDoc.data();
      
      // Create the challenge
      const challengeData = {
        type,
        parameters,
        status: CHALLENGE_STATUS.PENDING,
        createdAt: serverTimestamp(),
        creatorId: currentUser.uid,
        creatorName: playerName,
        recipientId,
        recipientName: recipientData.playerName,
        participants: [currentUser.uid, recipientId],
        progress: {
          [currentUser.uid]: {
            startStats: {},
            currentStats: {},
            lastUpdated: serverTimestamp()
          },
          [recipientId]: {
            startStats: {},
            currentStats: {},
            lastUpdated: null
          }
        },
        winner: null,
        completedAt: null,
        title: null // The title that will be awarded
      };
      
      // Add specific fields based on challenge type
      if (type === CHALLENGE_TYPES.STREAK_COMPETITION.id) {
        challengeData.progress[currentUser.uid].streak = 0;
        challengeData.progress[recipientId].streak = 0;
        
        // Set title to be awarded
        challengeData.title = 'Streak Master';
      } else if (type === CHALLENGE_TYPES.LEVEL_RACE.id) {
        const { statId, targetLevel } = parameters;
        
        // Get the current stat levels
        const creatorStats = (await getDoc(doc(db, 'gameStates', currentUser.uid))).data().stats;
        
        challengeData.progress[currentUser.uid].startStats[statId] = creatorStats[statId].level;
        challengeData.progress[currentUser.uid].currentStats[statId] = creatorStats[statId].level;
        challengeData.progress[recipientId].startStats[statId] = recipientData.stats[statId].level;
        challengeData.progress[recipientId].currentStats[statId] = recipientData.stats[statId].level;
        
        // Set title to be awarded based on stat
        const gameStatsArray = STATS || [];
        const statInfo = gameStatsArray.find(s => s.id === statId);
        challengeData.title = `${statInfo ? statInfo.name : 'Stat'} Champion`;
      } else if (type === CHALLENGE_TYPES.WEEKLY_LEADERBOARD.id) {
        challengeData.progress[currentUser.uid].points = 0;
        challengeData.progress[recipientId].points = 0;
        challengeData.startDate = serverTimestamp();
        
        // Calculate end date (7 days from now)
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 7);
        challengeData.endDate = endDate;
        
        // Set title to be awarded
        challengeData.title = 'Weekly Champion';
      }
      
      // Add to Firestore
      const challengeRef = await addDoc(collection(db, 'challenges'), challengeData);
      
      // Send a notification to the recipient
      await sendNotification(recipientId, {
        type: 'challenge',
        title: 'New Challenge',
        message: `${playerName} has challenged you to a ${getChallengeTypeName(type)}!`,
        challengeId: challengeRef.id
      });
      
      return { success: true, challengeId: challengeRef.id };
    } catch (error) {
      console.error('Error creating challenge:', error);
      return { success: false, error: error.message };
    }
  };

  // Accept a challenge
  const acceptChallenge = async (challengeId) => {
    if (!currentUser) return { success: false, error: 'Not authenticated' };

    try {
      const challengeRef = doc(db, 'challenges', challengeId);
      const challengeDoc = await getDoc(challengeRef);
      
      if (!challengeDoc.exists()) {
        return { success: false, error: 'Challenge not found' };
      }
      
      const challenge = challengeDoc.data();
      
      // Verify the user is the recipient
      if (challenge.recipientId !== currentUser.uid) {
        return { success: false, error: 'Not authorized to accept this challenge' };
      }
      
      // Verify the challenge is pending
      if (challenge.status !== CHALLENGE_STATUS.PENDING) {
        return { success: false, error: 'Challenge is not pending' };
      }
      
      // Initialize progress stats for specific challenge types
      let updateData = {
        status: CHALLENGE_STATUS.ACTIVE,
        startedAt: serverTimestamp()
      };
      
      if (challenge.type === CHALLENGE_TYPES.LEVEL_RACE.id) {
        // Get the current stat levels for the recipient
        const { statId } = challenge.parameters;
        const recipientStats = (await getDoc(doc(db, 'gameStates', currentUser.uid))).data().stats;
        
        updateData[`progress.${currentUser.uid}.startStats.${statId}`] = recipientStats[statId].level;
        updateData[`progress.${currentUser.uid}.currentStats.${statId}`] = recipientStats[statId].level;
        updateData[`progress.${currentUser.uid}.lastUpdated`] = serverTimestamp();
      }
      
      // Update the challenge
      await updateDoc(challengeRef, updateData);
      
      // Send a notification to the creator
      await sendNotification(challenge.creatorId, {
        type: 'challenge',
        title: 'Challenge Accepted',
        message: `${playerName} has accepted your ${getChallengeTypeName(challenge.type)} challenge!`,
        challengeId
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error accepting challenge:', error);
      return { success: false, error: error.message };
    }
  };

  // Decline a challenge
  const declineChallenge = async (challengeId) => {
    if (!currentUser) return { success: false, error: 'Not authenticated' };

    try {
      const challengeRef = doc(db, 'challenges', challengeId);
      const challengeDoc = await getDoc(challengeRef);
      
      if (!challengeDoc.exists()) {
        return { success: false, error: 'Challenge not found' };
      }
      
      const challenge = challengeDoc.data();
      
      // Verify the user is the recipient
      if (challenge.recipientId !== currentUser.uid) {
        return { success: false, error: 'Not authorized to decline this challenge' };
      }
      
      // Verify the challenge is pending
      if (challenge.status !== CHALLENGE_STATUS.PENDING) {
        return { success: false, error: 'Challenge is not pending' };
      }
      
      // Update the challenge
      await updateDoc(challengeRef, {
        status: CHALLENGE_STATUS.DECLINED,
        declinedAt: serverTimestamp()
      });
      
      // Send a notification to the creator
      await sendNotification(challenge.creatorId, {
        type: 'challenge',
        title: 'Challenge Declined',
        message: `${playerName} has declined your ${getChallengeTypeName(challenge.type)} challenge.`,
        challengeId
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error declining challenge:', error);
      return { success: false, error: error.message };
    }
  };

  // Update challenge progress
  const updateChallengeProgress = async (challengeId, progressData) => {
    if (!currentUser) return { success: false, error: 'Not authenticated' };

    try {
      const challengeRef = doc(db, 'challenges', challengeId);
      const challengeDoc = await getDoc(challengeRef);
      
      if (!challengeDoc.exists()) {
        return { success: false, error: 'Challenge not found' };
      }
      
      const challenge = challengeDoc.data();
      
      // Verify the user is a participant
      if (!challenge.participants.includes(currentUser.uid)) {
        return { success: false, error: 'Not a participant in this challenge' };
      }
      
      // Verify the challenge is active
      if (challenge.status !== CHALLENGE_STATUS.ACTIVE) {
        return { success: false, error: 'Challenge is not active' };
      }
      
      // Update based on challenge type
      let updateData = {
        [`progress.${currentUser.uid}.lastUpdated`]: serverTimestamp()
      };
      
      if (challenge.type === CHALLENGE_TYPES.STREAK_COMPETITION.id) {
        updateData[`progress.${currentUser.uid}.streak`] = progressData.streak;
      } else if (challenge.type === CHALLENGE_TYPES.LEVEL_RACE.id) {
        const { statId } = challenge.parameters;
        updateData[`progress.${currentUser.uid}.currentStats.${statId}`] = progressData.level;
        
        // Check if the target level has been reached
        if (progressData.level >= challenge.parameters.targetLevel) {
          // This user has won
          updateData.status = CHALLENGE_STATUS.COMPLETED;
          updateData.winner = currentUser.uid;
          updateData.completedAt = serverTimestamp();
          
          // Award title to the winner
          await awardTitle(currentUser.uid, challenge.title);
          
          // Send notification to the opponent
          const opponentId = challenge.participants.find(id => id !== currentUser.uid);
          await sendNotification(opponentId, {
            type: 'challenge_result',
            title: 'Challenge Completed',
            message: `${playerName} has won the ${getChallengeTypeName(challenge.type)} challenge by reaching level ${progressData.level}!`,
            challengeId
          });
        }
      } else if (challenge.type === CHALLENGE_TYPES.WEEKLY_LEADERBOARD.id) {
        updateData[`progress.${currentUser.uid}.points`] = progressData.points;
        
        // Check if the challenge has ended
        const now = new Date();
        const endDate = challenge.endDate.toDate();
        
        if (now >= endDate) {
          // Determine the winner
          const opponent = challenge.participants.find(id => id !== currentUser.uid);
          const userPoints = progressData.points;
          const opponentPoints = challenge.progress[opponent].points;
          
          let winner;
          if (userPoints > opponentPoints) {
            winner = currentUser.uid;
          } else if (opponentPoints > userPoints) {
            winner = opponent;
          } else {
            // It's a tie, no winner
            winner = null;
          }
          
          updateData.status = CHALLENGE_STATUS.COMPLETED;
          updateData.winner = winner;
          updateData.completedAt = serverTimestamp();
          
          // Award title to the winner if there is one
          if (winner) {
            await awardTitle(winner, challenge.title);
            
            // Send notification to the opponent
            const loser = challenge.participants.find(id => id !== winner);
            const winnerName = winner === currentUser.uid ? playerName : challenge.creatorName;
            
            await sendNotification(loser, {
              type: 'challenge_result',
              title: 'Challenge Completed',
              message: `${winnerName} has won the ${getChallengeTypeName(challenge.type)} challenge with ${winner === currentUser.uid ? userPoints : opponentPoints} points!`,
              challengeId
            });
          } else {
            // It's a tie, notify both participants
            for (const participantId of challenge.participants) {
              if (participantId !== currentUser.uid) {
                await sendNotification(participantId, {
                  type: 'challenge_result',
                  title: 'Challenge Completed',
                  message: `The ${getChallengeTypeName(challenge.type)} challenge ended in a tie!`,
                  challengeId
                });
              }
            }
          }
        }
      }
      
      // Update the challenge
      await updateDoc(challengeRef, updateData);
      
      return { success: true };
    } catch (error) {
      console.error('Error updating challenge progress:', error);
      return { success: false, error: error.message };
    }
  };

  // Award a title to a user
  const awardTitle = async (userId, title) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userTitles = userData.titles || [];
        
        // Check if the user already has this title
        if (!userTitles.includes(title)) {
          await updateDoc(userRef, {
            titles: arrayUnion(title)
          });
          
          // Send notification about new title
          await sendNotification(userId, {
            type: 'title',
            title: 'New Title Earned',
            message: `You've earned the "${title}" title!`
          });
        }
      } else {
        // Create user document if it doesn't exist
        // Create a new document with an initial title
        const batch = writeBatch(db);
        batch.set(userRef, {
          titles: [title]
        });
        await batch.commit();
        
        // Send notification about new title
        await sendNotification(userId, {
          type: 'title',
          title: 'New Title Earned',
          message: `You've earned the "${title}" title!`
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error awarding title:', error);
      return { success: false, error: error.message };
    }
  };

  // Select a title to display
  const selectTitle = async (title) => {
    if (!currentUser) return { success: false, error: 'Not authenticated' };

    try {
      // Verify the user has this title
      if (!titles.includes(title)) {
        return { success: false, error: 'You do not have this title' };
      }
      
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        selectedTitle: title
      });
      
      setSelectedTitle(title);
      
      return { success: true };
    } catch (error) {
      console.error('Error selecting title:', error);
      return { success: false, error: error.message };
    }
  };

  // Remove selected title
  const removeTitle = async () => {
    if (!currentUser) return { success: false, error: 'Not authenticated' };

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        selectedTitle: null
      });
      
      setSelectedTitle(null);
      
      return { success: true };
    } catch (error) {
      console.error('Error removing title:', error);
      return { success: false, error: error.message };
    }
  };

  // Helper function to get challenge type name safely
  const getChallengeTypeName = (type) => {
    // Find the challenge type by ID
    for (const key in CHALLENGE_TYPES) {
      if (CHALLENGE_TYPES[key].id === type) {
        return CHALLENGE_TYPES[key].name;
      }
    }
    // Fallback
    return 'Challenge';
  };

  // Context value
  const value = {
    activeChallenges,
    pendingChallenges,
    pastChallenges,
    loading,
    titles,
    selectedTitle,
    CHALLENGE_TYPES,
    CHALLENGE_STATUS,
    createChallenge,
    acceptChallenge,
    declineChallenge,
    updateChallengeProgress,
    awardTitle,
    selectTitle,
    removeTitle
  };

  return (
    <ChallengeContext.Provider value={value}>
      {children}
    </ChallengeContext.Provider>
  );
};

export default ChallengeProvider;