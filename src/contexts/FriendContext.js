import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase/config';
import { doc, getDoc, onSnapshot, updateDoc, arrayUnion, Timestamp, setDoc } from 'firebase/firestore';
import { searchUsers, sendFriendRequest, getFriendRequests, getFriends } from '../services/socialService';

// Create the context
const FriendContext = createContext();

// Custom hook to use the friend context
export const useFriend = () => useContext(FriendContext);

export const FriendProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load friend data when user changes
  useEffect(() => {
    let unsubscribe = null;
    
    const loadFriendData = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      
      try {
        // Set up real-time listener for the user's friend document
        const friendDocRef = doc(db, 'friends', currentUser.uid);
        
        unsubscribe = onSnapshot(friendDocRef, (docSnapshot) => {
          if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            
            // Process pending requests to include user data
            const pendingRequestsData = data.pendingRequests || [];
            console.log('Pending requests data:', pendingRequestsData);
            setPendingRequests(pendingRequestsData);
            
            // Process sent requests
            const sentRequestsData = data.sentRequests || [];
            console.log('Sent requests data:', sentRequestsData);
            setSentRequests(sentRequestsData);
            
            // Process friends list
            const friendsData = data.friends || [];
            setFriends(friendsData);
          } else {
            console.log('No friend document exists yet');
            setPendingRequests([]);
            setSentRequests([]);
            setFriends([]);
          }
          
          setLoading(false);
        }, (error) => {
          console.error('Error listening to friend data:', error);
          setLoading(false);
        });
      } catch (error) {
        console.error('Error setting up friend data listener:', error);
        setPendingRequests([]);
        setSentRequests([]);
        setFriends([]);
        setLoading(false);
      }
    };

    loadFriendData();
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentUser]);

  // Method to search for users
  const handleSearchUsers = async (query) => {
    if (!currentUser) return [];
    
    try {
      return await searchUsers(query, currentUser.uid);
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  };

  // Method to send a friend request
  const handleSendFriendRequest = async (recipientId) => {
    if (!currentUser) return false;
    
    try {
      await sendFriendRequest(currentUser.uid, recipientId);
      
      // Update sent requests (in a real implementation, this would be confirmed by the database)
      setSentRequests([...sentRequests, { 
        id: recipientId, 
        timestamp: new Date().toISOString() 
      }]);
      
      return true;
    } catch (error) {
      console.error('Error sending friend request:', error);
      return false;
    }
  };

  // Method to accept a friend request
  const handleAcceptFriendRequest = async (requestId) => {
    if (!currentUser) return false;
    
    try {
      // Find the request in pendingRequests
      const request = pendingRequests.find(req => req.userId === requestId);
      if (!request) {
        console.error('Friend request not found');
        return false;
      }
      
      // Get timestamp for the friendship
      const now = new Date().toISOString();
      
      // Update recipient's document (current user)
      const recipientRef = doc(db, 'friends', currentUser.uid);
      const recipientDoc = await getDoc(recipientRef);
      
      if (recipientDoc.exists()) {
        // Remove from pending requests and add to friends
        const pendingRequestsData = recipientDoc.data().pendingRequests || [];
        const updatedPendingRequests = pendingRequestsData.filter(req => req.userId !== requestId);
        
        const friendsData = recipientDoc.data().friends || [];
        
        // Check if already friends
        if (!friendsData.some(f => f.userId === requestId)) {
          const newFriend = {
            userId: requestId,
            friendSince: now
          };
          
          await updateDoc(recipientRef, {
            pendingRequests: updatedPendingRequests,
            friends: [...friendsData, newFriend]
          });
        } else {
          // Just remove from pending if already friends
          await updateDoc(recipientRef, {
            pendingRequests: updatedPendingRequests
          });
        }
      } else {
        // Create new document if it doesn't exist
        await setDoc(recipientRef, {
          pendingRequests: [],
          sentRequests: [],
          friends: [{
            userId: requestId,
            friendSince: now
          }]
        });
      }
      
      // Update sender's document
      const senderRef = doc(db, 'friends', requestId);
      const senderDoc = await getDoc(senderRef);
      
      if (senderDoc.exists()) {
        // Remove from sent requests and add to friends
        const sentRequestsData = senderDoc.data().sentRequests || [];
        const updatedSentRequests = sentRequestsData.filter(req => req.userId !== currentUser.uid);
        
        const friendsData = senderDoc.data().friends || [];
        
        // Check if already friends
        if (!friendsData.some(f => f.userId === currentUser.uid)) {
          const newFriend = {
            userId: currentUser.uid,
            friendSince: now
          };
          
          await updateDoc(senderRef, {
            sentRequests: updatedSentRequests,
            friends: [...friendsData, newFriend]
          });
        } else {
          // Just remove from sent if already friends
          await updateDoc(senderRef, {
            sentRequests: updatedSentRequests
          });
        }
      } else {
        // Create new document if it doesn't exist
        await setDoc(senderRef, {
          pendingRequests: [],
          sentRequests: [],
          friends: [{
            userId: currentUser.uid,
            friendSince: now
          }]
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error accepting friend request:', error);
      return false;
    }
  };

  // Method to reject a friend request
  const handleRejectFriendRequest = async (requestId) => {
    if (!currentUser) return false;
    
    try {
      // Update recipient's document (current user)
      const recipientRef = doc(db, 'friends', currentUser.uid);
      const recipientDoc = await getDoc(recipientRef);
      
      if (recipientDoc.exists()) {
        // Remove from pending requests
        const pendingRequestsData = recipientDoc.data().pendingRequests || [];
        const updatedPendingRequests = pendingRequestsData.filter(req => req.userId !== requestId);
        
        await updateDoc(recipientRef, {
          pendingRequests: updatedPendingRequests
        });
      }
      
      // Update sender's document
      const senderRef = doc(db, 'friends', requestId);
      const senderDoc = await getDoc(senderRef);
      
      if (senderDoc.exists()) {
        // Remove from sent requests
        const sentRequestsData = senderDoc.data().sentRequests || [];
        const updatedSentRequests = sentRequestsData.filter(req => req.userId !== currentUser.uid);
        
        await updateDoc(senderRef, {
          sentRequests: updatedSentRequests
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      return false;
    }
  };

      // Method to remove a friend
  const handleRemoveFriend = async (friendId) => {
    if (!currentUser) return false;
    
    try {
      // Update current user's document
      const userRef = doc(db, 'friends', currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const friendsData = userDoc.data().friends || [];
        const updatedFriends = friendsData.filter(friend => friend.userId !== friendId);
        
        await updateDoc(userRef, {
          friends: updatedFriends
        });
      }
      
      // Update friend's document
      const friendRef = doc(db, 'friends', friendId);
      const friendDoc = await getDoc(friendRef);
      
      if (friendDoc.exists()) {
        const friendsData = friendDoc.data().friends || [];
        const updatedFriends = friendsData.filter(friend => friend.userId !== currentUser.uid);
        
        await updateDoc(friendRef, {
          friends: updatedFriends
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error removing friend:', error);
      return false;
    }
  };

  // Create the context value
  const value = {
    friends,
    pendingRequests,
    sentRequests,
    loading,
    searchUsers: handleSearchUsers,
    sendFriendRequest: handleSendFriendRequest,
    acceptFriendRequest: handleAcceptFriendRequest,
    rejectFriendRequest: handleRejectFriendRequest,
    removeFriend: handleRemoveFriend
  };

  return (
    <FriendContext.Provider value={value}>
      {children}
    </FriendContext.Provider>
  );
};

export default FriendProvider;
