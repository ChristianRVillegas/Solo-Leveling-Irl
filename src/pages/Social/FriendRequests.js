import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useFriend } from '../../contexts/FriendContext';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import ProfilePicture from '../../components/ProfilePicture';

const FriendRequests = () => {
  const { theme } = useTheme();
  const { currentUser } = useAuth();
  const { pendingRequests, sentRequests, acceptFriendRequest, rejectFriendRequest } = useFriend();
  const [loading, setLoading] = useState(true);
  const [requestUsers, setRequestUsers] = useState([]);
  const [sentRequestUsers, setSentRequestUsers] = useState([]);

  useEffect(() => {
    const loadRequestUserData = async () => {
      if (pendingRequests.length === 0 && sentRequests.length === 0) {
        setLoading(false);
        return;
      }
      
      try {
        // Load user data for pending requests
        const pendingPromises = pendingRequests.map(async (request) => {
          try {
            const userDocRef = doc(db, 'gameStates', request.userId);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
              const userData = userDoc.data();
              return {
                id: request.userId,
                timestamp: request.timestamp,
                displayName: userData.playerName || 'Unknown User',
                profilePicture: userData.profilePicture,
                level: userData.stats ? 
                  Math.floor(Object.values(userData.stats).reduce((sum, stat) => sum + stat.level, 0) / 6) : 
                  1,
                rank: 'Player' // Simplified for this example
              };
            }
            return null;
          } catch (error) {
            console.error(`Error loading request user ${request.userId}:`, error);
            return null;
          }
        });

        // Load user data for sent requests
        const sentPromises = sentRequests.map(async (request) => {
          try {
            const userDocRef = doc(db, 'gameStates', request.userId);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
              const userData = userDoc.data();
              return {
                id: request.userId,
                timestamp: request.timestamp,
                displayName: userData.playerName || 'Unknown User',
                profilePicture: userData.profilePicture,
                level: userData.stats ? 
                  Math.floor(Object.values(userData.stats).reduce((sum, stat) => sum + stat.level, 0) / 6) : 
                  1,
                rank: 'Player' // Simplified for this example
              };
            }
            return null;
          } catch (error) {
            console.error(`Error loading request user ${request.userId}:`, error);
            return null;
          }
        });

        const pendingResults = await Promise.all(pendingPromises);
        const sentResults = await Promise.all(sentPromises);
        
        setRequestUsers(pendingResults.filter(Boolean));
        setSentRequestUsers(sentResults.filter(Boolean));
        setLoading(false);
      } catch (error) {
        console.error('Error loading request user data:', error);
        setLoading(false);
      }
    };

    loadRequestUserData();
  }, [pendingRequests, sentRequests]);

  const handleAcceptRequest = async (requestId) => {
    const success = await acceptFriendRequest(requestId);
    // UI updates will be handled by context
  };

  const handleRejectRequest = async (requestId) => {
    const success = await rejectFriendRequest(requestId);
    // UI updates will be handled by context
  };

  if (loading) {
    return (
      <div className="card p-lg flex justify-center items-center">
        <div>Loading requests...</div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Incoming Friend Requests */}
      <section style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h3 className="text-xl mb-md">Incoming Friend Requests</h3>
        
        {requestUsers.length > 0 ? (
          <div className="card">
            <div className="space-y-md">
              {requestUsers.map(request => (
                <div
                  key={`incoming-${request.id}`}
                  className="flex items-center justify-between p-md"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 'var(--border-radius-md)',
                  }}
                >
                  <div className="flex items-center">
                    <ProfilePicture 
                      size="medium"
                      src={request.profilePicture}
                    />
                    <div className="ml-md">
                      <h4 className="font-semibold">{request.displayName}</h4>
                      <p className="text-sm opacity-70">Level {request.level} {request.rank}</p>
                    </div>
                  </div>
                  <div className="flex gap-sm">
                    <button
                      className="btn btn-primary"
                      onClick={() => handleAcceptRequest(request.id)}
                    >
                      Accept
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={() => handleRejectRequest(request.id)}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card p-lg text-center">
            <p>No incoming friend requests</p>
          </div>
        )}
      </section>
      
      {/* Outgoing Friend Requests */}
      <section>
        <h3 className="text-xl mb-md">Sent Friend Requests</h3>
        
        {sentRequestUsers.length > 0 ? (
          <div className="card">
            <div className="space-y-md">
              {sentRequestUsers.map(request => (
                <div
                  key={`outgoing-${request.id}`}
                  className="flex items-center justify-between p-md"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 'var(--border-radius-md)',
                  }}
                >
                  <div className="flex items-center">
                    <ProfilePicture 
                      size="medium"
                      src={request.profilePicture}
                    />
                    <div className="ml-md">
                      <h4 className="font-semibold">{request.displayName}</h4>
                      <p className="text-sm opacity-70">Level {request.level} {request.rank}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm opacity-70">Pending</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card p-lg text-center">
            <p>No outgoing friend requests</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default FriendRequests;
