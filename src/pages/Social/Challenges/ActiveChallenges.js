import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useChallenge, CHALLENGE_TYPES } from '../../../contexts/ChallengeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { format } from 'date-fns';

const ActiveChallenges = ({ challenges }) => {
  const { theme } = useTheme();
  const { currentUser } = useAuth();
  
  if (challenges.length === 0) {
    return (
      <div className="card p-lg text-center">
        <p>You don't have any active challenges.</p>
        <p className="mt-sm text-sm opacity-70">
          Create a new challenge or accept a pending challenge to get started!
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-lg">
      {challenges.map(challenge => {
        const isCreator = challenge.creatorId === currentUser.uid;
        const opponent = isCreator ? challenge.recipientName : challenge.creatorName;
        const opponentId = isCreator ? challenge.recipientId : challenge.creatorId;
        const challengeType = CHALLENGE_TYPES[challenge.type];
        
        // Format date
        const startDate = challenge.startedAt?.toDate ? format(challenge.startedAt.toDate(), 'MMM d, yyyy') : 'Just now';
        
        // Get progress data
        const userProgress = challenge.progress[currentUser.uid];
        const opponentProgress = challenge.progress[opponentId];
        
        // Get challenge-specific progress information
        let progressDisplay;
        let userLeading = false;
        let opponentLeading = false;
        
        if (challenge.type === CHALLENGE_TYPES.STREAK_COMPETITION.id) {
          const userStreak = userProgress.streak || 0;
          const opponentStreak = opponentProgress.streak || 0;
          
          userLeading = userStreak > opponentStreak;
          opponentLeading = opponentStreak > userStreak;
          
          progressDisplay = (
            <div className="grid grid-cols-2 gap-md mt-md">
              <div className="text-center">
                <div className="text-sm" style={{ opacity: 0.7 }}>Your Streak</div>
                <div className="text-2xl font-bold" style={{ color: userLeading ? theme.primary : theme.text }}>
                  🔥 {userStreak}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm" style={{ opacity: 0.7 }}>{opponent}'s Streak</div>
                <div className="text-2xl font-bold" style={{ color: opponentLeading ? theme.primary : theme.text }}>
                  🔥 {opponentStreak}
                </div>
              </div>
            </div>
          );
        } else if (challenge.type === CHALLENGE_TYPES.LEVEL_RACE.id) {
          const { statId, targetLevel } = challenge.parameters;
          const userLevel = userProgress.currentStats?.[statId] || userProgress.startStats?.[statId] || 0;
          const opponentLevel = opponentProgress.currentStats?.[statId] || opponentProgress.startStats?.[statId] || 0;
          
          userLeading = userLevel > opponentLevel;
          opponentLeading = opponentLevel > userLevel;
          
          const userProgress = (userLevel / targetLevel) * 100;
          const opponentProgress = (opponentLevel / targetLevel) * 100;
          
          progressDisplay = (
            <div className="mt-md">
              <div className="mb-xs">
                <div className="flex justify-between mb-xxs">
                  <span className="text-sm">You</span>
                  <span className="text-sm" style={{ color: userLeading ? theme.primary : theme.text }}>
                    Level {userLevel} / {targetLevel}
                  </span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-bar-fill" 
                    style={{ 
                      width: `${Math.min(userProgress, 100)}%`,
                      backgroundColor: userLeading ? theme.primary : theme.secondary
                    }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-xxs">
                  <span className="text-sm">{opponent}</span>
                  <span className="text-sm" style={{ color: opponentLeading ? theme.primary : theme.text }}>
                    Level {opponentLevel} / {targetLevel}
                  </span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-bar-fill" 
                    style={{ 
                      width: `${Math.min(opponentProgress, 100)}%`,
                      backgroundColor: opponentLeading ? theme.primary : theme.accent
                    }}
                  ></div>
                </div>
              </div>
            </div>
          );
        } else if (challenge.type === CHALLENGE_TYPES.WEEKLY_LEADERBOARD.id) {
          const userPoints = userProgress.points || 0;
          const opponentPoints = opponentProgress.points || 0;
          
          userLeading = userPoints > opponentPoints;
          opponentLeading = opponentPoints > userPoints;
          
          // Format end date
          const endDate = challenge.endDate?.toDate ? format(challenge.endDate.toDate(), 'MMM d, yyyy') : 'Unknown';
          
          progressDisplay = (
            <div className="space-y-md mt-md">
              <div className="text-sm text-center">
                Challenge ends: <span className="font-bold">{endDate}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-md">
                <div className="text-center">
                  <div className="text-sm" style={{ opacity: 0.7 }}>Your Points</div>
                  <div className="text-2xl font-bold" style={{ color: userLeading ? theme.primary : theme.text }}>
                    {userPoints}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm" style={{ opacity: 0.7 }}>{opponent}'s Points</div>
                  <div className="text-2xl font-bold" style={{ color: opponentLeading ? theme.primary : theme.text }}>
                    {opponentPoints}
                  </div>
                </div>
              </div>
            </div>
          );
        }
        
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
                <p className="text-sm opacity-70">Started {startDate}</p>
              </div>
              
              <span className="text-xs px-sm py-xs" style={{ 
                backgroundColor: userLeading ? theme.primary : opponentLeading ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                color: userLeading ? 'white' : theme.text,
                borderRadius: 'var(--border-radius-sm)',
                fontWeight: userLeading ? 'bold' : 'normal'
              }}>
                {userLeading ? 'Leading' : opponentLeading ? 'Behind' : 'Tied'}
              </span>
            </div>
            
            <div className="mt-md">
              <div className="text-sm" style={{ opacity: 0.7 }}>
                Competing with <span className="font-bold">{opponent}</span>
              </div>
              
              <div className="text-sm" style={{ opacity: 0.7 }}>
                {challengeType.description}
              </div>
            </div>
            
            {progressDisplay}
            
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

export default ActiveChallenges;