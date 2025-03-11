import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useFriend } from '../../contexts/FriendContext';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import ProfilePicture from '../../components/ProfilePicture';
import { useNavigate } from 'react-router-dom';

const FriendsList = () => {
  const { theme } = useTheme();
  const { currentUser } = useAuth();
  const { friends, removeFriend } = useFriend();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [friendsData, setFriendsData] = useState([]);
  const [selectedStat, setSelectedStat] = useState('all');

  useEffect(() => {
    const loadFriendsData = async () => {
      if (!friends || friends.length === 0) {
        setLoading(false);
        return;
      }
      
      try {
        const friendPromises = friends.map(async (friend) => {
          try {
            const userDocRef = doc(db, 'gameStates', friend.userId);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
              const userData = userDoc.data();
              
              // Calculate top stat
              let topStat = { id: null, level: 0 };
              if (userData.stats) {
                Object.entries(userData.stats).forEach(([statId, statData]) => {
                  if (statData.level > topStat.level) {
                    topStat = { id: statId, level: statData.level };
                  }
                });
              }
              
              return {
                id: friend.userId,
                friendSince: friend.friendSince,
                displayName: userData.playerName || 'Unknown User',
                profilePicture: userData.profilePicture,
                level: userData.stats ? 
                  Math.floor(Object.values(userData.stats).reduce((sum, stat) => sum + stat.level, 0) / 6) : 
                  1,
                rank: getOverallRank(userData),
                topStat: topStat.id
              };
            }
            return null;
          } catch (error) {
            console.error(`Error loading friend data ${friend.userId}:`, error);
            return null;
          }
        });

        const results = await Promise.all(friendPromises);
        setFriendsData(results.filter(Boolean));
        setLoading(false);
      } catch (error) {
        console.error('Error loading friends data:', error);
        setLoading(false);
      }
    };

    loadFriendsData();
  }, [friends]);
  
  // Helper function to calculate rank (copied from socialService)
  const getOverallRank = (gameState) => {
    if (!gameState.stats) return 'Beginner';
    
    const totalLevel = Object.values(gameState.stats).reduce((sum, stat) => sum + stat.level, 0);
    const overallLevel = Math.floor(totalLevel / 6);
    
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
    
    return RANKS[0].name;
  };

  const handleRemoveFriend = async (friendId) => {
    if (window.confirm('Are you sure you want to remove this friend?')) {
      const success = await removeFriend(friendId);
      // UI updates will be handled by context
    }
  };

  const statOptions = [
    { id: 'all', name: 'All Stats' },
    { id: 'discipline', name: 'Discipline', icon: '📋' },
    { id: 'linguist', name: 'Linguist', icon: '🗣️' },
    { id: 'stamina', name: 'Stamina', icon: '🏃' },
    { id: 'strength', name: 'Strength', icon: '💪' },
    { id: 'intelligence', name: 'Intelligence', icon: '🧠' },
    { id: 'concentration', name: 'Concentration', icon: '🧘' }
  ];

  const filteredFriends = selectedStat === 'all' 
    ? friendsData 
    : friendsData.filter(friend => friend.topStat === selectedStat);

  if (loading) {
    return (
      <div className="card p-lg flex justify-center items-center">
        <div>Loading friends...</div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-md">
        <h3 className="text-xl">Your Friends</h3>
        
        <select
          value={selectedStat}
          onChange={(e) => setSelectedStat(e.target.value)}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            color: theme.text,
            border: `1px solid ${theme.border}`,
            borderRadius: 'var(--border-radius-md)',
            padding: '6px 12px'
          }}
        >
          {statOptions.map(option => (
            <option key={option.id} value={option.id}>
              {option.icon ? option.icon + ' ' : ''}{option.name}
            </option>
          ))}
        </select>
      </div>
      
      {friendsData.length > 0 ? (
        <div className="card">
          <div className="space-y-md">
            {filteredFriends.map(friend => (
              <div
                key={`friend-${friend.id}`}
                className="flex items-center justify-between p-md"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 'var(--border-radius-md)',
                }}
              >
                <div 
                  className="flex items-center cursor-pointer" 
                  onClick={() => navigate(`/social/friend/${friend.id}`)}
                >
                  <ProfilePicture 
                    size="medium"
                    src={friend.profilePicture}
                  />
                  <div className="ml-md">
                    <h4 className="font-semibold">{friend.displayName}</h4>
                    <p className="text-sm opacity-70">Level {friend.level} {friend.rank}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-md">
                  <div style={{ textAlign: 'right' }}>
                    {friend.topStat && (
                      <div className="text-sm">
                        Top Stat: <span style={{ fontWeight: 'bold' }}>{
                          statOptions.find(opt => opt.id === friend.topStat)?.name || 'Unknown'
                        }</span>
                      </div>
                    )}
                    <div className="text-xs" style={{ opacity: 0.7 }}>
                      Friends since {new Date(friend.friendSince).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <button
                    className="btn btn-outline"
                    style={{
                      padding: '4px 8px',
                      opacity: 0.8
                    }}
                    onClick={() => handleRemoveFriend(friend.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card p-lg text-center">
          <p>You don't have any friends yet.</p>
          <p className="mt-sm text-sm opacity-70">
            Use the "Find Friends" tab to search for other players and send friend requests.
          </p>
        </div>
      )}
    </div>
  );
};

export default FriendsList;
