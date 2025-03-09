import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { useTheme } from '../contexts/ThemeContext';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

// Import a radar chart from recharts
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const Stats = () => {
  const { 
    stats, 
    STATS, 
    getPointsToNextLevel,
    getRank,
    taskHistory
  } = useGame();
  const { theme } = useTheme();
  const [selectedStat, setSelectedStat] = useState(null);
  
  // Prepare data for radar chart - transform the data for better visualization
  const radarData = STATS.map(stat => ({
    stat: stat.name,
    level: stats[stat.id].level,
    fullMark: 100,
    icon: stat.icon
  }));
  
  // Prepare data for selected stat
  const getStatHistory = (statId) => {
    if (!statId) return [];
    
    // Get tasks for this stat, sorted by completion date
    const statTasks = taskHistory
      .filter(task => task.statId === statId)
      .sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));
    
    // Group by day
    const byDay = statTasks.reduce((acc, task) => {
      const day = format(new Date(task.completedAt), 'yyyy-MM-dd');
      if (!acc[day]) {
        acc[day] = {
          date: day,
          points: 0,
          tasks: []
        };
      }
      
      acc[day].points += task.points;
      acc[day].tasks.push(task);
      
      return acc;
    }, {});
    
    // Convert to array and return the last 14 days
    return Object.values(byDay)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 14)
      .reverse();
  };
  
  const selectedStatHistory = getStatHistory(selectedStat);
  
  return (
    <div className="animate-fade-in">
      <section style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h2 className="text-2xl mb-md">Stat Overview</h2>
        
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
                  stroke={theme.border} 
                  strokeOpacity={0.3}
                  strokeDasharray="3 3"
                />
                <PolarAngleAxis 
                  dataKey="stat" 
                  tick={(props) => {
                    const { x, y, payload, cx, cy } = props;
                    const statData = radarData.find(item => item.stat === payload.value);
                    const statIcon = statData ? statData.icon : '';
                    
                    // We don't need custom positioning calculations
                    
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
                  domain={[0, 100]} 
                  axisLine={false}
                  tick={{
                    fill: theme.text,
                    fontSize: 12
                  }}
                  tickCount={5}
                  style={{
                    opacity: 0.6
                  }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const statRank = getRank(data.level);
                      
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
                            Level: <span style={{ fontWeight: 'bold' }}>{data.level}</span>
                          </p>
                          <p style={{ margin: '4px 0', color: theme.text }}>
                            Rank: <span style={{ fontWeight: 'bold' }}>{statRank}</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Radar
                  name="Stats"
                  dataKey="level"
                  stroke={theme.primary}
                  fill={theme.primary}
                  fillOpacity={0.6}
                  animationBegin={0}
                  animationDuration={1000}
                  animationEasing="ease-out"
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
                    cursor: 'pointer',
                    borderBottom: `3px solid ${theme.primary}`,
                    transition: 'all var(--transition-fast)'
                  }}
                  onClick={() => setSelectedStat(stat.id === selectedStat ? null : stat.id)}
                  className="animate-fade-in"
                >
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>{stat.icon}</div>
                  <div style={{ fontWeight: 'bold' }}>{stat.name}</div>
                  <div>Level {statData.level}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      
      <section style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h2 className="text-2xl mb-md">Your Stats</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {STATS.map(stat => {
            const statData = stats[stat.id];
            const statRank = getRank(statData.level);
            
            return (
              <div 
                key={stat.id} 
                className="card" 
                style={{ 
                  cursor: 'pointer',
                  borderLeft: selectedStat === stat.id ? `3px solid ${theme.primary}` : 'none'
                }}
                onClick={() => setSelectedStat(stat.id === selectedStat ? null : stat.id)}
              >
                <div className="flex items-center gap-md mb-md">
                  <span style={{ fontSize: '2rem' }}>{stat.icon}</span>
                  <div>
                    <h3 style={{ margin: 0 }}>{stat.name}</h3>
                    <div className="text-sm">{stat.description}</div>
                  </div>
                </div>
                
                <div style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                  padding: 'var(--spacing-md)',
                  borderRadius: 'var(--border-radius-md)',
                  marginBottom: 'var(--spacing-md)'
                }}>
                  <div className="flex justify-between mb-sm">
                    <span className="text-lg">Level {statData.level}</span>
                    <span>{statRank}</span>
                  </div>
                  
                  <div className="progress-bar">
                    <div 
                      className="progress-bar-fill"
                      style={{ 
                        width: `${(statData.points / getPointsToNextLevel(statData.level)) * 100}%`,
                        backgroundColor: theme.primary
                      }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-sm mt-sm">
                    <span>{statData.points} / {getPointsToNextLevel(statData.level)}</span>
                    <span>{Math.floor((statData.points / getPointsToNextLevel(statData.level)) * 100)}%</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span 
                    className="text-sm"
                    style={{ color: theme.text, opacity: 0.7 }}
                  >
                    Click to {selectedStat === stat.id ? 'hide' : 'view'} details
                  </span>
                  
                  <Link
                    to="/tasks"
                    state={{ statId: stat.id }}
                    className="btn btn-outline"
                    style={{ textDecoration: 'none', padding: '4px 8px' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Add Task
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      
      {selectedStat && (
        <section className="animate-slide-in">
          <div className="flex items-center gap-md mb-md">
            <h2 className="text-2xl" style={{ margin: 0 }}>
              {STATS.find(s => s.id === selectedStat).icon} {STATS.find(s => s.id === selectedStat).name} History
            </h2>
          </div>
          
          <div className="card">
            <div style={{ height: '300px' }}>
              {selectedStatHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={selectedStatHistory}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                    <XAxis 
                      dataKey="date" 
                      stroke={theme.text}
                      tickFormatter={(date) => format(new Date(date), 'MMM d')} 
                    />
                    <YAxis stroke={theme.text} />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: theme.card, 
                        borderColor: theme.border,
                        color: theme.text
                      }}
                      formatter={(value) => [`${value} points`, 'Points']}
                      labelFormatter={(date) => format(new Date(date), 'MMMM d, yyyy')}
                    />
                    <Bar 
                      dataKey="points" 
                      name="Points" 
                      fill={theme.primary} 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <p>No history available for this stat.</p>
                  <Link
                    to="/tasks"
                    state={{ statId: selectedStat }}
                    className="btn btn-primary mt-md"
                    style={{ textDecoration: 'none' }}
                  >
                    Add Your First Task
                  </Link>
                </div>
              )}
            </div>
            
            {selectedStatHistory.length > 0 && (
              <div style={{ marginTop: 'var(--spacing-xl)' }}>
                <h3>Recent Activity</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: 'var(--spacing-sm)', borderBottom: `1px solid ${theme.border}` }}>Date</th>
                      <th style={{ textAlign: 'left', padding: 'var(--spacing-sm)', borderBottom: `1px solid ${theme.border}` }}>Task</th>
                      <th style={{ textAlign: 'right', padding: 'var(--spacing-sm)', borderBottom: `1px solid ${theme.border}` }}>Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedStatHistory.flatMap(day => 
                      day.tasks.map(task => (
                        <tr key={task.id}>
                          <td style={{ padding: 'var(--spacing-sm)', borderBottom: `1px solid ${theme.border}` }}>
                            {format(new Date(task.completedAt), 'MMM d, yyyy')}
                          </td>
                          <td style={{ padding: 'var(--spacing-sm)', borderBottom: `1px solid ${theme.border}` }}>
                            {task.name} <span style={{ opacity: 0.7, fontSize: '0.8rem' }}>({task.type})</span>
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
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default Stats;
