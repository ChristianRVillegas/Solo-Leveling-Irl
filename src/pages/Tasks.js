import React, { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import { useTheme } from '../contexts/ThemeContext';
import { format } from 'date-fns';
import { useLocation } from 'react-router-dom';

const Tasks = () => {
  const location = useLocation();
  const initialStatId = location.state?.statId || null;
  
  const { 
    STATS, 
    TASK_TYPES,
    tasks,
    completedTasks,
    dispatch,
    getTodaysTasks,
    getStreakBonus,
    streak
  } = useGame();
  const { theme } = useTheme();
  
  const [activeTab, setActiveTab] = useState('add');
  const [selectedStatId, setSelectedStatId] = useState(initialStatId);
  const [taskName, setTaskName] = useState('');
  const [taskType, setTaskType] = useState('regular');
  const [filterStat, setFilterStat] = useState('all');
  
  // Reset form when changing stats
  useEffect(() => {
    if (initialStatId && initialStatId !== selectedStatId) {
      setSelectedStatId(initialStatId);
    }
  }, [initialStatId]);
  
  const handleAddTask = (e) => {
    e.preventDefault();
    
    if (!taskName.trim() || !selectedStatId || !taskType) {
      return;
    }
    
    dispatch({
      type: 'ADD_TASK',
      payload: {
        name: taskName.trim(),
        statId: selectedStatId,
        type: taskType
      }
    });
    
    // Reset form
    setTaskName('');
    setTaskType('regular');
  };
  
  const handleCompleteTask = (taskId) => {
    dispatch({
      type: 'COMPLETE_TASK',
      payload: { taskId }
    });
  };
  
  const handleDeleteTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      dispatch({
        type: 'DELETE_TASK',
        payload: taskId
      });
    }
  };
  
  // Filter tasks by stat
  const filteredTasks = tasks.filter(task => 
    filterStat === 'all' || task.statId === filterStat
  );
  
  // Get today's completed tasks
  const todaysTasks = getTodaysTasks();
  
  // Get tasks completed in the last 7 days
  const last7DaysTasks = completedTasks.filter(task => {
    const taskDate = new Date(task.completedAt);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return taskDate >= sevenDaysAgo;
  });
  
  // Calculate current streak bonus
  const streakBonusPercent = streak.current >= 3 ? getStreakBonus(streak.current) * 100 : 0;
  
  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl mb-md">Tasks</h2>
      
      <div className="card mb-lg">
        <div style={{ 
          display: 'flex', 
          gap: 'var(--spacing-md)',
          borderBottom: `1px solid ${theme.border}`,
          marginBottom: 'var(--spacing-lg)'
        }}>
          <button
            className={`btn ${activeTab === 'add' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('add')}
          >
            Add New Task
          </button>
          <button
            className={`btn ${activeTab === 'current' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('current')}
          >
            Current Tasks
          </button>
          <button
            className={`btn ${activeTab === 'completed' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('completed')}
          >
            Completed
          </button>
        </div>
        
        {activeTab === 'add' && (
          <form onSubmit={handleAddTask}>
            <div className="form-group">
              <label htmlFor="taskName" className="form-label">Task Name</label>
              <input
                type="text"
                id="taskName"
                className="form-input"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="E.g., '30-minute jog' or 'Read for 15 minutes'"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="form-group">
                <label htmlFor="statId" className="form-label">Stat Category</label>
                <select
                  id="statId"
                  className="form-select"
                  value={selectedStatId || ''}
                  onChange={(e) => setSelectedStatId(e.target.value)}
                  required
                >
                  <option value="" disabled>Select a stat</option>
                  {STATS.map(stat => (
                    <option key={stat.id} value={stat.id}>{stat.icon} {stat.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="taskType" className="form-label">Task Difficulty</label>
                <select
                  id="taskType"
                  className="form-select"
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value)}
                  required
                >
                  {Object.values(TASK_TYPES).map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name} ({type.points} pts | {type.timeRequired})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {streak.current >= 3 && (
              <div style={{ 
                backgroundColor: 'rgba(249, 115, 22, 0.1)', 
                padding: 'var(--spacing-md)',
                borderRadius: 'var(--border-radius-md)',
                marginBottom: 'var(--spacing-lg)',
                borderLeft: `3px solid ${theme.accent}`
              }}>
                <p>
                  <span style={{ color: theme.accent }}>+{streakBonusPercent}% Streak Bonus</span> will be applied when you complete this task!
                </p>
              </div>
            )}
            
            <button type="submit" className="btn btn-primary">
              Add Task
            </button>
          </form>
        )}
        
        {activeTab === 'current' && (
          <>
            <div className="form-group">
              <label htmlFor="filterStat" className="form-label">Filter by Stat</label>
              <select
                id="filterStat"
                className="form-select"
                value={filterStat}
                onChange={(e) => setFilterStat(e.target.value)}
              >
                <option value="all">All Stats</option>
                {STATS.map(stat => (
                  <option key={stat.id} value={stat.id}>{stat.icon} {stat.name}</option>
                ))}
              </select>
            </div>
            
            {filteredTasks.length > 0 ? (
              <div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: 'var(--spacing-sm)', borderBottom: `1px solid ${theme.border}` }}>Task</th>
                      <th style={{ textAlign: 'left', padding: 'var(--spacing-sm)', borderBottom: `1px solid ${theme.border}` }}>Category</th>
                      <th style={{ textAlign: 'center', padding: 'var(--spacing-sm)', borderBottom: `1px solid ${theme.border}` }}>Points</th>
                      <th style={{ textAlign: 'right', padding: 'var(--spacing-sm)', borderBottom: `1px solid ${theme.border}` }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTasks.map(task => {
                      const taskType = TASK_TYPES[task.type.toUpperCase()];
                      const statInfo = STATS.find(s => s.id === task.statId);
                      const streakBonus = streak.current >= 3 ? getStreakBonus(streak.current) : 0;
                      const bonusPoints = Math.floor(taskType.points * streakBonus);
                      const totalPoints = taskType.points + bonusPoints;
                      
                      return (
                        <tr key={task.id}>
                          <td style={{ padding: 'var(--spacing-sm)', borderBottom: `1px solid ${theme.border}` }}>
                            {task.name}
                          </td>
                          <td style={{ padding: 'var(--spacing-sm)', borderBottom: `1px solid ${theme.border}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                              <span>{statInfo.icon}</span>
                              <span>{statInfo.name}</span>
                            </div>
                          </td>
                          <td style={{ padding: 'var(--spacing-sm)', textAlign: 'center', borderBottom: `1px solid ${theme.border}` }}>
                            {taskType.points}
                            {bonusPoints > 0 && (
                              <span style={{ color: theme.accent, fontSize: '0.75rem', marginLeft: '4px' }}>
                                (+{bonusPoints})
                              </span>
                            )}
                          </td>
                          <td style={{ padding: 'var(--spacing-sm)', textAlign: 'right', borderBottom: `1px solid ${theme.border}` }}>
                            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
                              <button
                                className="btn btn-success"
                                style={{ padding: '4px 8px' }}
                                onClick={() => handleCompleteTask(task.id)}
                              >
                                Complete
                              </button>
                              <button
                                className="btn btn-danger"
                                style={{ padding: '4px 8px' }}
                                onClick={() => handleDeleteTask(task.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center" style={{ padding: 'var(--spacing-lg)' }}>
                <p>No tasks available. Add a new task to get started!</p>
                <button 
                  className="btn btn-primary mt-md"
                  onClick={() => setActiveTab('add')}
                >
                  Add Task
                </button>
              </div>
            )}
          </>
        )}
        
        {activeTab === 'completed' && (
          <>
            <div className="mb-lg">
              <h3 className="mb-md">Today's Completed Tasks</h3>
              
              {todaysTasks.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: 'var(--spacing-sm)', borderBottom: `1px solid ${theme.border}` }}>Task</th>
                      <th style={{ textAlign: 'left', padding: 'var(--spacing-sm)', borderBottom: `1px solid ${theme.border}` }}>Category</th>
                      <th style={{ textAlign: 'center', padding: 'var(--spacing-sm)', borderBottom: `1px solid ${theme.border}` }}>Difficulty</th>
                      <th style={{ textAlign: 'right', padding: 'var(--spacing-sm)', borderBottom: `1px solid ${theme.border}` }}>Points</th>
                      <th style={{ textAlign: 'right', padding: 'var(--spacing-sm)', borderBottom: `1px solid ${theme.border}` }}>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todaysTasks.map(task => {
                      const statInfo = STATS.find(s => s.id === task.statId);
                      return (
                        <tr key={task.id}>
                          <td style={{ padding: 'var(--spacing-sm)', borderBottom: `1px solid ${theme.border}` }}>
                            {task.name}
                          </td>
                          <td style={{ padding: 'var(--spacing-sm)', borderBottom: `1px solid ${theme.border}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                              <span>{statInfo.icon}</span>
                              <span>{statInfo.name}</span>
                            </div>
                          </td>
                          <td style={{ padding: 'var(--spacing-sm)', textAlign: 'center', borderBottom: `1px solid ${theme.border}` }}>
                            {task.type}
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
                            {format(new Date(task.completedAt), 'h:mm a')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <p className="text-center">No tasks completed today.</p>
              )}
            </div>
            
            <div>
              <h3 className="mb-md">Last 7 Days</h3>
              
              {last7DaysTasks.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: 'var(--spacing-sm)', borderBottom: `1px solid ${theme.border}` }}>Date</th>
                      <th style={{ textAlign: 'left', padding: 'var(--spacing-sm)', borderBottom: `1px solid ${theme.border}` }}>Task</th>
                      <th style={{ textAlign: 'left', padding: 'var(--spacing-sm)', borderBottom: `1px solid ${theme.border}` }}>Category</th>
                      <th style={{ textAlign: 'right', padding: 'var(--spacing-sm)', borderBottom: `1px solid ${theme.border}` }}>Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {last7DaysTasks.map(task => {
                      const statInfo = STATS.find(s => s.id === task.statId);
                      return (
                        <tr key={task.id}>
                          <td style={{ padding: 'var(--spacing-sm)', borderBottom: `1px solid ${theme.border}` }}>
                            {format(new Date(task.completedAt), 'MMM d, yyyy')}
                          </td>
                          <td style={{ padding: 'var(--spacing-sm)', borderBottom: `1px solid ${theme.border}` }}>
                            {task.name}
                          </td>
                          <td style={{ padding: 'var(--spacing-sm)', borderBottom: `1px solid ${theme.border}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                              <span>{statInfo.icon}</span>
                              <span>{statInfo.name}</span>
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
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <p className="text-center">No tasks completed in the last 7 days.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Tasks;
