import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useChallenge } from '../../contexts/ChallengeContext';
import UserSearch from './UserSearch';
import FriendRequests from './FriendRequests';
import FriendsList from './FriendsList';
import Leaderboard from './Leaderboard';
import { useNavigate } from 'react-router-dom';

const Social = () => {
  const { theme } = useTheme();
  const { pendingChallenges } = useChallenge();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('search');

  // Tab definitions
  const tabs = [
    { id: 'search', label: 'Find Friends', icon: '🔍' },
    { id: 'requests', label: 'Friend Requests', icon: '✉️' },
    { id: 'friends', label: 'Friends', icon: '👥' },
    { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-md">
        <h2 className="text-2xl">Social</h2>
        
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/social/challenges')}
        >
          Challenges
          {pendingChallenges.length > 0 && (
            <span className="ml-xs" style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              {pendingChallenges.length}
            </span>
          )}
        </button>
      </div>
      
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
              marginBottom: '-1px'
            }}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="mr-xs">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Tab content */}
      {activeTab === 'search' && <UserSearch />}
      {activeTab === 'requests' && <FriendRequests />}
      {activeTab === 'friends' && <FriendsList />}
      {activeTab === 'leaderboard' && <Leaderboard />}
    </div>
  );
};

export default Social;
