import React from 'react';
import { useAnalyticsContext } from '../../contexts/AnalyticsContext';
import {
  RiBarChartLine,
  RiGitMergeLine,
  RiLineChartLine,
  RiArrowUpCircleLine,
  RiArrowDownCircleLine,
  RiCalendarLine,
  RiTimeLine,
  RiLightbulbLine,
  RiInformationLine,
  RiArrowUpLine,
  RiArrowDownLine,
} from 'react-icons/ri';
import ColorTheme from '../../styles/ColorTheme';

/**
 * InsightsComponent
 * 
 * Provides automated insights and recommendations based on user activity data.
 * Groups insights by type (productivity, correlations, trends, stats, recommendations).
 * Falls back to generic recommendations when not enough data is available.
 */
const InsightsComponent = () => {
  const { insights } = useAnalyticsContext();
  
  // Group insights by type
  const groupedInsights = insights.reduce((acc, insight) => {
    if (!acc[insight.type]) acc[insight.type] = [];
    acc[insight.type].push(insight);
    return acc;
  }, {});
  
  // Define group display names and icons
  const groupInfo = {
    productivity: {
      title: 'Productivity Patterns',
      icon: RiBarChartLine,
      description: 'Insights about when and how you work best',
      color: 'blue',
    },
    correlation: {
      title: 'Stat Relationships',
      icon: RiGitMergeLine,
      description: 'Connections between different stat areas',
      color: 'purple',
    },
    trend: {
      title: 'Recent Trends',
      icon: RiLineChartLine,
      description: 'Changes in your progress over time',
      color: 'green',
    },
    stat: {
      title: 'Stat Development',
      icon: RiArrowUpCircleLine,
      description: 'Progress in specific stat areas',
      color: 'amber',
    },
    recommendation: {
      title: 'Recommendations',
      icon: RiLightbulbLine,
      description: 'Suggested actions based on your data',
      color: 'indigo',
    },
  };
  
  // Get icon component based on icon name
  const getIconComponent = (iconName) => {
    switch (iconName) {
      case 'bar-chart':
        return RiBarChartLine;
      case 'git-merge':
        return RiGitMergeLine;
      case 'trending-up':
        return RiLineChartLine;
      case 'trending-down':
        return RiLineChartLine;
      case 'activity':
        return RiArrowUpCircleLine;
      case 'lightbulb':
        return RiLightbulbLine;
      case 'calendar':
        return RiCalendarLine;
      case 'clock':
        return RiTimeLine;
      case 'arrow-up-circle':
        return RiArrowUpCircleLine;
      case 'arrow-down-circle':
        return RiArrowDownCircleLine;
      default:
        return RiInformationLine;
    }
  };
  
  // Helper to get style based on insight type
  const getInsightStyle = (type) => {
    switch (type) {
      case 'productivity':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          iconBg: 'bg-blue-100',
          iconText: 'text-blue-600',
          hoverBg: 'hover:bg-blue-100',
        };
      case 'correlation':
        return {
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          text: 'text-purple-800',
          iconBg: 'bg-purple-100',
          iconText: 'text-purple-600',
          hoverBg: 'hover:bg-purple-100',
        };
      case 'trend':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-800',
          iconBg: 'bg-green-100',
          iconText: 'text-green-600',
          hoverBg: 'hover:bg-green-100',
        };
      case 'stat':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-800',
          iconBg: 'bg-amber-100',
          iconText: 'text-amber-600',
          hoverBg: 'hover:bg-amber-100',
        };
      case 'recommendation':
        return {
          bg: 'bg-indigo-50',
          border: 'border-indigo-200',
          text: 'text-indigo-800',
          iconBg: 'bg-indigo-100',
          iconText: 'text-indigo-600',
          hoverBg: 'hover:bg-indigo-100',
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-800',
          iconBg: 'bg-gray-100',
          iconText: 'text-gray-600',
          hoverBg: 'hover:bg-gray-100',
        };
    }
  };
  
  // Render a single insight card
  const renderInsightCard = (insight) => {
    const style = getInsightStyle(insight.type);
    const IconComponent = getIconComponent(insight.icon);
    
    return (
      <div 
        key={`${insight.type}-${insight.title}`} 
        className={`border rounded-lg p-4 mb-3 transition-all duration-300 ${style.bg} ${style.border} ${style.hoverBg}`}
      >
        <div className="flex items-center mb-2">
          <div className={`p-2 rounded-full ${style.iconBg} ${style.iconText} mr-3`}>
            <IconComponent className="h-5 w-5" />
          </div>
          <h3 className="font-semibold">{insight.title}</h3>
        </div>
        <p className={style.text}>{insight.description}</p>
        
        {/* Render any additional data specific to the insight type */}
        {insight.type === 'correlation' && insight.correlation && (
          <div className={`mt-3 p-2 rounded ${style.iconBg} ${style.text} text-sm`}>
            <div className="flex items-center">
              <span className="font-medium mr-1">Strength: </span>
              <span>{insight.correlation.strength}</span>
              <span className="mx-1">•</span>
              <span className="font-medium mr-1">Type: </span>
              <span className="flex items-center">
                {insight.correlation.correlation > 0 ? (
                  <>positive <RiArrowUpLine className="ml-1 h-4 w-4" /></>
                ) : (
                  <>negative <RiArrowDownLine className="ml-1 h-4 w-4" /></>
                )}
              </span>
            </div>
          </div>
        )}
        
        {insight.type === 'trend' && insight.data && (
          <div className={`mt-3 p-2 rounded ${style.iconBg} ${style.text} text-sm flex justify-between`}>
            <div>
              <span className="font-medium">Current: </span>
              <span>{insight.data.current}</span>
            </div>
            <div>
              <span className="font-medium">Previous: </span>
              <span>{insight.data.previous}</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium mr-1">Change: </span>
              <span>
                {insight.data.current > insight.data.previous ? '+' : ''}
                {insight.data.current - insight.data.previous}
              </span>
              {insight.data.current > insight.data.previous ? (
                <RiArrowUpLine className="ml-1 h-4 w-4 text-green-600" />
              ) : (
                <RiArrowDownLine className="ml-1 h-4 w-4 text-red-600" />
              )}
            </div>
          </div>
        )}
        
        {insight.type === 'stat' && insight.data && (
          <div className={`mt-3 p-2 rounded ${style.iconBg} ${style.text} text-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">Stat: </span>
                <span>{insight.stat}</span>
              </div>
              <div className={insight.data.current > insight.data.previous ? 'text-green-600' : 'text-red-600'}>
                <span className="font-medium">Change: </span>
                <span className="flex items-center">
                  {insight.data.current > insight.data.previous ? '+' : ''}
                  {insight.data.current - insight.data.previous} points
                  {insight.data.current > insight.data.previous ? (
                    <RiArrowUpLine className="ml-1 h-4 w-4" />
                  ) : (
                    <RiArrowDownLine className="ml-1 h-4 w-4" />
                  )}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Render insights grouped by type
  const renderInsightGroup = (type) => {
    const group = groupedInsights[type];
    if (!group || group.length === 0) return null;
    
    const info = groupInfo[type];
    const IconComponent = info.icon;
    
    const style = getInsightStyle(type);
    
    return (
      <div key={type} className="mb-6">
        <div className={`flex items-center mb-3 p-2 rounded-lg ${style.bg} ${style.border}`}>
          <div className={`p-2 rounded-full ${style.iconBg} ${style.iconText} mr-2`}>
            <IconComponent className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{info.title}</h2>
            <p className="text-sm text-gray-600">{info.description}</p>
          </div>
        </div>
        
        <div className="space-y-3">
          {group.map(renderInsightCard)}
        </div>
      </div>
    );
  };
  
  // Generate automatic recommendations if no insights are available
  const generateFallbackRecommendations = () => {
    return [
      {
        type: 'recommendation',
        title: 'Start Tracking Consistently',
        description: 'Complete tasks regularly to build up your data for personalized insights.',
        icon: 'calendar',
      },
      {
        type: 'recommendation',
        title: 'Balance Your Stats',
        description: 'Try to balance development across all stat categories for well-rounded growth.',
        icon: 'activity',
      },
      {
        type: 'recommendation',
        title: 'Create a Routine',
        description: 'Establish a consistent time each day for completing your tasks.',
        icon: 'clock',
      },
    ];
  };
  
  // Add animation classes for a smooth transition
  const animationClasses = "transition-all duration-500 animate-fadeIn";
  
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6 border border-gray-100 transition-all duration-300 hover:shadow-md">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <RiLightbulbLine className="mr-2 h-6 w-6 text-yellow-500" />
        Insights & Recommendations
      </h2>
      
      {Object.keys(groupedInsights).length === 0 ? (
        <div className={animationClasses}>
          <div className="p-4 mb-4 bg-gray-50 rounded-lg text-center text-gray-600 border border-gray-200">
            <RiInformationLine className="mx-auto mb-2 h-8 w-8 text-gray-400" />
            <p className="mb-2">Not enough data to generate personalized insights yet.</p>
            <p className="text-sm">Complete more tasks and check back later for custom recommendations!</p>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <RiLightbulbLine className="mr-2 h-5 w-5 text-indigo-500" />
              Getting Started Recommendations
            </h3>
            <div className="space-y-3">
              {generateFallbackRecommendations().map(renderInsightCard)}
            </div>
          </div>
        </div>
      ) : (
        <div className={animationClasses}>
          {Object.keys(groupInfo).map(type => renderInsightGroup(type))}
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
        <div className="flex items-start">
          <RiInformationLine className="h-5 w-5 mr-2 text-blue-500 mt-0.5" />
          <div>
            <p>Insights are automatically generated based on your activity patterns and progress.</p>
            <p className="mt-1">Check back regularly for updated recommendations as you collect more data!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightsComponent;