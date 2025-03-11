import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useChallenge, CHALLENGE_TYPES } from '../../../contexts/ChallengeContext';
import { useGame } from '../../../contexts/GameContext';
import { useFriend } from '../../../contexts/FriendContext';
import { db } from '../../../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import ProfilePicture from '../../../components/ProfilePicture';

const CreateChallenge = ({ onCancel }) => {
  const { theme } = useTheme();
  const { createChallenge } = useChallenge();
  const { STATS } = useGame();
  const { friends } = useFriend();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [selectedType, setSelectedType] = useState(CHALLENGE_TYPES.STREAK_COMPETITION.id);
  const [selectedFriend, setSelectedFriend] = useState('');
  const [friendsData, setFriendsData] = useState([]);
  
  // Level race parameters
  const [selectedStat, setSelectedStat] = useState(STATS[0]?.id || '');
  const [targetLevel, setTargetLevel] = useState(10);
  
  // Load friends data
  useEffect(() => {
    const loadFriendsData = async () => {
      if (!friends || friends.length === 0) {
        return;
      }
      
      try {
        const friendPromises = friends.map(async (friend) => {
          try {
            const userDocRef = doc(db, 'gameStates', friend.userId);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
              const userData = userDoc.data();
              
              return {
                id: friend.userId,
                friendSince: friend.friendSince,
                displayName: userData.playerName || 'Unknown User',
                profilePicture: userData.profilePicture
              };
            }
            return null;
          } catch (error) {
            console.error(`Error loading friend data ${friend.userId}:`, error);
            return null;
          }
        });

        const results = await Promise.all(friendPromises);
        const validResults = results.filter(Boolean);
        
        setFriendsData(validResults);
        if (validResults.length > 0) {
          setSelectedFriend(validResults[0].id);
        }
      } catch (error) {
        console.error('Error loading friends data:', error);
      }
    };

    loadFriendsData();
  }, [friends]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFriend) {
      setError('Please select a friend to challenge');
      return;
    }
    
    if (selectedType === CHALLENGE_TYPES.LEVEL_RACE.id && !selectedStat) {
      setError('Please select a stat for the level race');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    let parameters = {};
    
    if (selectedType === CHALLENGE_TYPES.LEVEL_RACE.id) {
      parameters = {
        statId: selectedStat,
        targetLevel: parseInt(targetLevel)
      };
    }
    
    const result = await createChallenge(selectedFriend, selectedType, parameters);
    
    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        onCancel();
      }, 2000);
    } else {
      setError(result.error || 'Failed to create challenge');
    }
    
    setLoading(false);
  };
  
  if (success) {
    return (
      <div className="card text-center p-lg">
        <div className="text-4xl mb-md">🎉</div>
        <h3 className="text-xl mb-sm">Challenge Sent!</h3>
        <p>Your friend will be notified about your challenge.</p>
      </div>
    );
  }
  
  return (
    <div className="card">
      <h3 className="text-xl mb-md">Create Challenge</h3>
      
      {error && (
        <div 
          className="mb-md p-sm" 
          style={{ 
            backgroundColor: 'rgba(239, 68, 68, 0.1)', 
            color: 'rgb(239, 68, 68)',
            borderRadius: 'var(--border-radius-md)'
          }}
        >
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Challenge Type</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            {Object.values(CHALLENGE_TYPES).map(type => (
              <div 
                key={type.id}
                className="cursor-pointer"
                onClick={() => setSelectedType(type.id)}
                style={{
                  padding: 'var(--spacing-md)',
                  backgroundColor: selectedType === type.id ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 'var(--border-radius-md)',
                  border: selectedType === type.id ? `1px solid ${theme.primary}` : 'none'
                }}
              >
                <div className="flex items-center gap-sm mb-xs">
                  <span className="text-xl">{type.icon}</span>
                  <span className="font-bold">{type.name}</span>
                </div>
                <p className="text-sm" style={{ opacity: 0.8 }}>{type.description}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label">Challenge Friend</label>
          {friendsData.length > 0 ? (
            <select
              className="form-select"
              value={selectedFriend}
              onChange={(e) => setSelectedFriend(e.target.value)}
            >
              <option value="" key="select-default">Select a friend</option>
              {friendsData.map(friend => (
                <option key={`friend-option-${friend.id}`} value={friend.id}>
                  {friend.displayName || 'Friend'}
                </option>
              ))}
            </select>
          ) : (
            <div className="text-center p-md bg-opacity-10" style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 'var(--border-radius-md)'
            }}>
              <p>You don't have any friends yet.</p>
              <p className="text-sm mt-xs" style={{ opacity: 0.7 }}>
                Add friends to challenge them!
              </p>
            </div>
          )}
        </div>
        
        {selectedType === CHALLENGE_TYPES.LEVEL_RACE.id && (
          <>
            <div className="form-group">
              <label className="form-label">Stat to Race</label>
              <select
                className="form-select"
                value={selectedStat}
                onChange={(e) => setSelectedStat(e.target.value)}
              >
                {STATS.map(stat => (
                  <option key={stat.id} value={stat.id}>
                    {stat.icon} {stat.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Target Level</label>
              <div className="flex items-center gap-md">
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={targetLevel}
                  onChange={(e) => setTargetLevel(e.target.value)}
                  style={{ flex: 1 }}
                />
                <div 
                  className="text-center px-md py-sm" 
                  style={{ 
                    minWidth: '60px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 'var(--border-radius-md)',
                    fontWeight: 'bold'
                  }}
                >
                  {targetLevel}
                </div>
              </div>
            </div>
          </>
        )}
        
        <div className="flex justify-end gap-md mt-lg">
          <button 
            type="button" 
            className="btn btn-outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading || !selectedFriend}
          >
            {loading ? 'Sending...' : 'Send Challenge'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateChallenge;