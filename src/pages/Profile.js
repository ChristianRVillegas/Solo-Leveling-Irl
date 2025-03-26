import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useFriend } from '../contexts/FriendContext';
import { format, differenceInDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import ProfilePicture from '../components/ProfilePicture';
import TitleDisplay from '../components/titles/TitleDisplay';
import TitlesManager from '../components/titles/TitlesManager';
import { getUserTitles } from '../utils/titles/titleService';
import { uploadProfilePicture, testStorageConnection } from '../services/storageService';

/**
 * Profile page component that displays user information, stats visualization,
 * and recent task activity.
 */
const Profile = () => {
  const {
    playerName,
    stats,
    STATS,
    getOverallLevel,
    getOverallRank,
    streak,
    completedTasks,
    profilePicture,
    dispatch
  } = useGame();
  const { theme } = useTheme();
  const { currentUser } = useAuth();
  const { friends } = useFriend();
  const navigate = useNavigate();
  const [selectedStatFilter, setSelectedStatFilter] = useState('all');
  const [isEditingPicture, setIsEditingPicture] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(profilePicture);
  const [selectedTitle, setSelectedTitle] = useState(null);
  const [showTitleDropdown, setShowTitleDropdown] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);
  const titleDropdownRef = useRef(null);

  // Initialize selectedAvatar when profilePicture changes or from Auth
  useEffect(() => {
    // First check if there's a profile picture in the game state
    if (profilePicture) {
      setSelectedAvatar(profilePicture);
    } 
    // Otherwise, check if there's a photoURL in the Auth user profile
    else if (currentUser && currentUser.photoURL) {
      setSelectedAvatar(currentUser.photoURL);
      // Update the Redux state as well
      dispatch({
        type: 'SET_PROFILE_PICTURE',
        payload: currentUser.photoURL
      });
    }
  }, [profilePicture, currentUser]);

  // Load selected title
  useEffect(() => {
    const loadUserTitle = async () => {
      if (!currentUser) return;
      
      try {
        const result = await getUserTitles(currentUser.uid);
        if (result.success) {
          setSelectedTitle(result.selectedTitle);
        }
      } catch (error) {
        console.error('Error loading user title:', error);
      }
    };
    
    loadUserTitle();
  }, [currentUser]);
  
  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (titleDropdownRef.current && !titleDropdownRef.current.contains(event.target)) {
        setShowTitleDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle title dropdown
  const toggleTitleDropdown = () => {
    setShowTitleDropdown(!showTitleDropdown);
  };

  // Default avatars for users to select from
  const defaultAvatars = [
    null, // No avatar option
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=b6e3f4',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Daisy&backgroundColor=d1d4f9',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Max&backgroundColor=c0aede',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Zoe&backgroundColor=ffdfbf',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Jasper&backgroundColor=ffd5dc',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Luna&backgroundColor=c1e1c5',
  ];

  // Handle custom image upload
  const handleImageUpload = (event) => {
    setUploadError(null);
    const file = event.target.files[0];
    if (!file) return;

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image is too large. Please select an image under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedAvatar(reader.result);
    };
    reader.onerror = () => {
      setUploadError("Failed to read the selected file. Please try again.");
    };
    reader.readAsDataURL(file);
  };

  // Save the selected profile picture
  const handleSaveProfilePicture = async () => {
    console.log("Save profile picture clicked");
    console.log("Current user:", currentUser);
    console.log("Selected avatar type:", typeof selectedAvatar);
    setUploadError(null);
    
    try {
      // Only upload custom images, not default avatars
      if (selectedAvatar && !defaultAvatars.includes(selectedAvatar)) {
        // Show loading indicator
        setIsUploading(true);
        
        console.log("Uploading custom image");
        // Upload to Firebase Storage and get URL
        const imageUrl = await uploadProfilePicture(selectedAvatar);
        console.log("Got image URL:", imageUrl);
        
        // Save URL to game state
        dispatch({
          type: 'SET_PROFILE_PICTURE',
          payload: imageUrl
        });
        console.log("Dispatched SET_PROFILE_PICTURE action");
      } else {
        // For default avatars, just save directly
        console.log("Saving default avatar:", selectedAvatar);
        dispatch({
          type: 'SET_PROFILE_PICTURE',
          payload: selectedAvatar
        });
        console.log("Dispatched SET_PROFILE_PICTURE for default avatar");
      }
      
      setIsEditingPicture(false);
    } catch (error) {
      console.error("Failed to save profile picture:", error);
      // Show error message to user
      setUploadError(error.message || "Failed to save profile picture. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  // Debug function to test storage
  const testStorage = async () => {
    try {
      setIsUploading(true);
      setUploadError(null);
      const result = await testStorageConnection();
      console.log(result);
      alert('Storage connection test: ' + result);
    } catch (error) {
      console.error('Storage test failed:', error);
      setUploadError(error.message);
      alert('Storage test failed: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Calculate account creation date from the first completed task
  const accountCreationDate = completedTasks.length > 0
    ? new Date(completedTasks.reduce((oldest, task) => {
        const taskDate = new Date(task.completedAt);
        return taskDate < oldest ? taskDate : oldest;
      }, new Date()))
    : new Date();

  // Calculate days since started
  const daysSinceStarted = differenceInDays(new Date(), accountCreationDate);

  // Prepare data for radar chart using lifetimePoints
  const radarData = STATS.map(stat => ({
    stat: stat.name,
    points: stats[stat.id].lifetimePoints || 0, // Use lifetimePoints instead of current points
    level: stats[stat.id].level,
    fullMark: Math.max(...Object.values(stats).map(s => s.lifetimePoints || 0)) * 1.2, // Scale for better visualization
    icon: stat.icon,
    id: stat.id,
  }));

  // Get recent completed tasks
  const recentTasks = [...completedTasks]
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
    .filter(task => selectedStatFilter === 'all' || task.statId === selectedStatFilter)
    .slice(0, 10);

  return (
    <div className="animate-fade-in">
      {/* User Information Section */}
      <section style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h2 className="text-2xl mb-md">Profile</h2>
        <div className="card">
          {/* Profile header - centered */}
          <div style={{ 
            textAlign: 'center',
            width: '100%',
            marginBottom: 'var(--spacing-xl)',
          }}>
            {/* Profile Picture */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--spacing-md)' }}>
              {isEditingPicture ? (
                <div style={{ maxWidth: '500px', width: '100%' }}>
                  <div style={{ 
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: 'var(--spacing-md)'
                  }}>
                    <ProfilePicture 
                      size="large"
                      src={selectedAvatar}
                      showBorder={true}
                    />
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    justifyContent: 'center', 
                    gap: 'var(--spacing-sm)', 
                    marginBottom: 'var(--spacing-md)'
                  }}>
                    {defaultAvatars.map((avatar, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          setSelectedAvatar(avatar);
                          setUploadError(null);
                        }}
                        style={{
                          border: selectedAvatar === avatar ? `2px solid ${theme.primary}` : '2px solid transparent',
                          borderRadius: '50%',
                          padding: '3px',
                          cursor: 'pointer'
                        }}
                      >
                        <ProfilePicture
                          size="small"
                          src={avatar}
                          showBorder={false}
                        />
                      </div>
                    ))}
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 'var(--spacing-sm)',
                    maxWidth: '300px',
                    margin: '0 auto'
                  }}>
                    <button
                      className="btn btn-outline"
                      onClick={handleUploadClick}
                      style={{ width: '100%' }}
                      disabled={isUploading}
                    >
                      Upload Image
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={testStorage}
                      style={{ width: '100%', backgroundColor: 'rgba(255, 0, 0, 0.1)' }}
                      disabled={isUploading}
                    >
                      Test Storage (Debug)
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleImageUpload}
                    />
                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                      <button
                        className="btn btn-primary"
                        onClick={handleSaveProfilePicture}
                        style={{ flex: 1 }}
                        disabled={isUploading}
                      >
                        {isUploading ? 'Uploading...' : 'Save'}
                      </button>
                      <button
                        className="btn btn-outline"
                        onClick={() => {
                          setIsEditingPicture(false);
                          setSelectedAvatar(profilePicture);
                          setUploadError(null);
                        }}
                        style={{ flex: 1 }}
                        disabled={isUploading}
                      >
                        Cancel
                      </button>
                    </div>
                    {isUploading && (
                      <div style={{ textAlign: 'center', marginTop: 'var(--spacing-xs)' }}>
                        <small style={{ opacity: 0.7 }}>Please wait while your image uploads...</small>
                      </div>
                    )}
                    {uploadError && (
                      <div style={{ 
                        textAlign: 'center', 
                        marginTop: 'var(--spacing-xs)', 
                        color: '#e53935',
                        backgroundColor: 'rgba(229, 57, 53, 0.1)',
                        padding: '8px',
                        borderRadius: '4px'
                      }}>
                        <small>{uploadError}</small>
                      </div>
                    )}
                    <div style={{ textAlign: 'center', marginTop: 'var(--spacing-xs)' }}>
                      <small style={{ opacity: 0.7 }}>Current profile URL: {profilePicture || "None"}</small>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <small style={{ opacity: 0.7 }}>Auth status: {currentUser ? "Logged in" : "Not logged in"}</small>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <ProfilePicture
                    size="large"
                    src={profilePicture}
                    onClick={() => setIsEditingPicture(true)}
                  />
                  <div>
                    <button
                      className="btn btn-outline mt-md"
                      style={{ padding: '4px 8px', fontSize: '0.9rem' }}
                      onClick={() => setIsEditingPicture(true)}
                    >
                      Change Picture
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Player Name */}
            <h1 className="text-3xl font-bold">{playerName}</h1>
            
            {/* User Title with Dropdown */}
            <div style={{ marginTop: 'var(--spacing-md)', position: 'relative' }} ref={titleDropdownRef}>
              {selectedTitle && (
                <div style={{ marginBottom: 'var(--spacing-xs)' }}>
                  <TitleDisplay
                    titleId={selectedTitle}
                    size="medium"
                  />
                </div>
              )}
              
              <button
                className="btn btn-outline btn-sm"
                onClick={toggleTitleDropdown}
                style={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                {selectedTitle ? 'Change Title' : 'Select Title'}
                <span style={{ fontSize: '0.8em' }}>▼</span>
              </button>
              
              {/* Dropdown Content */}
              {showTitleDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '300px',
                  maxWidth: '90vw',
                  backgroundColor: theme.card,
                  borderRadius: 'var(--border-radius-md)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                  zIndex: 10,
                  marginTop: 'var(--spacing-sm)',
                  border: `1px solid ${theme.border}`,
                  paddingBottom: 'var(--spacing-md)'
                }}>
                  <div style={{ padding: 'var(--spacing-sm)' }}>
                    <TitlesManager />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-md">
            <div style={{ 
              padding: 'var(--spacing-md)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 'var(--border-radius-md)',
              textAlign: 'center'
            }}>
              <div className="text-sm mb-xs" style={{ opacity: 0.8 }}>Level</div>
              <div className="text-xl font-bold">{getOverallLevel()}</div>
            </div>

            <div style={{ 
              padding: 'var(--spacing-md)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 'var(--border-radius-md)',
              textAlign: 'center'
            }}>
              <div className="text-sm mb-xs" style={{ opacity: 0.8 }}>Rank</div>
              <div className="text-xl font-bold">{getOverallRank()}</div>
            </div>

            <div style={{ 
              padding: 'var(--spacing-md)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 'var(--border-radius-md)',
              textAlign: 'center'
            }}>
              <div className="text-sm mb-xs" style={{ opacity: 0.8 }}>Streak</div>
              <div className="text-xl font-bold">🔥 {streak.current} day{streak.current !== 1 ? 's' : ''}</div>
            </div>

            <div style={{ 
              padding: 'var(--spacing-md)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 'var(--border-radius-md)',
              textAlign: 'center'
            }}>
              <div className="text-sm mb-xs" style={{ opacity: 0.8 }}>Friends</div>
              <div 
                className="text-xl font-bold" 
                onClick={() => setShowFriendsModal(true)}
                style={{
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  borderRadius: 'var(--border-radius-md)',
                  transition: 'all 0.2s ease',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                👥 {friends.length} {friends.length === 1 ? 'friend' : 'friends'}
              </div>
            </div>

            <div style={{ 
              padding: 'var(--spacing-md)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 'var(--border-radius-md)',
              textAlign: 'center'
            }}>
              <div className="text-sm mb-xs" style={{ opacity: 0.8 }}>Days Active</div>
              <div className="text-xl font-bold">{daysSinceStarted}</div>
            </div>
          </div>

          <div 
            style={{ 
              marginTop: 'var(--spacing-md)',
              padding: 'var(--spacing-md)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 'var(--border-radius-md)',
              textAlign: 'center'
            }}
          >
            <div className="text-sm mb-xs" style={{ opacity: 0.8 }}>Member Since</div>
            <div>{format(accountCreationDate, 'MMMM d, yyyy')}</div>
            <div className="text-sm" style={{ opacity: 0.8, marginTop: 'var(--spacing-xs)' }}>
              {completedTasks.length} Task{completedTasks.length !== 1 ? 's' : ''} Completed
            </div>
          </div>
        </div>
      </section>

      {/* Stats Visualization Section */}
      <section style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h2 className="text-2xl mb-md">Stats Visualization</h2>
        <div className="card">
          <div style={{ height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart 
                cx="50%" 
                cy="50%" 
                outerRadius="80%" 
                data={radarData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <PolarGrid 
                  stroke={theme.text} 
                  strokeOpacity={0.4}
                  strokeDasharray="3 3"
                  strokeWidth={1.5}
                />
                <PolarAngleAxis 
                  dataKey="stat" 
                  tick={(props) => {
                    const { x, y, payload } = props;
                    const statData = radarData.find(item => item.stat === payload.value);
                    const statIcon = statData ? statData.icon : '';
                    
                    return (
                      <g transform={`translate(${x},${y})`}>
                        <text 
                          x={0} 
                          y={0} 
                          dy={5} 
                          textAnchor="middle" 
                          fill={theme.text}
                          fontSize="14"
                          fontWeight="600"
                        >
                          {statIcon} {payload.value}
                        </text>
                      </g>
                    );
                  }}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 'auto']} 
                  axisLine={{ stroke: theme.text, strokeOpacity: 0.5 }}
                  tick={{
                    fill: theme.text,
                    fontSize: 12,
                    fontWeight: 'bold'
                  }}
                  tickCount={5}
                  stroke={theme.text}
                  strokeOpacity={0.7}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      
                      return (
                        <div style={{
                          backgroundColor: theme.card,
                          border: `1px solid ${theme.border}`,
                          padding: '12px',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                        }}>
                          <p style={{ 
                            margin: 0, 
                            fontSize: '16px', 
                            fontWeight: 'bold',
                            marginBottom: '4px',
                            color: theme.primary
                          }}>
                            {data.icon} {data.stat}
                          </p>
                          <p style={{ margin: '4px 0', color: theme.text }}>
                            Lifetime Points: <span style={{ fontWeight: 'bold' }}>{data.points}</span>
                          </p>
                          <p style={{ margin: '4px 0', color: theme.text }}>
                            Level: <span style={{ fontWeight: 'bold' }}>{data.level}</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Radar
                  name="Stats"
                  dataKey="points"
                  stroke={theme.primary}
                  strokeWidth={2.5}
                  fill={theme.primary}
                  fillOpacity={0.7}
                  animationBegin={0}
                  animationDuration={1000}
                  animationEasing="ease-out"
                />
                <Legend 
                  formatter={() => 'Lifetime Points Distribution'} 
                  wrapperStyle={{ color: theme.text, fontWeight: 'bold' }}
                  iconSize={14}
                  iconType="square"
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-md mt-lg">
            {STATS.map(stat => {
              const statData = stats[stat.id];
              return (
                <div 
                  key={stat.id}
                  style={{ 
                    textAlign: 'center', 
                    padding: '12px', 
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 'var(--border-radius-md)',
                    borderBottom: `3px solid ${theme.primary}`,
                  }}
                  className="animate-fade-in"
                >
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>{stat.icon}</div>
                  <div style={{ fontWeight: 'bold' }}>{stat.name}</div>
                  <div className="text-sm">Level {statData.level}</div>
                  <div className="text-xs mt-sm" style={{ color: theme.primary }}>
                    Current: {statData.points} points
                  </div>
                  <div className="text-xs" style={{ color: theme.accent }}>
                    Lifetime: {statData.lifetimePoints || 0} points
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recent Activity Section */}
      <section>
        <div className="flex justify-between items-center mb-md">
          <h2 className="text-2xl">Recent Activity</h2>
          <div>
            <select
              value={selectedStatFilter}
              onChange={(e) => setSelectedStatFilter(e.target.value)}
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                color: theme.text,
                border: `1px solid ${theme.border}`,
                borderRadius: 'var(--border-radius-md)',
                padding: '6px 12px'
              }}
            >
              <option value="all">All Stats</option>
              {STATS.map(stat => (
                <option key={stat.id} value={stat.id}>
                  {stat.icon} {stat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {recentTasks.length > 0 ? (
          <div className="card">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: 'var(--spacing-sm)', borderBottom: `1px solid ${theme.border}` }}>Task</th>
                  <th style={{ textAlign: 'left', padding: 'var(--spacing-sm)', borderBottom: `1px solid ${theme.border}` }} className="hidden md:table-cell">Type</th>
                  <th style={{ textAlign: 'left', padding: 'var(--spacing-sm)', borderBottom: `1px solid ${theme.border}` }}>Stat</th>
                  <th style={{ textAlign: 'right', padding: 'var(--spacing-sm)', borderBottom: `1px solid ${theme.border}` }}>Points</th>
                  <th style={{ textAlign: 'right', padding: 'var(--spacing-sm)', borderBottom: `1px solid ${theme.border}` }}>Completed</th>
                </tr>
              </thead>
              <tbody>
                {recentTasks.map(task => {
                  const statInfo = STATS.find(s => s.id === task.statId);
                  return (
                    <tr key={task.id}>
                      <td style={{ padding: 'var(--spacing-sm)', borderBottom: `1px solid ${theme.border}` }}>{task.name}</td>
                      <td style={{ padding: 'var(--spacing-sm)', borderBottom: `1px solid ${theme.border}` }} className="hidden md:table-cell">
                        {task.type}
                      </td>
                      <td style={{ padding: 'var(--spacing-sm)', borderBottom: `1px solid ${theme.border}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                          <span>{statInfo.icon}</span>
                          <span className="hidden sm:inline">{statInfo.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: 'var(--spacing-sm)', textAlign: 'right', borderBottom: `1px solid ${theme.border}` }}>
                        <div>
                          +{task.points}
                          {task.bonusPoints > 0 && (
                            <span style={{ color: theme.accent, fontSize: '0.75rem', marginLeft: '4px' }}>
                              (+{task.bonusPoints})
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: 'var(--spacing-sm)', textAlign: 'right', borderBottom: `1px solid ${theme.border}` }}>
                        {format(new Date(task.completedAt), 'MMM d, yyyy')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card text-center">
            <p>No tasks found with the selected filter.</p>
          </div>
        )}
      </section>

      {/* Friends Modal */}
      {showFriendsModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 'var(--spacing-md)',
        }}>
          <div style={{
            backgroundColor: theme.card,
            borderRadius: 'var(--border-radius-lg)',
            boxShadow: 'var(--shadow-xl)',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflowY: 'auto',
            position: 'relative',
          }}>
            <button 
              style={{
                position: 'absolute',
                top: 'var(--spacing-md)',
                right: 'var(--spacing-md)',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: theme.text,
                opacity: 0.7,
              }}
              onClick={() => setShowFriendsModal(false)}
            >
              ✕
            </button>
            
            <div style={{ padding: 'var(--spacing-lg)' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: 'var(--spacing-md)' 
              }}>
                <h2 style={{ margin: 0 }}>Your Friends</h2>
                
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setShowFriendsModal(false);
                    navigate('/social/friends');
                  }}
                >
                  Manage Friends
                </button>
              </div>
              
              {friends.length > 0 ? (
                <div className="space-y-md">
                  {friends.map((friend) => (
                    <FriendItem 
                      key={friend.userId} 
                      friendId={friend.userId} 
                      friendSince={friend.friendSince}
                      onClick={() => {
                        setShowFriendsModal(false);
                        navigate(`/social/friend/${friend.userId}`);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: 'var(--spacing-xl)', 
                  opacity: 0.8 
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
                  <p>You don't have any friends yet.</p>
                  <button 
                    className="btn btn-primary mt-md"
                    onClick={() => {
                      setShowFriendsModal(false);
                      navigate('/social');
                    }}
                  >
                    Find Friends
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Component to display a single friend item with their basic info
 */
const FriendItem = ({ friendId, friendSince, onClick }) => {
  const { theme } = useTheme();
  const [friendData, setFriendData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFriendData = async () => {
      try {
        const docRef = doc(db, 'gameStates', friendId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setFriendData(docSnap.data());
        }
      } catch (error) {
        console.error('Error loading friend data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFriendData();
  }, [friendId]);

  if (loading) {
    return (
      <div style={{
        padding: 'var(--spacing-md)',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 'var(--border-radius-md)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-md)',
      }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}></div>
        <div style={{ flex: 1 }}>
          <div style={{ height: '18px', width: '120px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', marginBottom: '8px' }}></div>
          <div style={{ height: '14px', width: '80px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px' }}></div>
        </div>
      </div>
    );
  }

  // Calculate level and rank if friend data exists
  let level = 1;
  let rank = 'Beginner';
  
  if (friendData && friendData.stats) {
    const totalLevel = Object.values(friendData.stats).reduce((sum, stat) => sum + stat.level, 0);
    level = Math.floor(totalLevel / Object.keys(friendData.stats).length);
    
    // Get rank based on level (simplified version)
    const RANKS = [
      { name: 'Beginner', range: [0, 9] },
      { name: 'Novice', range: [10, 19] },
      { name: 'Apprentice', range: [20, 29] },
      { name: 'Adept', range: [30, 39] },
      { name: 'Expert', range: [40, 49] },
      { name: 'Master', range: [50, 59] },
      { name: 'Grandmaster', range: [60, 69] },
      { name: 'Legend', range: [70, 79] },
      { name: 'Mythic', range: [80, 89] },
      { name: 'Sovereign', range: [90, 99] },
      { name: 'Transcendent', range: [100, Infinity] }
    ];
    
    for (const rankInfo of RANKS) {
      if (level >= rankInfo.range[0] && level <= rankInfo.range[1]) {
        rank = rankInfo.name;
        break;
      }
    }
  }

  return (
    <div 
      style={{
        padding: 'var(--spacing-md)',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 'var(--border-radius-md)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-md)',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
      }}
      onClick={onClick}
      onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'}
      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
    >
      <ProfilePicture 
        size="medium"
        src={friendData?.profilePicture}
      />
      
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>
          {friendData?.playerName || 'Unknown Player'}
        </div>
        <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>
          Level {level} {rank}
        </div>
        <div style={{ fontSize: '0.75rem', marginTop: '4px', opacity: 0.6 }}>
          Friends since {new Date(friendSince).toLocaleDateString()}
        </div>
      </div>
      
      <div style={{ 
        width: '24px', 
        height: '24px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: theme.text,
        opacity: 0.6
      }}>
        ❯
      </div>
    </div>
  );
};

export default Profile;