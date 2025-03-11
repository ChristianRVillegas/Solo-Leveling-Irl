import React, { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import { useTheme } from '../contexts/ThemeContext';
import { useTask } from '../contexts/TaskContext';
import AchievementBadge from '../components/achievements/AchievementBadge';
import TaskSuggestions from '../components/tasks/TaskSuggestions';
import { Link } from 'react-router-dom';
import { format, isSameDay } from 'date-fns';

const Dashboard = () => {
  const { 
    playerName, 
    stats, 
    STATS, 
    getOverallLevel, 
    getOverallRank, 
    getPointsToNextLevel,
    streak,
    getStreakBonus,
    getTodaysTasks,
    completedTasks
  } = useGame();
  const { theme } = useTheme();
  
  const todaysTasks = getTodaysTasks();
  const streakBonus = streak.current >= 3 ? getStreakBonus(streak.current) * 100 : 0;
  
  // Check if all stats have tasks completed today
  const statsWithTasksToday = STATS.filter(stat => 
    todaysTasks.some(task => task.statId === stat.id)
  );
  const allStatsHaveTasks = statsWithTasksToday.length === STATS.length;
  
  return (
    <div className="animate-fade-in">
      <section style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div className="flex justify-between items-center mb-md">
          <h2 className="text-2xl">Welcome, {playerName}</h2>
          <div style={{ 
            padding: '4px 12px', 
            borderRadius: 'var(--border-radius-md)',
            backgroundColor: theme.card
          }}>
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </div>
        </div>
        
        <div className="card">
          <div className="flex flex-col md:flex-row gap-lg">
            <div style={{ flex: 1 }}>
              <h3 className="text-xl">Your Level Progress</h3>
              <div className="flex items-center gap-md mb-md">
                <span className="text-3xl font-bold">Lv.{getOverallLevel()}</span>
                <span className="text-lg">{getOverallRank()}</span>
              </div>
              
              <div className="progress-bar">
                <div 
                  className="progress-bar-fill"
                  style={{ 
                    width: `${(getOverallLevel() / 100) * 100}%`,
                    backgroundColor: theme.primary 
                  }}
                ></div>
              </div>
              
              <p>You need {getPointsToNextLevel(getOverallLevel())} points to reach level {getOverallLevel() + 1}</p>
            </div>
            
            <div style={{ 
              height: '100px', 
              width: '1px', 
              backgroundColor: theme.border,
              display: 'none'
            }} className="md:block"></div>
            
            <div style={{ flex: 1 }}>
              <h3 className="text-xl">Current Streak</h3>
              <div className="flex items-center gap-md mb-md">
                <span className="text-3xl font-bold">
                  🔥 {streak.current} day{streak.current !== 1 ? 's' : ''}
                </span>
              </div>
              
              {streak.current >= 3 ? (
                <div style={{ 
                  backgroundColor: 'rgba(249, 115, 22, 0.1)', 
                  padding: 'var(--spacing-md)',
                  borderRadius: 'var(--border-radius-md)',
                  borderLeft: `3px solid ${theme.accent}`
                }}>
                  <p className="mb-sm">Current streak bonus: <span style={{ color: theme.accent }}>+{streakBonus}%</span> points on all tasks</p>
                  <p className="text-sm">Keep going to increase your bonus!</p>
                </div>
              ) : (
                <div style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                  padding: 'var(--spacing-md)',
                  borderRadius: 'var(--border-radius-md)',
                }}>
                  <p className="mb-sm">Reach a 3-day streak to earn bonus points!</p>
                  <p className="text-sm">You need {3 - streak.current} more day{3 - streak.current !== 1 ? 's' : ''} for your first bonus.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* Upcoming Tasks Section */}
      <section style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div className="flex justify-between items-center mb-md">
          <h2 className="text-2xl">Upcoming Tasks</h2>
          <Link 
            to="/calendar" 
            style={{ color: theme.primary, textDecoration: 'none' }}
          >
            View Calendar
          </Link>
        </div>
        
        <div className="card">
          <UpcomingTasksPreview completedTasks={completedTasks} />
        </div>
      </section>
      
      <section style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div className="flex justify-between items-center mb-md">
          <h2 className="text-2xl">Today's Progress</h2>
          
          {allStatsHaveTasks ? (
            <div style={{ 
              padding: '4px 12px', 
              borderRadius: 'var(--border-radius-md)',
              backgroundColor: theme.success,
              color: 'white'
            }}>
              All stats trained today! ✓
            </div>
          ) : (
            <div style={{ 
              padding: '4px 12px', 
              borderRadius: 'var(--border-radius-md)',
              backgroundColor: statsWithTasksToday.length > 0 ? theme.warning : theme.danger,
              color: 'white'
            }}>
              {statsWithTasksToday.length} / {STATS.length} stats trained
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {STATS.map(stat => {
            const statData = stats[stat.id];
            const tasksToday = todaysTasks.filter(task => task.statId === stat.id);
            const hasTasksToday = tasksToday.length > 0;
            
            return (
              <div 
                key={stat.id} 
                className="card" 
                style={{ 
                  borderTop: `3px solid ${hasTasksToday ? theme.success : theme.danger}`,
                  opacity: hasTasksToday ? 1 : 0.7
                }}
              >
                <div className="flex items-center gap-md mb-md">
                  <span style={{ fontSize: '1.75rem' }}>{stat.icon}</span>
                  <div>
                    <h3 style={{ margin: 0 }}>{stat.name}</h3>
                    <div className="text-sm">Level {statData.level}</div>
                  </div>
                </div>
                
                <div className="progress-bar">
                  <div 
                    className="progress-bar-fill"
                    style={{ 
                      width: `${(statData.points / getPointsToNextLevel(statData.level)) * 100}%`,
                      backgroundColor: hasTasksToday ? theme.success : theme.primary
                    }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>{statData.points} / {getPointsToNextLevel(statData.level)} points</span>
                </div>
                
                {hasTasksToday ? (
                  <div style={{ 
                    marginTop: 'var(--spacing-md)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                    padding: 'var(--spacing-sm)',
                    borderRadius: 'var(--border-radius-md)',
                  }}>
                    <div className="text-sm mb-sm">Today's tasks:</div>
                    <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                      {tasksToday.map(task => (
                        <li 
                          key={task.id} 
                          className="text-sm flex justify-between"
                          style={{ marginBottom: 'var(--spacing-xs)' }}
                        >
                          <span>{task.name}</span>
                          <span>+{task.points} pts</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <Link
                    to="/tasks"
                    className="btn btn-primary mt-md"
                    style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}
                  >
                    Add Task
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </section>
      
      
      <section>
        <div className="flex justify-between items-center mb-md">
          <h2 className="text-2xl">Recently Completed</h2>
          <Link to="/tasks" style={{ color: theme.primary }}>View All</Link>
        </div>
        
        {todaysTasks.length > 0 ? (
          <div className="card">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: 'var(--spacing-sm)', borderBottom: `1px solid ${theme.border}` }}>Task</th>
                  <th style={{ textAlign: 'left', padding: 'var(--spacing-sm)', borderBottom: `1px solid ${theme.border}` }}>Category</th>
                  <th style={{ textAlign: 'right', padding: 'var(--spacing-sm)', borderBottom: `1px solid ${theme.border}` }}>Points</th>
                  <th style={{ textAlign: 'right', padding: 'var(--spacing-sm)', borderBottom: `1px solid ${theme.border}` }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {todaysTasks.slice(0, 5).map(task => {
                  const statInfo = STATS.find(s => s.id === task.statId);
                  return (
                    <tr key={task.id}>
                      <td style={{ padding: 'var(--spacing-sm)', borderBottom: `1px solid ${theme.border}` }}>{task.name}</td>
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
                      <td style={{ padding: 'var(--spacing-sm)', textAlign: 'right', borderBottom: `1px solid ${theme.border}` }}>
                        {format(new Date(task.completedAt), 'h:mm a')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card text-center">
            <p>No tasks completed today.</p>
            <Link
              to="/tasks"
              className="btn btn-primary mt-md"
              style={{ display: 'inline-block', textDecoration: 'none' }}
            >
              Add Your First Task
            </Link>
          </div>
        )}
      </section>
      
    </div>
  );
};

export default Dashboard;

/**
 * Component to show upcoming tasks for the next few days
 */
const UpcomingTasksPreview = ({ completedTasks }) => {
  const { theme } = useTheme();
  const { STATS } = useGame();
  const { getTasksForDate } = useTask();
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Calculate the next few days
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);
  
  // Get tasks for each day
  const todaysTasks = getTasksForDate(today);
  const tomorrowsTasks = getTasksForDate(tomorrow);
  const dayAfterTasks = getTasksForDate(dayAfter);
  
  // Force a refresh of the component when a task is completed
  const handleTaskCompleted = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-md" key={refreshKey}>
      <DayTasksCard 
        date={today} 
        tasks={todaysTasks} 
        isToday={true} 
        completedTasks={completedTasks} 
        onTaskCompleted={handleTaskCompleted} 
      />
      <DayTasksCard 
        date={tomorrow} 
        tasks={tomorrowsTasks} 
        completedTasks={completedTasks}
      />
      <DayTasksCard 
        date={dayAfter} 
        tasks={dayAfterTasks} 
        completedTasks={completedTasks}
      />
    </div>
  );
};

/**
 * Component to show tasks for a specific day in a card format
 * with the ability to complete tasks
 */
const DayTasksCard = ({ date, tasks, isToday = false, completedTasks, onTaskCompleted }) => {
  const { theme } = useTheme();
  const { STATS, TASK_TYPES, dispatch, tasks: activeTasks } = useGame();
  const { dispatch: taskDispatch } = useTask();
  const [localTasks, setLocalTasks] = useState([]);
  
  const formattedDate = format(date, 'EEE, MMM d');
  
  // Filter out tasks that have already been completed
  useEffect(() => {
    const today = new Date();
    
    // Filter out recurring tasks that have already been generated today
    // And regular tasks that have been completed
    const filteredTasks = tasks.filter(task => {
      // For recurring tasks, check if a task from this recurring task has been completed today
      if (task.frequency) {
        const hasBeenCompletedToday = completedTasks.some(completed => 
          completed.fromRecurring === task.id && 
          isSameDay(new Date(completed.completedAt), today)
        );
        return !hasBeenCompletedToday;
      } 
      // For regular tasks, check if this specific task is in the active tasks list
      else {
        const isActive = activeTasks.some(activeTask => activeTask.id === task.id);
        return isActive;
      }
    });
    
    setLocalTasks(filteredTasks);
  }, [tasks, completedTasks, activeTasks]);
  
  // Function to handle completing a task
  const handleCompleteTask = (task) => {
    // For recurring tasks, we need to create an actual task first
    if (task.frequency) {
      // Create a new task from the recurring task template
      const newTaskId = `task-${Date.now()}`;
      
      // Add to game tasks
      dispatch({
        type: 'ADD_TASK',
        payload: {
          id: newTaskId,
          name: task.name,
          statId: task.statId,
          type: task.type,
          fromRecurring: task.id
        }
      });
      
      // Then complete it
      dispatch({
        type: 'COMPLETE_TASK',
        payload: {
          taskId: newTaskId
        }
      });
      
      // Update the recurring task's lastGenerated date
      taskDispatch({
        type: 'UPDATE_RECURRING_TASK_GENERATION',
        payload: {
          id: task.id,
          date: format(new Date(), 'yyyy-MM-dd')
        }
      });
      
      // Remove the task from the local list
      setLocalTasks(prev => prev.filter(t => t.id !== task.id));
    } else {
      // For normal tasks, complete them directly
      dispatch({
        type: 'COMPLETE_TASK',
        payload: {
          taskId: task.id
        }
      });
      
      // Remove the task from the local list
      setLocalTasks(prev => prev.filter(t => t.id !== task.id));
    }
    
    // Notify parent that a task was completed
    if (onTaskCompleted) {
      onTaskCompleted();
    }
  };
  
  // Only show the complete button for today's tasks
  const showCompleteButton = isToday;
  
  // If the date is in the past, don't show complete buttons
  const isPastDate = date < new Date(new Date().setHours(0, 0, 0, 0));
  
  return (
    <div 
      style={{
        padding: 'var(--spacing-md)',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 'var(--border-radius-md)',
        borderLeft: isToday ? `3px solid ${theme.primary}` : 'none',
      }}
    >
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 'var(--spacing-sm)',
          fontWeight: 'bold',
        }}
      >
        <span>{formattedDate}</span>
        <span>{isToday ? 'Today' : ''}</span>
      </div>
      
      {localTasks.length > 0 ? (
        <div>
          {localTasks.map((task, index) => {
            const statInfo = STATS.find(s => s.id === task.statId);
            const isRecurring = task.frequency !== undefined;
            const taskType = task.type.toUpperCase();
            const pointValue = TASK_TYPES[taskType] ? TASK_TYPES[taskType].points : 1;
            
            return (
              <div 
                key={`${task.id || index}`}
                style={{
                  padding: 'var(--spacing-xs) var(--spacing-sm)',
                  marginBottom: 'var(--spacing-xs)',
                  backgroundColor: isRecurring ? 'rgba(249, 115, 22, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                  borderRadius: 'var(--border-radius-sm)',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', flex: 1 }}>
                  <span>{statInfo.icon}</span>
                  <span>{task.name}</span>
                  {isRecurring && (
                    <span title="Recurring Task" style={{ opacity: 0.6 }}>↻</span>
                  )}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                  <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>+{pointValue}</span>
                  
                  {showCompleteButton && !isPastDate && (
                    <button 
                      onClick={() => handleCompleteTask(task)}
                      style={{
                        backgroundColor: theme.success,
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--border-radius-sm)',
                        padding: '2px 6px',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Complete Task"
                    >
                      ✓
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ padding: 'var(--spacing-md)', textAlign: 'center', opacity: 0.7 }}>
          <p>No tasks scheduled</p>
          <Link 
            to="/tasks" 
            className="btn btn-outline mt-sm"
            style={{ textDecoration: 'none', display: 'inline-block', marginTop: 'var(--spacing-sm)' }}
          >
            Add Task
          </Link>
        </div>
      )}
    </div>
  );
};