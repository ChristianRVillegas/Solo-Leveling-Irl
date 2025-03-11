import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useGame } from '../../../contexts/GameContext';
import { useFriend } from '../../../contexts/FriendContext';
import { db } from '../../../firebase/config';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  startAfter,
  doc,
  getDoc
} from 'firebase/firestore';
import { startOfWeek, endOfWeek, format } from 'date-fns';
import ProfilePicture from '../../../components/ProfilePicture';

const Leaderboard = () => {
  const { theme } = useTheme();
  const { currentUser } = useAuth();
  const { playerName, getOverallLevel, getOverallRank } = useGame();
  const { friends } = useFriend();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [timeFrame, setTimeFrame] = useState('weekly');
  
  // Get the start and end of the current week
  const startOfCurrentWeek = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
  const endOfCurrentWeek = endOfWeek(new Date(), { weekStartsOn: 1 }); // Sunday
  
  // Format dates for display
  const formattedDateRange = `${format(startOfCurrentWeek, 'MMM d')} - ${format(endOfCurrentWeek, 'MMM d')}`;
  
  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboardData = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Create an array of user IDs including current user and friends
        const friendIds = friends.map(friend => friend.userId);
        const userIds = [currentUser.uid, ...friendIds];
        
        // Array to hold user data
        const userData = [];
        
        // Fetch each user's game state
        for (const userId of userIds) {
          const gameStateRef = doc(db, 'gameStates', userId);
          const gameStateDoc = await getDoc(gameStateRef);
          
          if (gameStateDoc.exists()) {
            const gameState = gameStateDoc.data();
            
            // Calculate points earned this week
            let weeklyPoints = 0;
            if (gameState.completedTasks) {
              const weeklyTasks = gameState.completedTasks.filter(task => {
                const taskDate = new Date(task.completedAt);
                return taskDate >= startOfCurrentWeek && taskDate <= endOfCurrentWeek;
              });
              
              weeklyPoints = weeklyTasks.reduce((sum, task) => sum + (task.points || 0), 0);
            }
            
            // Calculate overall level
            const totalLevel = Object.values(gameState.stats || {}).reduce((sum, stat) => sum + stat.level, 0);
            const overallLevel = Math.floor(totalLevel / 6); // Assuming 6 stats
            
            // Determine rank
            const rank = determineRank(overallLevel);
            
            userData.push({
              userId,
              playerName: gameState.playerName || 'Unknown Player',
              profilePicture: gameState.profilePicture || null,
              weeklyPoints,
              overallLevel,
              rank,
              isCurrentUser: userId === currentUser.uid
            });
          }
        }
        
        // Sort by weekly points and assign position
        const sortedData = userData
          .sort((a, b) => b.weeklyPoints - a.weeklyPoints)
          .map((user, index) => ({ ...user, position: index + 1 }));
        
        setLeaderboardData(sortedData);
        
        // Find current user's rank
        const currentUserData = sortedData.find(user => user.userId === currentUser.uid);
        setCurrentUserRank(currentUserData?.position || null);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        setError('Failed to load leaderboard data');
        setLoading(false);
      }
    };
    
    fetchLeaderboardData();
  }, [currentUser, friends, timeFrame]);
  
  // Helper function to determine rank
  const determineRank = (level) => {
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
      if (level >= rank.range[0] && level <= rank.range[1]) {
        return rank.name;
      }
    }
    
    return RANKS[0].name;
  };
  
  if (loading) {
    return (
      <div className="animate-fade-in text-center p-lg">
        <div className="spinner"></div>
        <p className="mt-md">Loading leaderboard...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="card p-lg text-center">
        <p className="text-lg mb-md">Error: {error}</p>
        <button 
          className="btn btn-primary"
          onClick={() => window.location.reload()}
        >
          Refresh
        </button>
      </div>
    );
  }
  
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-md">
        <h2 className="text-2xl">Weekly Leaderboard</h2>
        <div className="text-sm opacity-70">
          {formattedDateRange}
        </div>
      </div>
      
      {/* Current User Rank Summary */}
      <div className="card mb-lg">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-md md:mb-0">
            <ProfilePicture
              size="medium"
              src={leaderboardData.find(u => u.isCurrentUser)?.profilePicture}
            />
            <div className="ml-md">
              <div className="font-bold">Your Ranking</div>
              <div className="text-sm opacity-70">Based on points earned this week</div>
            </div>
          </div>
          
          <div className="flex items-center gap-lg">
            <div className="text-center">
              <div className="text-sm opacity-70">Position</div>
              <div className="text-2xl font-bold" style={{ color: theme.primary }}>
                {currentUserRank !== null ? `#${currentUserRank}` : 'N/A'}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-sm opacity-70">Weekly Points</div>
              <div className="text-2xl font-bold">
                {leaderboardData.find(u => u.isCurrentUser)?.weeklyPoints || 0}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Leaderboard Table */}
      <div className="card">
        <h3 className="text-xl mb-md">Friends Ranking</h3>
        
        {leaderboardData.length > 0 ? (
          <div className="overflow-x-auto">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ 
                    textAlign: 'center', 
                    padding: 'var(--spacing-sm)', 
                    borderBottom: `1px solid ${theme.border}`,
                    width: '60px'
                  }}>Rank</th>
                  <th style={{ 
                    textAlign: 'left', 
                    padding: 'var(--spacing-sm)', 
                    borderBottom: `1px solid ${theme.border}`
                  }}>Player</th>
                  <th style={{ 
                    textAlign: 'center', 
                    padding: 'var(--spacing-sm)', 
                    borderBottom: `1px solid ${theme.border}`
                  }}>Level</th>
                  <th style={{ 
                    textAlign: 'right', 
                    padding: 'var(--spacing-sm)', 
                    borderBottom: `1px solid ${theme.border}`
                  }}>Points</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map(user => (
                  <tr 
                    key={user.userId}
                    style={{
                      backgroundColor: user.isCurrentUser ? 'rgba(99, 102, 241, 0.1)' : 'transparent'
                    }}
                  >
                    <td style={{ 
                      textAlign: 'center', 
                      padding: 'var(--spacing-sm)', 
                      borderBottom: `1px solid ${theme.border}`,
                      fontWeight: 'bold'
                    }}>
                      {user.position <= 3 ? (
                        <span style={{ fontSize: '1.25rem' }}>
                          {user.position === 1 ? '🥇' : user.position === 2 ? '🥈' : '🥉'}
                        </span>
                      ) : (
                        `#${user.position}`
                      )}
                    </td>
                    <td style={{ 
                      padding: 'var(--spacing-sm)', 
                      borderBottom: `1px solid ${theme.border}`
                    }}>
                      <div className="flex items-center">
                        <ProfilePicture
                          size="small"
                          src={user.profilePicture}
                        />
                        <div className="ml-sm">
                          <div className="font-bold">{user.playerName}</div>
                          <div className="text-xs opacity-70">Level {user.overallLevel} {user.rank}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ 
                      textAlign: 'center', 
                      padding: 'var(--spacing-sm)', 
                      borderBottom: `1px solid ${theme.border}`
                    }}>
                      {user.overallLevel}
                    </td>
                    <td style={{ 
                      textAlign: 'right', 
                      padding: 'var(--spacing-sm)', 
                      borderBottom: `1px solid ${theme.border}`,
                      fontWeight: 'bold',
                      color: user.position === 1 ? theme.primary : theme.text
                    }}>
                      {user.weeklyPoints}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center p-lg">
            <p>No leaderboard data available yet.</p>
            <p className="mt-sm text-sm opacity-70">
              Complete tasks to earn points and appear on the leaderboard!
            </p>
          </div>
        )}
        
        {/* Points Explanation */}
        <div className="mt-lg text-sm opacity-70">
          <p><strong>Note:</strong> Points are calculated from all tasks completed during the current week.</p>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;