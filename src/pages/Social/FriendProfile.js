import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../../contexts/GameContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useFriend } from '../../contexts/FriendContext';
import { db } from '../../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import ProfilePicture from '../../components/ProfilePicture';
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

/**
 * Friend Profile component that displays detailed information about a friend
 */
const FriendProfile = () => {
  const { friendId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { currentUser } = useAuth();
  const { 
    STATS, 
    stats: currentUserStats, 
    getOverallLevel: getCurrentUserLevel, 
    getOverallRank: getCurrentUserRank,
    playerName: currentPlayerName
  } = useGame();
  const { sendFriendRequest, friends, sentRequests } = useFriend();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [friendData, setFriendData] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isFriend, setIsFriend] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [sending, setSending] = useState(false);
  
  // Fetch friend's data
  useEffect(() => {
    const fetchFriendData = async () => {
      if (!friendId) {
        setError('User ID is missing');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Check if this is a friend or has pending request
        if (friends && friends.length > 0) {
          const isFriendFound = friends.some(f => f.userId === friendId);
          setIsFriend(isFriendFound);
        }
        
        if (sentRequests && sentRequests.length > 0) {
          const isRequestSent = sentRequests.some(r => r.id === friendId);
          setRequestSent(isRequestSent);
        }
        
        // Get user's game state
        const gameStateDocRef = doc(db, 'gameStates', friendId);
        const gameStateDoc = await getDoc(gameStateDocRef);
        
        if (!gameStateDoc.exists()) {
          setError('User data not found');
          setLoading(false);
          return;
        }
        
        const friendGameState = gameStateDoc.data();
        
        // Get recent activity (completed tasks)
        if (friendGameState.completedTasks && friendGameState.completedTasks.length > 0) {
          const sortedTasks = [...friendGameState.completedTasks]
            .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
            .slice(0, 5); // Only get the 5 most recent tasks
          setRecentActivity(sortedTasks);
        }
        
        setFriendData(friendGameState);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user data');
        setLoading(false);
      }
    };
    
    fetchFriendData();
  }, [friendId, friends, sentRequests]);
  
  // Calculate overall level
  const getOverallLevel = (stats) => {
    if (!stats) return 1;
    const totalLevel = Object.values(stats).reduce((sum, stat) => sum + stat.level, 0);
    return Math.floor(totalLevel / STATS.length);
  };
  
  // Calculate overall rank
  const getOverallRank = (level) => {
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
    
    for (const rank of RANKS) {
      if (level >= rank.range[0] && level <= rank.range[1]) {
        return rank.name;
      }
    }
    
    return RANKS[0].name;
  };
  
  // Handle sending friend request
  const handleSendFriendRequest = async () => {
    if (requestSent || isFriend || !currentUser) return;
    
    try {
      setSending(true);
      const success = await sendFriendRequest(friendId);
      
      if (success) {
        setRequestSent(true);
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
    } finally {
      setSending(false);
    }
  };
  
  // Prepare data for radar chart
  const prepareRadarData = () => {
    if (!friendData || !friendData.stats) return [];
    
    return STATS.map(stat => {
      const friendStat = friendData.stats[stat.id];
      const userStat = currentUserStats[stat.id];
      
      return {
        stat: stat.name,
        friendPoints: friendStat ? friendStat.lifetimePoints || 0 : 0,
        userPoints: showComparison ? (userStat ? userStat.lifetimePoints || 0 : 0) : 0,
        friendLevel: friendStat ? friendStat.level : 1,
        userLevel: userStat ? userStat.level : 1,
        fullMark: Math.max(
          ...(Object.values(friendData.stats).map(s => s.lifetimePoints || 0)),
          ...(showComparison ? Object.values(currentUserStats).map(s => s.lifetimePoints || 0) : [0])
        ) * 1.1,
        icon: stat.icon,
        id: stat.id,
      };
    });
  };
  
  if (loading) {
    return (
      <div className="animate-fade-in text-center p-lg">
        <div className="spinner"></div>
        <p className="mt-md">Loading friend's profile...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="animate-fade-in">
        <div className="card p-lg text-center">
          <h3 className="text-xl mb-md">Error</h3>
          <p>{error}</p>
          <button 
            className="btn btn-primary mt-lg"
            onClick={() => navigate('/social')}
          >
            Back to Social
          </button>
        </div>
      </div>
    );
  }
  
  if (!friendData) {
    return (
      <div className="animate-fade-in">
        <div className="card p-lg text-center">
          <h3 className="text-xl mb-md">Friend Not Found</h3>
          <p>We couldn't find the friend you're looking for.</p>
          <button 
            className="btn btn-primary mt-lg"
            onClick={() => navigate('/social')}
          >
            Back to Social
          </button>
        </div>
      </div>
    );
  }
  
  const friendLevel = getOverallLevel(friendData.stats);
  const friendRank = getOverallRank(friendLevel);
  
  return (
    <div className="animate-fade-in">
      {/* Back button */}
      <div className="flex justify-between items-center mb-md">
        <div>
          <button 
            className="btn btn-outline"
            onClick={() => navigate('/social')}
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}
          >
            ← Back to Social
          </button>
        </div>
        <h2 className="text-2xl">
          {isFriend ? 'Friend Profile' : 'User Profile'}
        </h2>
      </div>
    
      {/* Profile Header */}
      <section style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div className="card">
          <div style={{ 
            textAlign: 'center',
            width: '100%',
            marginBottom: 'var(--spacing-md)',
          }}>
            {/* Profile Picture */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--spacing-md)' }}>
              <ProfilePicture
                size="large"
                src={friendData.profilePicture}
              />
            </div>
            
            {/* Player Name */}
            <h1 className="text-3xl font-bold">{friendData.playerName}</h1>
            <p className="text-lg">Level {friendLevel} {friendRank}</p>
            
            {/* Friend Status/Action */}
            {currentUser && currentUser.uid !== friendId && (
              <div style={{ marginTop: 'var(--spacing-md)' }}>
                {isFriend ? (
                  <div className="inline-flex items-center px-md py-sm rounded-full" style={{ 
                    backgroundColor: 'rgba(76, 175, 80, 0.1)', 
                    color: '#4CAF50',
                    border: '1px solid #4CAF50'
                  }}>
                    <span className="mr-xs">✓</span> Friends
                  </div>
                ) : requestSent ? (
                  <div className="inline-flex items-center px-md py-sm rounded-full" style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                    color: theme.text,
                    border: '1px solid ' + theme.border
                  }}>
                    <span className="mr-xs">✉️</span> Friend Request Sent
                  </div>
                ) : (
                  <button 
                    className="btn btn-primary"
                    onClick={handleSendFriendRequest}
                    disabled={sending}
                  >
                    {sending ? 'Sending...' : 'Add Friend'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
            <div style={{ 
              padding: 'var(--spacing-md)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 'var(--border-radius-md)',
              textAlign: 'center'
            }}>
              <div className="text-sm mb-xs" style={{ opacity: 0.8 }}>Level</div>
              <div className="text-xl font-bold">{friendLevel}</div>
            </div>

            <div style={{ 
              padding: 'var(--spacing-md)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 'var(--border-radius-md)',
              textAlign: 'center'
            }}>
              <div className="text-sm mb-xs" style={{ opacity: 0.8 }}>Rank</div>
              <div className="text-xl font-bold">{friendRank}</div>
            </div>

            <div style={{ 
              padding: 'var(--spacing-md)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 'var(--border-radius-md)',
              textAlign: 'center'
            }}>
              <div className="text-sm mb-xs" style={{ opacity: 0.8 }}>Streak</div>
              <div className="text-xl font-bold">
                🔥 {friendData.streak?.current || 0} day{(friendData.streak?.current || 0) !== 1 ? 's' : ''}
              </div>
            </div>

            <div style={{ 
              padding: 'var(--spacing-md)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 'var(--border-radius-md)',
              textAlign: 'center'
            }}>
              <div className="text-sm mb-xs" style={{ opacity: 0.8 }}>Tasks Completed</div>
              <div className="text-xl font-bold">
                {friendData.completedTasks?.length || 0}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Stats Visualization with Comparison Toggle */}
      <section style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div className="flex justify-between items-center mb-md">
          <h2 className="text-2xl">Stats Visualization</h2>
          <div className="flex items-center">
            <div className="mr-xs" style={{ opacity: 0.8 }}>Show comparison</div>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={showComparison} 
                onChange={() => setShowComparison(!showComparison)}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>
        
        <div className="card">
          <div style={{ height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart 
                cx="50%" 
                cy="50%" 
                outerRadius="80%" 
                data={prepareRadarData()}
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
                    const statData = prepareRadarData().find(item => item.stat === payload.value);
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
                            {friendData.playerName}: <span style={{ fontWeight: 'bold' }}>
                              Level {data.friendLevel} ({data.friendPoints} points)
                            </span>
                          </p>
                          {showComparison && (
                            <p style={{ margin: '4px 0', color: '#4CAF50' }}>
                              You: <span style={{ fontWeight: 'bold' }}>
                                Level {data.userLevel} ({data.userPoints} points)
                              </span>
                            </p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Radar
                  name={friendData.playerName}
                  dataKey="friendPoints"
                  stroke={theme.primary}
                  strokeWidth={2.5}
                  fill={theme.primary}
                  fillOpacity={0.7}
                  animationBegin={0}
                  animationDuration={1000}
                  animationEasing="ease-out"
                />
                {showComparison && (
                  <Radar
                    name="You"
                    dataKey="userPoints"
                    stroke="#4CAF50"
                    strokeWidth={2.5}
                    fill="#4CAF50"
                    fillOpacity={0.5}
                    animationBegin={500}
                    animationDuration={1000}
                    animationEasing="ease-out"
                  />
                )}
                <Legend 
                  formatter={(value) => {
                    if (value === friendData.playerName) {
                      return friendData.playerName;
                    } else if (value === "You") {
                      return "You";
                    }
                    return value;
                  }}
                  iconSize={14}
                  iconType="square"
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Stat Cards */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-md mt-lg">
            {STATS.map(stat => {
              const friendStat = friendData.stats[stat.id] || { level: 1, lifetimePoints: 0 };
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
                  <div className="text-sm">Level {friendStat.level}</div>
                  <div className="text-xs mt-sm" style={{ color: theme.primary }}>
                    Lifetime: {friendStat.lifetimePoints || 0} points
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* Recent Activity Section */}
      <section>
        <h2 className="text-2xl mb-md">Recent Activity</h2>
        
        {recentActivity.length > 0 ? (
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
                {recentActivity.map(task => {
                  const statInfo = STATS.find(s => s.id === task.statId) || { name: 'Unknown', icon: '❓' };
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
          <div className="card p-lg text-center">
            <p>{friendData.playerName} hasn't completed any tasks yet.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default FriendProfile;