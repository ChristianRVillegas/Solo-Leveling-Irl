import React, { useState, useEffect } from 'react';
import { useTask } from '../contexts/TaskContext';
import { useGame } from '../contexts/GameContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  format, 
  addDays, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  parseISO,
  isToday
} from 'date-fns';

/**
 * Calendar page - displays a monthly calendar with scheduled and recurring tasks
 */
const Calendar = () => {
  const { theme } = useTheme();
  const { STATS } = useGame();
  const { getTasksForDate, scheduledTasks, recurringTasks } = useTask();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  
  // Add CSS for calendar day hover effects
  useEffect(() => {
    // Create a style element
    const styleEl = document.createElement('style');
    styleEl.id = 'calendar-hover-styles';
    
    // Add the hover styles
    styleEl.innerHTML = `
      .calendar-day-add-btn {
        opacity: 0.6;
        transition: all 0.2s ease;
      }
      
      .calendar-day-add-btn:hover {
        opacity: 1;
        transform: scale(1.1);
        background-color: rgba(99, 102, 241, 0.3) !important;
      }
      
      .calendar-day-add-btn::after {
        content: 'Add task';
        position: absolute;
        top: -25px;
        left: 0;
        background-color: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 11px;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.2s ease;
        z-index: 10;
        white-space: nowrap;
      }
      
      .calendar-day-add-btn:hover::after {
        opacity: 0.9;
      }
      
      .calendar-day {
        position: relative;
      }
      .calendar-day::before {
        content: '';
        position: absolute;
        top: 4px;
        left: 8px;
        font-size: 16px;
        opacity: 0;
        transition: opacity 0.2s ease;
      }
      .calendar-day-current-month:hover {
        background-color: rgba(99, 102, 241, 0.05) !important;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      }
      .calendar-day-current-month::after {
        content: attr(data-empty-message);
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.2s ease;
        z-index: 10;
        white-space: nowrap;
      }
      .calendar-day-current-month.empty-day:hover::after {
        opacity: 0.8;
        transition-delay: 0.3s;
      }
      .calendar-day-current-month:hover::before {
        opacity: 0.5;
      }
      .calendar-day:not(.calendar-day-current-month):hover {
        background-color: rgba(0, 0, 0, 0.08) !important;
      }
    `;
    
    // Add the style element to the document head
    document.head.appendChild(styleEl);
    
    // Clean up on component unmount
    return () => {
      const existingStyle = document.getElementById('calendar-hover-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);
  
  /**
   * Navigate to the previous month
   */
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  /**
   * Navigate to the next month
   */
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  /**
   * Go to the current month
   */
  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };
  
  /**
   * Render the days of the week header
   */
  const renderDaysOfWeek = () => {
    const days = [];
    const dateFormat = "EEE";
    const startDate = startOfWeek(currentMonth);
    
    for (let i = 0; i < 7; i++) {
      days.push(
        <div
          key={`header-${i}`}
          className="calendar-day-header"
          style={{
            fontWeight: 'bold',
            padding: 'var(--spacing-sm)',
            textAlign: 'center',
            borderBottom: `1px solid ${theme.border}`
          }}
        >
          {format(addDays(startDate, i), dateFormat)}
        </div>
      );
    }
    
    return <div className="calendar-days-header" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>{days}</div>;
  };
  
  /**
   * Render the calendar cells for the current month
   */
  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    
    const rows = [];
    let days = [];
    let day = startDate;
    
    // For each day in the month view
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, "d");
        const tasksForDay = getTasksForDate(day);
        const isSelected = isSameDay(day, selectedDate);
        const dayIsToday = isToday(day);
        const isCurrentMonth = isSameMonth(day, monthStart);
        
        days.push(
          <div
            key={day.toString()}
            className={`calendar-day ${isCurrentMonth ? 'calendar-day-current-month' : ''} ${tasksForDay.length === 0 && isCurrentMonth ? 'empty-day' : ''}`}
            data-empty-message="Click to add task"
            style={{
              minHeight: '120px',
              padding: 'var(--spacing-xs)',
              backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.1)' : isCurrentMonth ? 'transparent' : 'rgba(0, 0, 0, 0.05)',
              border: `1px solid ${theme.border}`,
              cursor: 'pointer',
              position: 'relative',
              color: !isCurrentMonth ? 'rgba(255, 255, 255, 0.3)' : theme.text,
              transition: 'all 0.2s ease',
            }}
            onClick={() => {
              setSelectedDate(day);
              // If the user clicks on a date, open the task modal for that date
              if (isCurrentMonth) {
                setShowAddTaskModal(true);
              }
            }}
          >
            <div 
              style={{ 
                position: 'absolute', 
                top: '4px', 
                right: '8px',
                height: '24px',
                width: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                backgroundColor: dayIsToday ? theme.primary : 'transparent',
                color: dayIsToday ? 'white' : 'inherit',
                fontWeight: dayIsToday ? 'bold' : 'normal'
              }}
            >
              {formattedDate}
            </div>
            
            {/* Task indicators - shows up to 3 tasks, then a +X more */}
            {isCurrentMonth && (
            <div 
              className="calendar-day-add-btn"
              style={{ 
                position: 'absolute', 
                top: '6px', 
                left: '6px',
                height: '20px',
                width: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: 'bold',
                color: theme.primary
              }}
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering the parent onClick
                setSelectedDate(day);
                setShowAddTaskModal(true);
              }}
            >
              +
            </div>
          )}
          <div style={{ marginTop: '24px' }}>
              {tasksForDay.slice(0, 3).map((task, index) => {
                const isRecurring = task.frequency !== undefined;
                const statInfo = STATS.find(s => s.id === task.statId);
                
                return (
                  <div 
                    key={index}
                    style={{ 
                      fontSize: '0.75rem',
                      padding: '2px 4px',
                      marginBottom: '2px',
                      backgroundColor: isRecurring ? 'rgba(249, 115, 22, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                      borderRadius: 'var(--border-radius-sm)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      opacity: isCurrentMonth ? 1 : 0.5
                    }}
                  >
                    <span>{statInfo.icon} </span>
                    <span>{task.name}</span>
                  </div>
                );
              })}
              
              {tasksForDay.length > 3 && (
                <div 
                  style={{ 
                    fontSize: '0.75rem',
                    padding: '2px 4px',
                    textAlign: 'center',
                    opacity: isCurrentMonth ? 0.7 : 0.3
                  }}
                >
                  +{tasksForDay.length - 3} more
                </div>
              )}
            </div>
          </div>
        );
        
        day = addDays(day, 1);
      }
      
      rows.push(
        <div key={day.toString()} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {days}
        </div>
      );
      
      days = [];
    }
    
    return <div className="calendar-body">{rows}</div>;
  };
  
  /**
   * Render the sidebar with selected day's tasks
   */
  const renderSidebar = () => {
    const selectedTasks = getTasksForDate(selectedDate);
    const selectedDateStr = format(selectedDate, "EEEE, MMMM d, yyyy");
    
    return (
      <div style={{ padding: 'var(--spacing-md)' }}>
        <div className="flex justify-between items-center mb-md">
          <h3 className="text-xl">{selectedDateStr}</h3>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddTaskModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <span>+</span> Add Task
          </button>
        </div>
        
        {selectedTasks.length > 0 ? (
          <div>
            {selectedTasks.map((task, index) => {
              const isRecurring = task.frequency !== undefined;
              const statInfo = STATS.find(s => s.id === task.statId);
              
              return (
                <div 
                  key={index}
                  className="card"
                  style={{ 
                    marginBottom: 'var(--spacing-sm)',
                    borderLeft: isRecurring ? `3px solid ${theme.accent}` : `3px solid ${theme.primary}`
                  }}
                >
                  <div className="flex gap-md">
                    <div style={{ fontSize: '1.5rem' }}>{statInfo.icon}</div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, marginBottom: '4px' }}>{task.name}</h4>
                      <div style={{ fontSize: '0.875rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{statInfo.name}</span>
                        <span>{task.type} task</span>
                      </div>
                    </div>
                  </div>
                  
                  {isRecurring && (
                    <div 
                      style={{ 
                        marginTop: 'var(--spacing-sm)',
                        fontSize: '0.75rem',
                        padding: '4px 8px',
                        backgroundColor: 'rgba(249, 115, 22, 0.1)',
                        color: theme.accent,
                        borderRadius: 'var(--border-radius-sm)',
                        display: 'inline-block'
                      }}
                    >
                      ↻ Recurring: {task.frequency === 'daily' ? 'Daily' : 
                        task.frequency === 'weekly' ? `Weekly (${format(addDays(startOfWeek(new Date()), task.frequencyConfig.dayOfWeek), 'EEEE')})` : 
                        'Multiple days per week'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-lg)', opacity: 0.8 }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>📅</div>
            <p>No tasks scheduled for {format(selectedDate, 'MMMM d')}.</p>
            <button 
              className="btn btn-primary mt-md"
              onClick={() => setShowAddTaskModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                margin: '15px auto 0'
              }}
            >
              <span>+</span> Schedule a Task
            </button>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-md">
        <h2 className="text-2xl">Calendar</h2>
      </div>
      
      <div className="card mb-lg">
        {/* Calendar Header with Month/Year and Navigation */}
        <div 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 'var(--spacing-md)',
            padding: 'var(--spacing-sm)',
            borderBottom: `1px solid ${theme.border}`
          }}
        >
          <h3 style={{ margin: 0 }}>{format(currentMonth, "MMMM yyyy")}</h3>
          
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
            <button 
              className="btn btn-outline"
              onClick={prevMonth}
              style={{ padding: '4px 12px' }}
            >
              &lt;
            </button>
            <button
              className="btn btn-outline"
              onClick={goToToday}
              style={{ padding: '4px 12px' }}
            >
              Today
            </button>
            <button 
              className="btn btn-outline"
              onClick={nextMonth}
              style={{ padding: '4px 12px' }}
            >
              &gt;
            </button>
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', md: 'flex-row' }}>
          {/* Main Calendar */}
          <div style={{ flex: 2 }}>
            {renderDaysOfWeek()}
            {renderCells()}
          </div>
          
          {/* Sidebar - Hidden on small screens */}
          <div 
            style={{ 
              flex: 1, 
              borderLeft: `1px solid ${theme.border}`,
              display: 'none'
            }}
            className="md:block"
          >
            {renderSidebar()}
          </div>
        </div>
      </div>
      
      {/* Selected day tasks - Visible only on small screens */}
      <div className="card md:hidden">
        {renderSidebar()}
      </div>
      
      {/* Add Task Modal */}
      {showAddTaskModal && (
        <ScheduleTaskModal 
          selectedDate={selectedDate}
          onClose={() => setShowAddTaskModal(false)}
        />
      )}
    </div>
  );
};

/**
 * Modal for scheduling a new task or adding a recurring task
 */
const ScheduleTaskModal = ({ selectedDate, onClose }) => {
  const { theme } = useTheme();
  const { STATS, TASK_TYPES } = useGame();
  const { 
    dispatch, 
    templates, 
    FREQUENCY_TYPES, 
    DAYS_OF_WEEK
  } = useTask();
  
  // State for the form
  const [taskName, setTaskName] = useState('');
  const [statId, setStatId] = useState('');
  const [taskType, setTaskType] = useState('regular');
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequencyType, setFrequencyType] = useState(FREQUENCY_TYPES.DAILY);
  const [weeklyDay, setWeeklyDay] = useState(new Date().getDay());
  const [specificDays, setSpecificDays] = useState([]);
  const [useTemplate, setUseTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  
  // Handle template selection
  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setTaskName(template.name);
    setStatId(template.statId);
    setTaskType(template.type);
  };
  
  // Toggle a specific day of the week
  const toggleSpecificDay = (dayId) => {
    if (specificDays.includes(dayId)) {
      setSpecificDays(specificDays.filter(id => id !== dayId));
    } else {
      setSpecificDays([...specificDays, dayId]);
    }
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!taskName.trim() || !statId || !taskType) {
      return;
    }
    
    // Create task base
    const taskBase = {
      name: taskName.trim(),
      statId,
      type: taskType
    };
    
    if (isRecurring) {
      // Add a recurring task
      const recurringTask = {
        ...taskBase,
        frequency: frequencyType,
        frequencyConfig: frequencyType === FREQUENCY_TYPES.WEEKLY 
          ? { dayOfWeek: weeklyDay }
          : frequencyType === FREQUENCY_TYPES.SPECIFIC_DAYS
            ? { daysOfWeek: specificDays }
            : {}
      };
      
      dispatch({
        type: 'ADD_RECURRING_TASK',
        payload: recurringTask
      });
    } else {
      // Add a scheduled one-time task
      dispatch({
        type: 'ADD_SCHEDULED_TASK',
        payload: {
          ...taskBase,
          scheduledDate: selectedDate.toISOString()
        }
      });
    }
    
    // Close the modal
    onClose();
  };
  
  // Filter templates by selected stat
  const filteredTemplates = statId 
    ? templates.filter(t => t.statId === statId)
    : templates;
  
  return (
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
        maxHeight: '90vh',
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
          onClick={onClose}
        >
          ✕
        </button>
        
        <div style={{ padding: 'var(--spacing-lg)' }}>
          <h2 style={{ marginBottom: 'var(--spacing-sm)' }}>
            {isRecurring ? 'Add Recurring Task' : `Schedule Task`}
          </h2>
          {!isRecurring && (
            <div style={{ 
              marginBottom: 'var(--spacing-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              backgroundColor: 'rgba(99, 102, 241, 0.1)', 
              borderRadius: 'var(--border-radius-md)',
              width: 'fit-content'
            }}>
              <span style={{ fontSize: '18px' }}>📅</span>
              <span>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
            </div>
          )}
          
          <div style={{ 
            display: 'flex', 
            gap: 'var(--spacing-md)',
            borderBottom: `1px solid ${theme.border}`,
            marginBottom: 'var(--spacing-lg)'
          }}>
            <button
              className={`btn ${!isRecurring ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setIsRecurring(false)}
            >
              One-time Task
            </button>
            <button
              className={`btn ${isRecurring ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setIsRecurring(true)}
            >
              Recurring Task
            </button>
          </div>
          
          <div style={{
            display: 'flex',
            gap: 'var(--spacing-md)',
            marginBottom: 'var(--spacing-md)'
          }}>
            <button
              className={`btn ${!useTemplate ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setUseTemplate(false)}
            >
              Custom Task
            </button>
            <button
              className={`btn ${useTemplate ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setUseTemplate(true)}
            >
              Use Template
            </button>
          </div>
          
          {useTemplate ? (
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <div className="form-group">
                <label className="form-label">Filter by Stat</label>
                <select
                  className="form-select"
                  value={statId}
                  onChange={(e) => setStatId(e.target.value)}
                >
                  <option value="">All Stats</option>
                  {STATS.map(stat => (
                    <option key={stat.id} value={stat.id}>{stat.icon} {stat.name}</option>
                  ))}
                </select>
              </div>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: 'var(--spacing-sm)',
                marginTop: 'var(--spacing-md)'
              }}>
                {filteredTemplates.map(template => (
                  <div
                    key={template.id}
                    style={{
                      padding: 'var(--spacing-sm)',
                      borderRadius: 'var(--border-radius-md)',
                      backgroundColor: selectedTemplate && selectedTemplate.id === template.id ? 
                        'rgba(99, 102, 241, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                      border: selectedTemplate && selectedTemplate.id === template.id ?
                        `1px solid ${theme.primary}` : `1px solid ${theme.border}`,
                      cursor: 'pointer'
                    }}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                      <div style={{ fontSize: '1.25rem' }}>
                        {STATS.find(s => s.id === template.statId)?.icon}
                      </div>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{template.name}</div>
                        <div style={{ fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                          <span>{STATS.find(s => s.id === template.statId)?.name}</span>
                          <span>{template.type} task</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {filteredTemplates.length === 0 && (
                <div style={{ textAlign: 'center', padding: 'var(--spacing-md)', opacity: 0.7 }}>
                  No templates found. Try a different stat or create a custom task.
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
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
                    value={statId}
                    onChange={(e) => setStatId(e.target.value)}
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
            </form>
          )}
          
          {isRecurring && (
            <div style={{ marginTop: 'var(--spacing-md)' }}>
              <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Recurrence Pattern</h3>
              
              <div className="form-group">
                <label className="form-label">Frequency</label>
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                  <button
                    className={`btn ${frequencyType === FREQUENCY_TYPES.DAILY ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setFrequencyType(FREQUENCY_TYPES.DAILY)}
                    type="button"
                  >
                    Daily
                  </button>
                  <button
                    className={`btn ${frequencyType === FREQUENCY_TYPES.WEEKLY ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setFrequencyType(FREQUENCY_TYPES.WEEKLY)}
                    type="button"
                  >
                    Weekly
                  </button>
                  <button
                    className={`btn ${frequencyType === FREQUENCY_TYPES.SPECIFIC_DAYS ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setFrequencyType(FREQUENCY_TYPES.SPECIFIC_DAYS)}
                    type="button"
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
          
          <div style={{ marginTop: 'var(--spacing-lg)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-md)' }}>
            <button
              className="btn btn-outline"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              type="button"
              disabled={
                !taskName.trim() || 
                !statId || 
                !taskType || 
                (isRecurring && frequencyType === FREQUENCY_TYPES.SPECIFIC_DAYS && specificDays.length === 0)
              }
            >
              {isRecurring ? 'Add Recurring Task' : 'Schedule Task'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
