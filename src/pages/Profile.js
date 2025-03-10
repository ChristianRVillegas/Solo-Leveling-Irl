import React, { useState, useRef } from 'react';
import { useGame } from '../contexts/GameContext';
import { useTheme } from '../contexts/ThemeContext';
import { format, differenceInDays } from 'date-fns';
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
  const [selectedStatFilter, setSelectedStatFilter] = useState('all');
  const [isEditingPicture, setIsEditingPicture] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(profilePicture);
  const fileInputRef = useRef(null);

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
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedAvatar(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Save the selected profile picture
  const handleSaveProfilePicture = () => {
    dispatch({
      type: 'SET_PROFILE_PICTURE',
      payload: selectedAvatar
    });
    setIsEditingPicture(false);
  };

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current.click();
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
                        onClick={() => setSelectedAvatar(avatar)}
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
                    >
                      Upload Image
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
                      >
                        Save
                      </button>
                      <button
                        className="btn btn-outline"
                        onClick={() => {
                          setIsEditingPicture(false);
                          setSelectedAvatar(profilePicture);
                        }}
                        style={{ flex: 1 }}
                      >
                        Cancel
                      </button>
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
    </div>
  );
};

export default Profile;