import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { db } from '../../firebase/config';
import { 
  doc, 
  collection, 
  getDoc, 
  getDocs, 
  onSnapshot,
  query, 
  where, 
  updateDoc, 
  arrayUnion, 
  serverTimestamp,
  orderBy,
  limit,
  addDoc
} from 'firebase/firestore';
import { useFriend } from '../FriendContext';

// Create the context
const NotificationContext = createContext();

// Custom hook to use the notification context
export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const { pendingRequests } = useFriend();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load notifications when user changes
  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Set up real-time listener for notifications
    const notificationsRef = collection(db, 'users', currentUser.uid, 'notifications');
    const notificationsQuery = query(
      notificationsRef,
      orderBy('createdAt', 'desc'),
      limit(50) // Limit to most recent 50 notifications
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notificationData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setNotifications(notificationData);
      setUnreadCount(notificationData.filter(n => !n.read).length);
      setLoading(false);
    }, (error) => {
      console.error('Error getting notifications:', error);
      setLoading(false);
    });

    // Add effect to update unread count when pending friend requests change
    if (pendingRequests) {
      setUnreadCount(prevCount => {
        const notificationUnread = notifications.filter(n => !n.read).length;
        const friendRequestCount = pendingRequests.length;
        return notificationUnread + friendRequestCount;
      });
    }

    return () => unsubscribe();
  }, [currentUser, pendingRequests]);

  // Mark a notification as read
  const markAsRead = async (notificationId) => {
    if (!currentUser) return;

    try {
      const notificationRef = doc(db, 'users', currentUser.uid, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true,
        readAt: serverTimestamp()
      });

      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
      
      setUnreadCount(prevCount => Math.max(0, prevCount - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!currentUser) return;

    try {
      // Update all unread notifications
      const batch = db.batch();
      
      notifications
        .filter(notification => !notification.read)
        .forEach(notification => {
          const notificationRef = doc(db, 'users', currentUser.uid, 'notifications', notification.id);
          batch.update(notificationRef, {
            read: true,
            readAt: serverTimestamp()
          });
        });
      
      await batch.commit();

      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Send a notification to a user
  const sendNotification = async (userId, notification) => {
    if (!currentUser) return;

    try {
      const userNotificationsRef = collection(db, 'users', userId, 'notifications');
      
      const newNotification = {
        ...notification,
        createdAt: serverTimestamp(),
        read: false,
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentUser.email?.split('@')[0]
      };
      
      // Add the notification to the user's collection
      await addDoc(userNotificationsRef, newNotification);
      
      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  };

  // Context value
  const value = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    sendNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;