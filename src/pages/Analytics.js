import React, { useState } from 'react';
import ActivityPatterns from '../components/analytics/ActivityPatterns';
import StatCorrelations from '../components/analytics/StatCorrelations';
import ProgressReports from '../components/analytics/ProgressReports';
import InsightsComponent from '../components/analytics/InsightsComponent';
import GoalsTracking from '../components/analytics/GoalsTracking';
import BasicStatGrid from '../components/analytics/BasicStatGrid';
import { 
  RiLayoutLine, 
  RiBarChartLine, 
  RiGitMergeLine, 
  RiLineChartLine, 
  RiLineLine 
} from 'react-icons/ri';

/**
 * Analytics Page Component
 * 
 * This is the main analytics dashboard that displays various data visualizations
 * and insights based on the user's activities and progress.
 */
const Analytics = () => {
  // State for active tab/section
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Define tabs/sections with React Icons
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: RiLayoutLine },
    { id: 'activity', label: 'Activity Patterns', icon: RiBarChartLine },
    { id: 'correlations', label: 'Stat Correlations', icon: RiGitMergeLine },
    { id: 'progress', label: 'Progress Reports', icon: RiLineChartLine },
    { id: 'goals', label: 'Goals & Milestones', icon: RiLineLine },
  ];
  
  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <InsightsComponent />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ActivityPatterns />
              <ProgressReports />
            </div>
            {/* Added BasicStatGrid in a card container */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 mb-6 border border-gray-100 dark:border-gray-800">
              <BasicStatGrid />
            </div>
            <GoalsTracking />
          </div>
        );
      case 'activity':
        return <ActivityPatterns showTitle />;
      case 'correlations':
        return <StatCorrelations showTitle />;
      case 'progress':
        return <ProgressReports showTitle />;
      case 'goals':
        return <GoalsTracking showTitle />;
      default:
        return null;
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">Analytics & Insights</h1>
      
      {/* Tab navigation */}
      <div className="mb-6 border-b dark:border-gray-700">
        <nav className="flex space-x-1 md:space-x-4 overflow-x-auto pb-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-t-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                aria-selected={activeTab === tab.id}
                role="tab"
              >
                <Icon className="mr-2 h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
      
      {/* Content area */}
      <div className="transition-all duration-300 ease-in-out">
        {renderContent()}
      </div>
    </div>
  );
};

export default Analytics;