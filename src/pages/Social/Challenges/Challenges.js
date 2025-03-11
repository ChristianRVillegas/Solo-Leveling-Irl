import React, { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useChallenge } from '../../../contexts/ChallengeContext';
import ActiveChallenges from './ActiveChallenges';
import PendingChallenges from './PendingChallenges';
import PastChallenges from './PastChallenges';
import CreateChallenge from './CreateChallenge';

const Challenges = () => {
  const { theme } = useTheme();
  const { 
    activeChallenges, 
    pendingChallenges, 
    pastChallenges, 
    loading,
    titles,
    selectedTitle,
    selectTitle,
    removeTitle
  } = useChallenge();
  const [activeTab, setActiveTab] = useState('active');
  const [isCreating, setIsCreating] = useState(false);

  // Tab definitions
  const tabs = [
    { id: 'active', label: 'Active Challenges', icon: '🔥' },
    { id: 'pending', label: 'Pending Challenges', icon: '📩', badge: pendingChallenges.length > 0 },
    { id: 'past', label: 'Past Challenges', icon: '📜' },
    { id: 'titles', label: 'Titles', icon: '👑' }
  ];

  if (loading) {
    return (
      <div className="animate-fade-in text-center p-lg">
        <div className="spinner"></div>
        <p className="mt-md">Loading challenges...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-md">
        <h2 className="text-2xl">Challenges</h2>
        {!isCreating && (
          <button 
            className="btn btn-primary"
            onClick={() => setIsCreating(true)}
          >
            Create Challenge
          </button>
        )}
      </div>

      {isCreating ? (
        <CreateChallenge onCancel={() => setIsCreating(false)} />
      ) : (
        <>
          {/* Tabs */}
          <div 
            className="flex overflow-x-auto mb-lg"
            style={{ borderBottom: `1px solid ${theme.border}` }}
          >
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`px-md py-sm whitespace-nowrap ${activeTab === tab.id ? 'font-bold' : ''}`}
                style={{
                  color: activeTab === tab.id ? theme.primary : theme.text,
                  borderBottom: activeTab === tab.id ? `2px solid ${theme.primary}` : 'none',
                  backgroundColor: 'transparent',
                  margin: '0 4px',
                  marginBottom: '-1px',
                  position: 'relative'
                }}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="mr-xs">{tab.icon}</span>
                {tab.label}
                {tab.badge && (
                  <span 
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: theme.primary
                    }}
                  />
                )}
              </button>
            ))}
          </div>
          
          {/* Tab content */}
          {activeTab === 'active' && <ActiveChallenges challenges={activeChallenges} />}
          {activeTab === 'pending' && <PendingChallenges challenges={pendingChallenges} />}
          {activeTab === 'past' && <PastChallenges challenges={pastChallenges} />}
          {activeTab === 'titles' && (
            <div className="card">
              <h3 className="text-xl mb-md">Your Titles</h3>
              
              {titles.length > 0 ? (
                <>
                  <p className="mb-md">
                    You have earned the following titles from winning challenges. 
                    Select one to display on your profile.
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-md">
                    {titles.map(title => (
                      <div
                        key={title}
                        className={`p-md rounded cursor-pointer text-center ${
                          selectedTitle === title ? 'bg-primary bg-opacity-20' : 'bg-opacity-10 hover:bg-opacity-20'
                        }`}
                        style={{
                          backgroundColor: selectedTitle === title ? theme.primary : 'rgba(255, 255, 255, 0.05)',
                          borderRadius: 'var(--border-radius-md)',
                          border: selectedTitle === title ? `1px solid ${theme.primary}` : 'none'
                        }}
                        onClick={() => {
                          if (selectedTitle === title) {
                            removeTitle();
                          } else {
                            selectTitle(title);
                          }
                        }}
                      >
                        <div className="text-2xl mb-xs">👑</div>
                        <div className="font-bold">{title}</div>
                        {selectedTitle === title && (
                          <div className="text-sm mt-xs" style={{ color: theme.primary }}>
                            Currently Selected
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center p-lg">
                  <p>You haven't earned any titles yet.</p>
                  <p className="mt-xs opacity-70">
                    Win challenges to earn special titles you can display on your profile!
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Challenges;