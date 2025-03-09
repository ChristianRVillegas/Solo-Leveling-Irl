import React, { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import { useTask } from '../contexts/TaskContext';
import { useTheme } from '../contexts/ThemeContext';
import { format, parseISO } from 'date-fns';
import { useLocation, Link } from 'react-router-dom';

/**
 * Enhanced Tasks page with templates, recurring tasks, and task suggestions
 */
const EnhancedTasks = () => {
  const location = useLocation();
  const initialStatId = location.state?.statId || null;
  
  const { 
    STATS, 
    TASK_TYPES,
    tasks,
    completedTasks,
    dispatch: gameDispatch,
    getTodaysTasks,
    getStreakBonus,
    streak
  } = useGame();
  
  const {
    templates,
    recurringTasks,
    dispatch: taskDispatch,
    getSuggestedTasks,
    TEMPLATE_CATEGORIES,
    FREQUENCY_TYPES,
    DAYS_OF_WEEK,
    saveAsTemplate,
  } = useTask();
  
  const { theme } = useTheme();
  
  // UI state
  const [activeTab, setActiveTab] = useState('add');
  const [selectedStatId, setSelectedStatId] = useState(initialStatId);
  const [taskName, setTaskName] = useState('');
  const [taskType, setTaskType] = useState('regular');
  const [filterStat, setFilterStat] = useState('all');
  const [templateCategory, setTemplateCategory] = useState('all');
  const [isAddingTemplate, setIsAddingTemplate] = useState(false);
  const [newTemplateCategory, setNewTemplateCategory] = useState('personal');
  const [isAddingRecurring, setIsAddingRecurring] = useState(false);
  const [frequencyType, setFrequencyType] = useState(FREQUENCY_TYPES.DAILY);
  const [weeklyDay, setWeeklyDay] = useState(new Date().getDay());
  const [specificDays, setSpecificDays] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  
  // Get suggested tasks
  const suggestedTasks = getSuggestedTasks(3);
  
  // Reset form when changing stats
  useEffect(() => {
    if (initialStatId && initialStatId !== selectedStatId) {
      setSelectedStatId(initialStatId);
    }
  }, [initialStatId]);
  
  /**
   * Handle adding a regular task
   */
  const handleAddTask = (e) => {
    e.preventDefault();
    
    if (!taskName.trim() || !selectedStatId || !taskType) {
      return;
    }
    
    if (isAddingRecurring) {
      // Add a recurring task
      taskDispatch({
        type: 'ADD_RECURRING_TASK',
        payload: {
          name: taskName.trim(),
          statId: selectedStatId,
          type: taskType,
          frequency: frequencyType,
          frequencyConfig: frequencyType === FREQUENCY_TYPES.WEEKLY 
            ? { dayOfWeek: weeklyDay }
            : frequencyType === FREQUENCY_TYPES.SPECIFIC_DAYS
              ? { daysOfWeek: specificDays }
              : {}
        }
      });
    } else if (isAddingTemplate) {
      // Add a template
      taskDispatch({
        type: 'ADD_TEMPLATE',
        payload: {
          name: taskName.trim(),
          statId: selectedStatId,
          type: taskType,
          category: newTemplateCategory
        }
      });
    } else {
      // Add a regular task
      gameDispatch({
        type: 'ADD_TASK',
        payload: {
          name: taskName.trim(),
          statId: selectedStatId,
          type: taskType
        }
      });
    }
    
    // Reset form
    setTaskName('');
    setTaskType('regular');
    setIsAddingTemplate(false);
    setIsAddingRecurring(false);
    setFrequencyType(FREQUENCY_TYPES.DAILY);
    setSpecificDays([]);
  };
  
  /**
   * Handle using a template to create a task
   */
  const handleUseTemplate = (template) => {
    gameDispatch({
      type: 'ADD_TASK',
      payload: {
        name: template.name,
        statId: template.statId,
        type: template.type
      }
    });
  };
  
  /**
   * Handle completing a task
   */
  const handleCompleteTask = (taskId) => {
    gameDispatch({
      type: 'COMPLETE_TASK',
      payload: { taskId }
    });
  };
  
  /**
   * Handle deleting a task
   */
  const handleDeleteTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      gameDispatch({
        type: 'DELETE_TASK',
        payload: taskId
      });
    }
  };
  
  /**
   * Handle deleting a recurring task
   */
  const handleDeleteRecurringTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this recurring task? This will not affect tasks already added to your list.')) {
      taskDispatch({
        type: 'DELETE_RECURRING_TASK',
        payload: taskId
      });
    }
  };
  
  /**
   * Handle deleting a template
   */
  const handleDeleteTemplate = (templateId) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      taskDispatch({
        type: 'DELETE_TEMPLATE',
        payload: templateId
      });
    }
  };
  
  /**
   * Handle saving a task as a template
   */
  const handleSaveAsTemplate = (task) => {
    saveAsTemplate(task);
  };
  
  /**
   * Toggle selection of a specific day of the week
   */
  const toggleSpecificDay = (dayId) => {
    if (specificDays.includes(dayId)) {
      setSpecificDays(specificDays.filter(id => id !== dayId));
    } else {
      setSpecificDays([...specificDays, dayId]);
    }
  };
  
  // Filter tasks by stat
  const filteredTasks = tasks.filter(task => 
    filterStat === 'all' || task.statId === filterStat
  );
  
  // Filter templates by category and stat
  const filteredTemplates = templates.filter(template => 
    (templateCategory === 'all' || template.category === templateCategory) &&
    (filterStat === 'all' || template.statId === filterStat)
  );
  
  // Filter recurring tasks by stat
  const filteredRecurringTasks = recurringTasks.filter(task => 
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
      <div className="flex justify-between items-center mb-md">
        <h2 className="text-2xl">Tasks</h2>
        <Link 
          to="/calendar" 
          className="btn btn-outline"
          style={{ textDecoration: 'none' }}
        >
          View Calendar
        </Link>
      </div>
      
      {/* Task Suggestions */}
      {showSuggestions && suggestedTasks.length > 0 && (
        <div 
          className="card mb-lg"
          style={{ 
            borderLeft: `3px solid ${theme.accent}`,
            backgroundColor: 'rgba(124, 58, 237, 0.05)' // Purple tint
          }}
        >
          <div className="flex justify-between items-center mb-md">
            <h3 className="text-xl">Suggested Tasks</h3>
            <button 
              className="btn btn-outline"
              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
              onClick={() => setShowSuggestions(false)}
            >
              Hide
            </button>
          </div>
          
          <p className="mb-md" style={{ fontSize: '0.875rem', opacity: 0.8 }}>
            These tasks are recommended based on your current stats and progress.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-md">
            {suggestedTasks.map((task, index) => {
              const statInfo = STATS.find(s => s.id === task.statId);
              
              return (
                <div 
                  key={index}
                  className="card"
                  style={{ 
                    margin: 0,
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    borderLeft: `3px solid ${theme.primary}`
                  }}
                  onClick={() => handleUseTemplate(task)}
                >
                  <div className="flex items-center gap-md">
                    <div style={{ fontSize: '1.5rem' }}>{statInfo.icon}</div>
                    <div>
                      <h4 style={{ margin: 0, marginBottom: '4px' }}>{task.name}</h4>
                      <div style={{ fontSize: '0.875rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{statInfo.name}</span>
                        <span>{task.type} task</span>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    className="btn btn-primary mt-md"
                    style={{ width: '100%' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUseTemplate(task);
                    }}
                  >
                    Add Task
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="card mb-lg">
        <div style={{ 
          display: 'flex', 
          gap: 'var(--spacing-md)',
          flexWrap: 'wrap',
          borderBottom: `1px solid ${theme.border}`,
          marginBottom: 'var(--spacing-lg)'
        }}>
          <button
            className={`btn ${activeTab === 'add' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('add')}
          >
            Add Tasks
          </button>
          <button
            className={`btn ${activeTab === 'current' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('current')}
          >
            Current
          </button>
          <button
            className={`btn ${activeTab === 'recurring' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('recurring')}
          >
            Recurring
          </button>
          <button
            className={`btn ${activeTab === 'templates' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('templates')}
          >
            Templates
          </button>
          <button
            className={`btn ${activeTab === 'completed' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('completed')}
          >
            History
          </button>
        </div>
        
        {/* Filter by stat - shown on all tabs */}
        <div className="form-group mb-lg">
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
        
        {/* Add Task Tab */}
        {activeTab === 'add' && (
          <div>
            <div style={{ 
              display: 'flex', 
              gap: 'var(--spacing-md)',
              marginBottom: 'var(--spacing-md)'
            }}>
              <button
                className={`btn ${!isAddingTemplate && !isAddingRecurring ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => {
                  setIsAddingTemplate(false);
                  setIsAddingRecurring(false);
                }}
              >
                One-time Task
              </button>
              <button
                className={`btn ${isAddingRecurring ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => {
                  setIsAddingTemplate(false);
                  setIsAddingRecurring(true);
                }}
              >
                Recurring Task
              </button>
              <button
                className={`btn ${isAddingTemplate ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => {
                  setIsAddingTemplate(true);
                  setIsAddingRecurring(false);
                }}
              >
                Save as Template
              </button>
            </div>
            
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
              
              {/* Template-specific options */}
              {isAddingTemplate && (
                <div className="form-group">
                  <label htmlFor="templateCategory" className="form-label">Template Category</label>
                  <select
                    id="templateCategory"
                    className="form-select"
                    value={newTemplateCategory}
                    onChange={(e) => setNewTemplateCategory(e.target.value)}
                    required
                  >
                    {TEMPLATE_CATEGORIES.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              {/* Recurring task options */}
              {isAddingRecurring && (
                <div style={{ marginTop: 'var(--spacing-md)' }}>
                  <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Recurrence Pattern</h3>
                  
                  <div className="form-group">
                    <label className="form-label">Frequency</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
                      <button
                        type="button"
                        className={`btn ${frequencyType === FREQUENCY_TYPES.DAILY ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setFrequencyType(FREQUENCY_TYPES.DAILY)}
                      >
                        Daily
                      </button>
                      <button
                        type="button"
                        className={`btn ${frequencyType === FREQUENCY_TYPES.WEEKLY ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setFrequencyType(FREQUENCY_TYPES.WEEKLY)}
                      >
                        Weekly
                      </button>
                      <button
                        type="button"
                        className={`btn ${frequencyType === FREQUENCY_TYPES.SPECIFIC_DAYS ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setFrequencyType(FREQUENCY_TYPES.SPECIFIC_DAYS)}
                      >
                        Specific Days
                      </button>
                    </div>
                  </div>
                  
                  {frequencyType === FREQUENCY_TYPES.WEEKLY && (
                    <div className="form-group">
                      <label className="form-label">Day of Week</label>
                      <select
                        className="form-select"
                        value={weeklyDay}
                        onChange={(e) => setWeeklyDay(parseInt(e.target.value))}
                      >
                        {DAYS_OF_WEEK.map(day => (
                          <option key={day.id} value={day.id}>{day.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {frequencyType === FREQUENCY_TYPES.SPECIFIC_DAYS && (
                    <div className="form-group">
                      <label className="form-label">Select Days</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
                        {DAYS_OF_WEEK.map(day => (
                          <button
                            key={day.id}
                            type="button"
                            className={`btn ${specificDays.includes(day.id) ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => toggleSpecificDay(day.id)}
                          >
                            {day.shortName}
                          </button>
                        ))}
                      </div>
                      {specificDays.length === 0 && (
                        <p style={{ color: theme.danger, fontSize: '0.875rem', marginTop: 'var(--spacing-xs)' }}>
                          Please select at least one day
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {streak.current >= 3 && !isAddingTemplate && (
                <div style={{ 
                  backgroundColor: 'rgba(249, 115, 22, 0.1)', 
                  padding: 'var(--spacing-md)',
                  borderRadius: 'var(--border-radius-md)',
                  marginTop: 'var(--spacing-md)',
                  marginBottom: 'var(--spacing-lg)',
                  borderLeft: `3px solid ${theme.accent}`
                }}>
                  <p>
                    <span style={{ color: theme.accent }}>+{streakBonusPercent}% Streak Bonus</span> will be applied when you complete this task!
                  </p>
                </div>
              )}
              
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={
                  !taskName.trim() || 
                  !selectedStatId || 
                  !taskType || 
                  (isAddingRecurring && frequencyType === FREQUENCY_TYPES.SPECIFIC_DAYS && specificDays.length === 0)
                }
              >
                {isAddingTemplate 
                  ? 'Save Template' 
                  : isAddingRecurring 
                    ? 'Add Recurring Task' 
                    : 'Add Task'}
              </button>
            </form>
          </div>
        )}
        
        {/* Current Tasks Tab */}
        {activeTab === 'current' && (
          <>
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
                                className="btn btn-outline"
                                style={{ padding: '4px 8px' }}
                                onClick={() => handleSaveAsTemplate(task)}
                              >
                                Save
                              </button>
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
        
        {/* Recurring Tasks Tab */}
        {activeTab === 'recurring' && (
          <>
            {filteredRecurringTasks.length > 0 ? (
              <div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: 'var(--spacing-sm)', borderBottom: `1px solid ${theme.border}` }}>Task</th>
                      <th style={{ textAlign: 'left', padding: 'var(--spacing-sm)', borderBottom: `1px solid ${theme.border}` }}>Category</th>
                      <th style={{ textAlign: 'left', padding: 'var(--spacing-sm)', borderBottom: `1px solid ${theme.border}` }}>Frequency</th>
                      <th style={{ textAlign: 'right', padding: 'var(--spacing-sm)', borderBottom: `1px solid ${theme.border}` }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecurringTasks.map(task => {
                      const statInfo = STATS.find(s => s.id === task.statId);
                      
                      // Create frequency display text
                      let frequencyText = "Daily";
                      if (task.frequency === FREQUENCY_TYPES.WEEKLY) {
                        const dayName = DAYS_OF_WEEK.find(d => d.id === task.frequencyConfig.dayOfWeek)?.name || "Unknown";
                        frequencyText = `Weekly on ${dayName}`;
                      } else if (task.frequency === FREQUENCY_TYPES.SPECIFIC_DAYS) {
                        const dayNames = task.frequencyConfig.daysOfWeek.map(
                          id => DAYS_OF_WEEK.find(d => d.id === id)?.shortName || "?"
                        ).join(", ");
                        frequencyText = `${dayNames}`;
                      }
                      
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
                          <td style={{ padding: 'var(--spacing-sm)', borderBottom: `1px solid ${theme.border}` }}>
                            <div 
                              style={{ 
                                display: 'inline-block',
                                padding: '2px 8px',
                                backgroundColor: 'rgba(249, 115, 22, 0.1)',
                                color: theme.accent,
                                borderRadius: 'var(--border-radius-sm)',
                                fontSize: '0.875rem'
                              }}
                            >
                              ↻ {frequencyText}
                            </div>
                          </td>
                          <td style={{ padding: 'var(--spacing-sm)', textAlign: 'right', borderBottom: `1px solid ${theme.border}` }}>
                            <button
                              className="btn btn-danger"
                              style={{ padding: '4px 8px' }}
                              onClick={() => handleDeleteRecurringTask(task.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center" style={{ padding: 'var(--spacing-lg)' }}>
                <p>No recurring tasks set up. Create recurring tasks to build consistent habits!</p>
                <button 
                  className="btn btn-primary mt-md"
                  onClick={() => {
                    setActiveTab('add');
                    setIsAddingRecurring(true);
                  }}
                >
                  Create Recurring Task
                </button>
              </div>
            )}
          </>
        )}
        
        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <>
            <div className="form-group mb-md">
              <label htmlFor="templateCategory" className="form-label">Filter by Category</label>
              <select
                id="templateCategory"
                className="form-select"
                value={templateCategory}
                onChange={(e) => setTemplateCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {TEMPLATE_CATEGORIES.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            {filteredTemplates.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-md">
                {filteredTemplates.map(template => {
                  const statInfo = STATS.find(s => s.id === template.statId);
                  const categoryInfo = TEMPLATE_CATEGORIES.find(c => c.id === template.category);
                  
                  return (
                    <div 
                      key={template.id}
                      className="card"
                      style={{ 
                        margin: 0,
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                        borderLeft: `3px solid ${theme.primary}`
                      }}
                      onClick={() => handleUseTemplate(template)}
                    >
                      <div className="flex items-center gap-md">
                        <div style={{ fontSize: '1.5rem' }}>{statInfo.icon}</div>
                        <div>
                          <h4 style={{ margin: 0, marginBottom: '4px' }}>{template.name}</h4>
                          <div style={{ fontSize: '0.875rem', display: 'flex', justifyContent: 'space-between' }}>
                            <span>{statInfo.name}</span>
                            <span>{template.type} task</span>
                          </div>
                        </div>
                      </div>
                      
                      <div 
                        style={{ 
                          marginTop: 'var(--spacing-sm)',
                          padding: '4px 8px',
                          borderRadius: 'var(--border-radius-sm)',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          display: 'inline-block',
                          fontSize: '0.75rem'
                        }}
                      >
                        {categoryInfo.icon} {categoryInfo.name}
                      </div>
                      
                      <div className="flex gap-sm mt-md">
                        <button 
                          className="btn btn-primary"
                          style={{ flex: 1 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUseTemplate(template);
                          }}
                        >
                          Use
                        </button>
                        
                        {template.category === 'personal' && (
                          <button 
                            className="btn btn-danger"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTemplate(template.id);
                            }}
                            style={{ padding: '4px 8px' }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center" style={{ padding: 'var(--spacing-lg)' }}>
                <p>No templates found in this category.</p>
                <button 
                  className="btn btn-primary mt-md"
                  onClick={() => {
                    setActiveTab('add');
                    setIsAddingTemplate(true);
                  }}
                >
                  Create Template
                </button>
              </div>
            )}
          </>
        )}
        
        {/* Completed Tasks Tab */}
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

export default EnhancedTasks;
