import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import UserSearch from './UserSearch';
import FriendRequests from './FriendRequests';
import FriendsList from './FriendsList';

const Social = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('search');

  // Tab definitions
  const tabs = [
    { id: 'search', label: 'Find Friends', icon: '🔍' },
    { id: 'requests', label: 'Friend Requests', icon: '✉️' },
    { id: 'friends', label: 'Friends', icon: '👥' },
  ];

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl mb-md">Social</h2>
      
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
    </div>
  );
};

export default Social;
