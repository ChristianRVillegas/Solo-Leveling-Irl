import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useFriend } from '../../contexts/FriendContext';
import ProfilePicture from '../../components/ProfilePicture';

const UserSearch = () => {
  const { theme } = useTheme();
  const { currentUser } = useAuth();
  const { searchUsers, sendFriendRequest, sentRequests } = useFriend();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [requestSent, setRequestSent] = useState({});

  // Handle search input changes
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Perform the search
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (searchQuery.trim().length < 3) {
      setError('Please enter at least 3 characters to search');
      return;
    }
    
    setError('');
    setIsSearching(true);
    
    try {
      const results = await searchUsers(searchQuery);
      setSearchResults(results);
    } catch (err) {
      console.error('Error searching for users:', err);
      setError('Failed to search for users. Please try again later.');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle sending a friend request
  const handleSendFriendRequest = async (userId) => {
    try {
      const success = await sendFriendRequest(userId);
      if (success) {
        // Update UI to show request sent
        setRequestSent(prev => ({ ...prev, [userId]: true }));
      }
    } catch (err) {
      console.error('Error sending friend request:', err);
      setError('Failed to send friend request. Please try again.');
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl mb-md">Find Friends</h2>
      
      <div className="card mb-lg">
        <form onSubmit={handleSearch}>
          <div className="mb-md">
            <label htmlFor="search" className="block mb-sm">
              Search for other users by name or email
            </label>
            <div className="flex">
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Enter name or email"
                className="form-input flex-grow mr-sm"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  color: theme.text,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 'var(--border-radius-md)',
                  padding: '8px 12px'
                }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSearching}
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
            {error && <p className="text-sm mt-sm" style={{ color: theme.danger }}>{error}</p>}
          </div>
        </form>
      </div>
      
      {searchResults.length > 0 ? (
        <div className="card">
          <h3 className="text-xl mb-md">Search Results</h3>
          <div className="space-y-md">
            {searchResults.map(user => (
              <div
                key={user.id}
                className="flex items-center justify-between p-md"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 'var(--border-radius-md)',
                }}
              >
                <div className="flex items-center">
                  <ProfilePicture 
                    size="medium"
                    src={user.profilePicture}
                  />
                  <div className="ml-md">
                    <h4 className="font-semibold">{user.displayName}</h4>
                    <p className="text-sm opacity-70">Level {user.level} {user.rank}</p>
                  </div>
                </div>
                <button
                  className="btn btn-outline"
                  onClick={() => handleSendFriendRequest(user.id)}
                  disabled={requestSent[user.id] || sentRequests.some(req => req.id === user.id)}
                >
                  {requestSent[user.id] || sentRequests.some(req => req.id === user.id) 
                    ? 'Request Sent' 
                    : 'Add Friend'}
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : searchQuery && !isSearching ? (
        <div className="card text-center p-lg">
          <p>No users found matching "{searchQuery}"</p>
        </div>
      ) : null}
    </div>
  );
};

export default UserSearch;
