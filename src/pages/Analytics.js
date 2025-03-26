import React, { useState } from 'react';
import ActivityPatterns from '../components/analytics/ActivityPatterns';
import StatCorrelations from '../components/analytics/StatCorrelations';
import ProgressReports from '../components/analytics/ProgressReports';
import InsightsComponent from '../components/analytics/InsightsComponent';
import GoalsTracking from '../components/analytics/GoalsTracking';
import BasicStatGrid from '../components/analytics/BasicStatGrid';
import { useTheme } from '../contexts/ThemeContext';
import { 
  RiLayoutLine, 
  RiBarChartLine, 
  RiGitMergeLine, 
  RiLineChartLine, 
  RiLineLine,
  RiDashboardLine
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
  const { theme } = useTheme();
  
  // Define tabs/sections with React Icons
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: RiDashboardLine },
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
          <div className="space-y-6 animate-fade-in">
            <InsightsComponent />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ActivityPatterns />
              <ProgressReports />
            </div>
            <div className="card">
              <BasicStatGridWrapper />
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

  // Wrapper for BasicStatGrid that handles styling
  const BasicStatGridWrapper = () => {
    return (
      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <RiBarChartLine className="mr-2 h-5 w-5" />
          Stat Activity Heatmap
        </h3>
        <BasicStatGrid />
      </div>
    );
  };
  
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-lg">
        <h2 className="text-2xl">Analytics & Insights</h2>
      </div>
      
      {/* Tab navigation */}
      <div className="mb-lg" style={{ borderBottom: `1px solid ${theme.border}` }}>
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-md py-sm rounded-t-lg transition-all duration-200 ${isActive ? 'font-bold' : ''}`}
                style={{
                  color: isActive ? theme.primary : theme.text,
                  borderBottom: isActive ? `2px solid ${theme.primary}` : 'none',
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                  marginBottom: '-1px'
                }}
                aria-selected={isActive}
                role="tab"
              >
                <Icon className="mr-2 h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Content area */}
      <div className="transition-all duration-300 ease-in-out">
        {renderContent()}
      </div>
    </div>
  );
};

export default Analytics;