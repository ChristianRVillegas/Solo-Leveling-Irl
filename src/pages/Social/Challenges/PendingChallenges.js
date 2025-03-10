import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useChallenge, CHALLENGE_TYPES } from '../../../contexts/ChallengeContext';
import { useGame } from '../../../contexts/GameContext';
import { useAuth } from '../../../contexts/AuthContext';
import { format } from 'date-fns';

const PendingChallenges = ({ challenges }) => {
  const { theme } = useTheme();
  const { acceptChallenge, declineChallenge } = useChallenge();
  const { currentUser } = useAuth();
  const { STATS } = useGame();
  
  if (challenges.length === 0) {
    return (
      <div className="card p-lg text-center">
        <p>You don't have any pending challenges.</p>
        <p className="mt-sm text-sm opacity-70">
          When someone challenges you, it will appear here for you to accept or decline.
        </p>
      </div>
    );
  }
  
  const handleAccept = async (challengeId) => {
    await acceptChallenge(challengeId);
  };
  
  const handleDecline = async (challengeId) => {
    await declineChallenge(challengeId);
  };
  
  return (
    <div className="space-y-lg">
      {challenges.map(challenge => {
        const challengeType = CHALLENGE_TYPES[challenge.type];
        
        // Format date
        const createdDate = challenge.createdAt?.toDate ? format(challenge.createdAt.toDate(), 'MMM d, yyyy') : 'Just now';
        
        return (
          <div 
            key={challenge.id}
            className="card"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-sm">
                  <span className="text-2xl">{challengeType.icon}</span>
                  <h3 className="text-xl font-bold">{challengeType.name}</h3>
                </div>
                <p className="text-sm opacity-70">Received {createdDate}</p>
              </div>
              
              <span className="text-xs px-sm py-xs" style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 'var(--border-radius-sm)'
              }}>
                Pending
              </span>
            </div>
            
            <div className="mt-md">
              <div className="text-sm" style={{ opacity: 0.7 }}>
                From <span className="font-bold">{challenge.creatorName}</span>
              </div>
              
              <div className="text-sm" style={{ opacity: 0.7 }}>
                {challengeType.description}
              </div>
            </div>
            
            {challenge.type === CHALLENGE_TYPES.LEVEL_RACE.id && (
              <div className="mt-md p-sm" style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 'var(--border-radius-md)'
              }}>
                <div className="text-sm">
                  <span className="font-bold">Challenge Details:</span> First to reach level {challenge.parameters.targetLevel} in{' '}
                  {STATS.find(s => s.id === challenge.parameters.statId)?.name || 'a stat'} wins.
                </div>
              </div>
            )}
            
            <div className="flex justify-center gap-md mt-lg">
              <button 
                className="btn btn-primary"
                onClick={() => handleAccept(challenge.id)}
              >
                Accept Challenge
              </button>
              <button 
                className="btn btn-outline"
                onClick={() => handleDecline(challenge.id)}
              >
                Decline
              </button>
            </div>
            
            {challenge.type === CHALLENGE_TYPES.LEVEL_RACE.id && (
              <div className="flex justify-center mt-md">
                <div className="card bg-opacity-20 p-sm text-center">
                  <div className="text-sm" style={{ opacity: 0.7 }}>Prize</div>
                  <div className="font-bold">👑 {challenge.title} Title</div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PendingChallenges;