import React, { useState, useEffect } from 'react';
import { useGame } from '../../contexts/GameContext';
import { useAnalyticsContext } from '../../contexts/AnalyticsContext';
import {
  RiLineLine,
  RiAddLine,
  RiCloseLine,
  RiPencilLine,
  RiTimeLine,
  RiCalendarLine,
  RiInformationLine,
  RiAlertLine,
  RiCheckboxCircleLine,
  RiFlag2Line,
  RiBarChartLine,
  RiUserLine,
  RiPaletteLine,
  RiSaveLine,
  RiAddCircleLine,
  RiArrowDownLine,
  RiArrowUpLine
} from 'react-icons/ri';
import ColorTheme from '../../styles/ColorTheme';

/**
 * GoalsTracking Component
 * 
 * Allows users to create, track, and manage personal improvement goals.
 * Goals can track stat development or task completion with set milestones
 * and due dates. Progress is automatically calculated based on user activity.
 */
const GoalsTracking = ({ showTitle = false }) => {
  const { stats, taskHistory } = useGame();
  const { rawStats } = useAnalyticsContext();
  
  // State for user's custom goals
  const [goals, setGoals] = useState(() => {
    // Try to load goals from localStorage
    const savedGoals = localStorage.getItem('soloLevelingGoals');
    return savedGoals ? JSON.parse(savedGoals) : [];
  });
  
  // State for the new goal form
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    targetType: 'stat', // 'stat', 'task', 'achievement'
    targetStat: Object.keys(rawStats).length > 0 ? Object.keys(rawStats)[0] : '',
    targetValue: 0,
    dueDate: '',
    milestones: [],
    color: ColorTheme.primary, // Default color from our theme
  });
  
  // State for new milestone in form
  const [newMilestone, setNewMilestone] = useState({
    description: '',
    targetValue: 0,
  });
  
  // State for showing the form
  const [showForm, setShowForm] = useState(false);
  
  // Animation classes for smooth transitions
  const transitionClasses = "transition-all duration-300";
  
  // Save goals to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('soloLevelingGoals', JSON.stringify(goals));
  }, [goals]);
  
  // Calculate current progress for each goal
  const getGoalProgress = (goal) => {
    if (goal.targetType === 'stat') {
      // For stat goals, compare current stat value to target
      const currentValue = rawStats[goal.targetStat] || 0;
      return {
        current: currentValue,
        target: goal.targetValue,
        percentage: Math.min(100, Math.round((currentValue / goal.targetValue) * 100)),
      };
    }
    
    if (goal.targetType === 'task') {
      // For task count goals, count completed tasks
      const currentValue = taskHistory.length;
      return {
        current: currentValue,
        target: goal.targetValue,
        percentage: Math.min(100, Math.round((currentValue / goal.targetValue) * 100)),
      };
    }
    
    // Default fallback
    return {
      current: 0,
      target: goal.targetValue,
      percentage: 0,
    };
  };
  
  // Check if a goal is completed
  const isGoalCompleted = (goal) => {
    const progress = getGoalProgress(goal);
    return progress.current >= progress.target;
  };
  
  // Check if a goal is due soon (within 3 days)
  const isGoalDueSoon = (goal) => {
    if (!goal.dueDate) return false;
    
    const dueDate = new Date(goal.dueDate);
    const today = new Date();
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 0 && diffDays <= 3;
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Handle form submission to create a new goal
  const handleSubmitGoal = (e) => {
    e.preventDefault();
    
    // Create the new goal object
    const goalToAdd = {
      ...newGoal,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      milestones: [...newGoal.milestones],
    };
    
    // Add the goal to our list
    setGoals([...goals, goalToAdd]);
    
    // Reset the form
    setNewGoal({
      title: '',
      description: '',
      targetType: 'stat',
      targetStat: Object.keys(rawStats).length > 0 ? Object.keys(rawStats)[0] : '',
      targetValue: 0,
      dueDate: '',
      milestones: [],
      color: ColorTheme.primary,
    });
    
    // Hide the form
    setShowForm(false);
  };
  
  // Add a milestone to the new goal
  const handleAddMilestone = () => {
    if (!newMilestone.description || newMilestone.targetValue <= 0) return;
    
    setNewGoal({
      ...newGoal,
      milestones: [
        ...newGoal.milestones,
        {
          ...newMilestone,
          id: Date.now().toString(),
          completed: false,
        }
      ],
    });
    
    // Reset milestone form
    setNewMilestone({
      description: '',
      targetValue: 0,
    });
  };
  
  // Remove a milestone from the new goal
  const handleRemoveMilestone = (id) => {
    setNewGoal({
      ...newGoal,
      milestones: newGoal.milestones.filter(m => m.id !== id),
    });
  };
  
  // Delete a goal
  const handleDeleteGoal = (goalId) => {
    setGoals(goals.filter(g => g.id !== goalId));
  };
  
  // Toggle milestone completion status
  const handleToggleMilestone = (goalId, milestoneId) => {
    setGoals(goals.map(goal => {
      if (goal.id !== goalId) return goal;
      
      return {
        ...goal,
        milestones: goal.milestones.map(milestone => {
          if (milestone.id !== milestoneId) return milestone;
          
          return {
            ...milestone,
            completed: !milestone.completed,
          };
        }),
      };
    }));
  };
  
  // Render the progress bar for a goal
  const renderProgressBar = (goal) => {
    const progress = getGoalProgress(goal);
    
    return (
      <div className="mt-2">
        <div className="flex justify-between text-xs mb-1">
          <span>{progress.current} / {progress.target}</span>
          <span>{progress.percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div 
            className={`h-2.5 rounded-full ${transitionClasses}`}
            style={{ 
              width: `${progress.percentage}%`,
              backgroundColor: goal.color || '#6366f1',
            }}
          ></div>
        </div>
      </div>
    );
  };
  
  // Render milestone list for a goal
  const renderMilestones = (goal) => {
    if (!goal.milestones || goal.milestones.length === 0) return null;
    
    return (
      <div className="mt-3">
        <h4 className="text-sm font-medium mb-1 flex items-center">
          <RiFlag2Line className="mr-1 h-4 w-4 text-gray-500" />
          Milestones
        </h4>
        <ul className="text-sm space-y-2">
          {goal.milestones.map(milestone => (
            <li key={milestone.id} className="flex items-start">
              <div className="mt-0.5 mr-2">
                <input
                  type="checkbox"
                  id={`milestone-${milestone.id}`}
                  checked={milestone.completed}
                  onChange={() => handleToggleMilestone(goal.id, milestone.id)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <label 
                htmlFor={`milestone-${milestone.id}`}
                className={`${milestone.completed ? 'line-through text-gray-500' : ''} cursor-pointer`}
              >
                <div>
                  {milestone.description}
                  {milestone.targetValue ? ` (${milestone.targetValue})` : ''}
                </div>
              </label>
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  // Render a goal card
  const renderGoalCard = (goal) => {
    const isCompleted = isGoalCompleted(goal);
    const isDueSoon = isGoalDueSoon(goal);
    
    // Choose card style based on goal status
    const cardStyle = isCompleted 
      ? 'bg-green-50 border-green-200 hover:bg-green-100' 
      : isDueSoon 
        ? 'bg-amber-50 border-amber-200 hover:bg-amber-100' 
        : 'bg-white border-gray-200 hover:bg-gray-50';
    
    return (
      <div
        key={goal.id}
        className={`border rounded-lg p-4 ${cardStyle} ${transitionClasses}`}
      >
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: goal.color || '#6366f1' }}
            ></div>
            {goal.title}
          </h3>
          <button
            onClick={() => handleDeleteGoal(goal.id)}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
            aria-label="Delete goal"
          >
            <RiCloseLine className="h-5 w-5" />
          </button>
        </div>
        
        {goal.description && (
          <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
        )}
        
        <div className="mt-2 text-sm">
          <div className="flex items-center">
            <span className="font-medium mr-1 flex items-center">
              <RiLineLine className="mr-1 h-4 w-4 text-gray-500" />
              Type:
            </span>
            <span className="capitalize">{goal.targetType}</span>
            {goal.targetType === 'stat' && (
              <span className="ml-1">({goal.targetStat})</span>
            )}
          </div>
          
          {goal.dueDate && (
            <div className="flex items-center mt-1">
              <span className="font-medium mr-1 flex items-center">
                <RiCalendarLine className="mr-1 h-4 w-4 text-gray-500" />
                Due:
              </span>
              <span className={isDueSoon && !isCompleted ? 'text-amber-600 font-medium' : ''}>
                {formatDate(goal.dueDate)}
              </span>
            </div>
          )}
        </div>
        
        {renderProgressBar(goal)}
        {renderMilestones(goal)}
        
        {isCompleted && (
          <div className="mt-3 text-green-600 text-sm font-medium flex items-center bg-green-50 p-2 rounded">
            <RiCheckboxCircleLine className="h-4 w-4 mr-1" />
            Goal Completed!
          </div>
        )}
      </div>
    );
  };
  
  // Render the form for creating a new goal
  const renderGoalForm = () => {
    if (!showForm) {
      return (
        <button
          onClick={() => setShowForm(true)}
          className={`w-full p-3 border border-dashed border-gray-300 rounded-lg text-center hover:bg-gray-50 ${transitionClasses}`}
        >
          <div className="flex items-center justify-center text-gray-600">
            <RiAddLine className="h-5 w-5 mr-1" />
            Add New Goal
          </div>
        </button>
      );
    }
    
    return (
      <div className={`border rounded-lg p-4 bg-gray-50 ${transitionClasses}`}>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-lg flex items-center">
            <RiLineLine className="mr-2 h-5 w-5 text-indigo-500" />
            Create New Goal
          </h3>
          <button
            onClick={() => setShowForm(false)}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200"
            aria-label="Close form"
          >
            <RiCloseLine className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmitGoal}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center">
                <RiPencilLine className="mr-1 h-4 w-4 text-gray-500" />
                Title
              </label>
              <input
                type="text"
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center">
                <RiInformationLine className="mr-1 h-4 w-4 text-gray-500" />
                Description (Optional)
              </label>
              <textarea
                value={newGoal.description}
                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                rows="2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center">
                <RiLineLine className="mr-1 h-4 w-4 text-gray-500" />
                Goal Type
              </label>
              <select
                value={newGoal.targetType}
                onChange={(e) => setNewGoal({ ...newGoal, targetType: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="stat">Stat Level</option>
                <option value="task">Task Count</option>
              </select>
            </div>
            
            {newGoal.targetType === 'stat' && (
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center">
                  <RiBarChartLine className="mr-1 h-4 w-4 text-gray-500" />
                  Target Stat
                </label>
                <select
                  value={newGoal.targetStat}
                  onChange={(e) => setNewGoal({ ...newGoal, targetStat: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {Object.keys(rawStats).map(stat => (
                    <option key={stat} value={stat}>{stat}</option>
                  ))}
                </select>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center">
                <RiLineLine className="mr-1 h-4 w-4 text-gray-500" />
                Target Value
              </label>
              <input
                type="number"
                min="1"
                value={newGoal.targetValue}
                onChange={(e) => setNewGoal({ ...newGoal, targetValue: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center">
                <RiCalendarLine className="mr-1 h-4 w-4 text-gray-500" />
                Due Date (Optional)
              </label>
              <input
                type="date"
                value={newGoal.dueDate}
                onChange={(e) => setNewGoal({ ...newGoal, dueDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center">
                <RiPaletteLine className="mr-1 h-4 w-4 text-gray-500" />
                Goal Color
              </label>
              <div className="flex items-center">
                <input
                  type="color"
                  value={newGoal.color}
                  onChange={(e) => setNewGoal({ ...newGoal, color: e.target.value })}
                  className="mr-2 h-10 w-10 border-0 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={newGoal.color}
                  onChange={(e) => setNewGoal({ ...newGoal, color: e.target.value })}
                  className="px-3 py-2 border rounded-md w-32 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center">
                <RiFlag2Line className="mr-1 h-4 w-4 text-gray-500" />
                Milestones (Optional)
              </label>
              
              {newGoal.milestones.length > 0 && (
                <ul className="mb-3 text-sm space-y-1">
                  {newGoal.milestones.map(milestone => (
                    <li key={milestone.id} className="flex items-center justify-between bg-white p-2 rounded border">
                      <div>
                        {milestone.description}
                        {milestone.targetValue ? ` (${milestone.targetValue})` : ''}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMilestone(milestone.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                        aria-label="Remove milestone"
                      >
                        <RiCloseLine className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              
              <div className="flex space-x-2">
                <div className="flex-grow">
                  <input
                    type="text"
                    placeholder="Milestone description"
                    value={newMilestone.description}
                    onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="w-20">
                  <input
                    type="number"
                    placeholder="Value"
                    min="1"
                    value={newMilestone.targetValue || ''}
                    onChange={(e) => setNewMilestone({ ...newMilestone, targetValue: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddMilestone}
                  className="px-3 py-2 bg-gray-200 rounded-md text-sm hover:bg-gray-300 flex items-center"
                  disabled={!newMilestone.description || !newMilestone.targetValue}
                >
                  <RiAddCircleLine className="mr-1 h-4 w-4" />
                  Add
                </button>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50 flex items-center"
              >
                <RiCloseLine className="mr-1 h-4 w-4" />
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 flex items-center"
              >
                <RiSaveLine className="mr-1 h-4 w-4" />
                Create Goal
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  };
  
  // Group goals by status (active, completed, due soon)
  const groupedGoals = goals.reduce(
    (acc, goal) => {
      if (isGoalCompleted(goal)) {
        acc.completed.push(goal);
      } else if (isGoalDueSoon(goal)) {
        acc.dueSoon.push(goal);
      } else {
        acc.active.push(goal);
      }
      return acc;
    },
    { active: [], dueSoon: [], completed: [] }
  );
  
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6 border border-gray-100 transition-all duration-300 hover:shadow-md">
      <div>
        <h2 className="text-xl font-semibold mb-1 flex items-center">
          <RiLineLine className="mr-2 h-6 w-6 text-gray-700" />
          Goals & Milestones
          {!showTitle && <span className="ml-2 text-xs text-gray-500 font-normal">Track your progress towards specific targets</span>}
        </h2>
        <p className="text-xs text-gray-500 mb-3">Goals track raw stat points for precise progress measurement</p>
      </div>
      
      {renderGoalForm()}
      
      {goals.length === 0 && !showForm ? (
        <div className="mt-4 p-6 text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
          <RiLineLine className="mx-auto mb-2 h-10 w-10 text-gray-400" />
          <p className="mb-2">You haven't set any goals yet.</p>
          <p className="text-sm">Create your first goal to track progress towards important milestones!</p>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {groupedGoals.dueSoon.length > 0 && (
            <div>
              <h3 className="font-medium text-amber-600 mb-3 flex items-center bg-amber-50 p-2 rounded">
                <RiAlertLine className="h-5 w-5 mr-1" />
                Due Soon ({groupedGoals.dueSoon.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupedGoals.dueSoon.map(renderGoalCard)}
              </div>
            </div>
          )}
          
          {groupedGoals.active.length > 0 && (
            <div>
              <h3 className="font-medium text-blue-600 mb-3 flex items-center bg-blue-50 p-2 rounded">
                <RiBarChartLine className="h-5 w-5 mr-1" />
                In Progress ({groupedGoals.active.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupedGoals.active.map(renderGoalCard)}
              </div>
            </div>
          )}
          
          {groupedGoals.completed.length > 0 && (
            <div>
              <h3 className="font-medium text-green-600 mb-3 flex items-center bg-green-50 p-2 rounded">
                <RiCheckboxCircleLine className="h-5 w-5 mr-1" />
                Completed ({groupedGoals.completed.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupedGoals.completed.map(renderGoalCard)}
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-6 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
        <div className="flex items-start">
          <RiInformationLine className="h-5 w-5 mr-2 text-blue-500 mt-0.5" />
          <div>
            <p>Set meaningful goals and track your progress with milestones to stay motivated.</p>
            <p className="mt-1">Goals automatically update as you complete tasks and improve your stats!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalsTracking;