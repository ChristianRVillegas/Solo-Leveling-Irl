import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useFriend } from '../../contexts/FriendContext';
import { formatDistanceToNow } from 'date-fns';
import './styles.css';

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const { pendingRequests, acceptFriendRequest, rejectFriendRequest } = useFriend();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef(null);
  
  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleToggleNotifications = () => {
    setIsOpen(!isOpen);
  };
  
  const handleNotificationClick = (notification) => {
    // Mark the notification as read
    markAsRead(notification.id);
    
    // Handle navigation based on notification type
    if (notification.type === 'challenge') {
      navigate('/social/challenges');
    } else if (notification.type === 'friend_request') {
      navigate('/social');
    } else if (notification.type === 'challenge_result') {
      navigate('/social/challenges');
    } else {
      // Default
      navigate('/');
    }
    
    setIsOpen(false);
  };
  
  const handleAcceptFriendRequest = async (userId) => {
    await acceptFriendRequest(userId);
  };
  
  const handleRejectFriendRequest = async (userId) => {
    await rejectFriendRequest(userId);
  };
  
  // Format the notification time
  const formatTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    // Firebase timestamp
    if (timestamp.toDate) {
      timestamp = timestamp.toDate();
    }
    
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };
  
  return (
    <div className="notification-bell" ref={bellRef}>
      <button 
        className={`notification-bell__button ${unreadCount > 0 ? 'has-notifications' : ''}`}
        onClick={handleToggleNotifications}
        aria-label="Notifications"
        style={{
          backgroundColor: isOpen ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
          color: theme.text
        }}
      >
        <span className="notification-bell__icon">🔔</span>
        {unreadCount > 0 && (
          <span 
            className="notification-bell__badge"
            style={{ backgroundColor: theme.primary }}
          >
            {unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div 
          className="notification-dropdown"
          style={{
            backgroundColor: theme.card,
            border: `1px solid ${theme.border}`,
            color: theme.text
          }}
        >
          <div className="notification-dropdown__header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button 
                className="notification-dropdown__mark-all" 
                onClick={markAllAsRead}
                style={{ color: theme.primary }}
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="notification-dropdown__content">
            {pendingRequests && pendingRequests.length > 0 && (
              <div className="notification-section">
                <h4>Friend Requests</h4>
                {pendingRequests.map(request => (
                  <div 
                    key={`request-${request.userId}`}
                    className="notification-item notification-item--request"
                    style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <div className="notification-item__content">
                      <div className="notification-item__title">
                        {request.senderName || 'Someone'} sent you a friend request
                      </div>
                      <div className="notification-item__time">
                        {formatTime(request.timestamp)}
                      </div>
                    </div>
                    <div className="notification-item__actions">
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => handleAcceptFriendRequest(request.userId)}
                      >
                        Accept
                      </button>
                      <button 
                        className="btn btn-sm btn-outline"
                        onClick={() => handleRejectFriendRequest(request.userId)}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {notifications.length > 0 ? (
              <div className="notification-section">
                <h4>Recent</h4>
                {notifications.map(notification => (
                  <div 
                    key={notification.id}
                    className={`notification-item ${!notification.read ? 'notification-item--unread' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                    style={{ 
                      backgroundColor: !notification.read ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <div className="notification-item__icon">
                      {notification.type === 'challenge' ? '🏆' : 
                       notification.type === 'friend_request' ? '👥' : 
                       notification.type === 'challenge_result' ? '🎯' : '📢'}
                    </div>
                    <div className="notification-item__content">
                      <div className="notification-item__title">
                        {notification.title}
                      </div>
                      <div className="notification-item__message">
                        {notification.message}
                      </div>
                      <div className="notification-item__time">
                        {formatTime(notification.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : pendingRequests.length === 0 ? (
              <div className="notification-empty">
                <p>No notifications yet</p>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;