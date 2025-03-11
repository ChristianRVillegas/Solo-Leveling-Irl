import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useChallenge, CHALLENGE_TYPES, CHALLENGE_STATUS } from '../../../contexts/ChallengeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { format } from 'date-fns';

const PastChallenges = ({ challenges }) => {
  const { theme } = useTheme();
  const { currentUser } = useAuth();
  
  if (challenges.length === 0) {
    return (
      <div className="card p-lg text-center">
        <p>You don't have any past challenges.</p>
        <p className="mt-sm text-sm opacity-70">
          Completed, declined, and canceled challenges will appear here.
        </p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="card mb-md">
        <div className="flex justify-between mb-sm">
          <h3 className="text-lg font-bold">Challenge History</h3>
          <div className="text-sm" style={{ opacity: 0.7 }}>
            {challenges.length} challenge{challenges.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        <div className="space-y-sm">
          {challenges.map(challenge => {
            const isCreator = challenge.creatorId === currentUser.uid;
            const opponent = isCreator ? challenge.recipientName : challenge.creatorName;
            const challengeType = Object.values(CHALLENGE_TYPES).find(type => type.id === challenge.type) || {
              name: 'Challenge',
              description: 'Challenge description',
              icon: '🏆'
            };
            
            // Determine outcome
            let outcome;
            let outcomeColor;
            
            if (challenge.status === CHALLENGE_STATUS.DECLINED) {
              outcome = isCreator ? 'Declined by opponent' : 'You declined';
              outcomeColor = theme.accent;
            } else if (challenge.status === CHALLENGE_STATUS.CANCELED) {
              outcome = 'Canceled';
              outcomeColor = theme.accent;
            } else if (challenge.status === CHALLENGE_STATUS.COMPLETED) {
              if (challenge.winner === currentUser.uid) {
                outcome = 'You won';
                outcomeColor = theme.primary;
              } else if (challenge.winner === null) {
                outcome = 'Tied';
                outcomeColor = theme.text;
              } else {
                outcome = 'You lost';
                outcomeColor = theme.text;
              }
            }
            
            // Format dates
            const completedDate = challenge.completedAt?.toDate 
              ? format(challenge.completedAt.toDate(), 'MMM d, yyyy')
              : challenge.declinedAt?.toDate
                ? format(challenge.declinedAt.toDate(), 'MMM d, yyyy')
                : 'Unknown';
            
            return (
              <div 
                key={challenge.id}
                style={{ 
                  padding: 'var(--spacing-sm)',
                  borderRadius: 'var(--border-radius-md)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-sm">
                    <span className="text-xl">{challengeType.icon}</span>
                    <div>
                      <div className="font-medium">{challengeType.name}</div>
                      <div className="text-xs" style={{ opacity: 0.7 }}>
                        vs. {opponent} • {completedDate}
                      </div>
                    </div>
                  </div>
                  
                  <span className="text-xs px-sm py-xs" style={{ 
                    color: outcomeColor,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 'var(--border-radius-sm)',
                    fontWeight: challenge.winner === currentUser.uid ? 'bold' : 'normal'
                  }}>
                    {outcome}
                  </span>
                </div>
                
                {challenge.winner === currentUser.uid && challenge.title && (
                  <div className="mt-xs text-xs" style={{ color: theme.primary }}>
                    <span className="mr-xxs">👑</span> Earned "{challenge.title}" title
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="card">
        <h3 className="text-lg font-bold mb-md">Challenge Stats</h3>
        
        <div className="grid grid-cols-3 gap-md">
          <div className="text-center p-md" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 'var(--border-radius-md)' }}>
            <div className="text-xs mb-xs" style={{ opacity: 0.7 }}>Challenges</div>
            <div className="text-xl font-bold">{challenges.length}</div>
          </div>
          
          <div className="text-center p-md" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 'var(--border-radius-md)' }}>
            <div className="text-xs mb-xs" style={{ opacity: 0.7 }}>Wins</div>
            <div className="text-xl font-bold" style={{ color: theme.primary }}>
              {challenges.filter(c => c.winner === currentUser.uid).length}
            </div>
          </div>
          
          <div className="text-center p-md" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 'var(--border-radius-md)' }}>
            <div className="text-xs mb-xs" style={{ opacity: 0.7 }}>Win Rate</div>
            <div className="text-xl font-bold">
              {challenges.filter(c => c.status === CHALLENGE_STATUS.COMPLETED).length > 0
                ? Math.round((challenges.filter(c => c.winner === currentUser.uid).length / 
                   challenges.filter(c => c.status === CHALLENGE_STATUS.COMPLETED).length) * 100)
                : 0}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PastChallenges;