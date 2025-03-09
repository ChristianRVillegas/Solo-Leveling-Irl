import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, LineChart, Line, Legend, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { useAnalyticsContext } from '../../contexts/AnalyticsContext';
import { useGame } from '../../contexts/GameContext';
import { 
  RiLineChartLine,
  RiCalendarLine, 
  RiBarChartLine, 
  RiRadarLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiArrowRightUpLine,
  RiInformationLine
} from 'react-icons/ri';
import ColorTheme from '../../styles/ColorTheme';

/**
 * ProgressReports Component
 * 
 * Shows user progress over time (weekly or monthly):
 * - Task and achievement completion
 * - Stat growth trends
 * - Radar comparison between current and previous period
 */
const ProgressReports = ({ showTitle = false }) => {
  const { weeklyProgress, monthlyProgress, formatWeekKey, formatMonthKey, rawStats } = useAnalyticsContext();
  const { stats } = useGame();
  const [timeframe, setTimeframe] = useState('weekly'); // 'weekly' or 'monthly'
  const [chartType, setChartType] = useState('tasks'); // 'tasks', 'stats', 'radar'
  
  // Animation configuration for charts
  const animationConfig = {
    animationBegin: 0,
    animationDuration: 1000,
    animationEasing: 'ease-in-out'
  };
  
  // Get stat colors from our color theme
  const getStatColors = () => {
    const statTypes = Object.keys(rawStats);
    const statColors = {};
    
    // Assign colors based on stat type if they exist in ColorTheme
    statTypes.forEach(stat => {
      statColors[stat] = ColorTheme.statColors[stat.toLowerCase()] || ColorTheme.primary;
    });
    
    return statColors;
  };
  
  // Format data for charts based on timeframe
  const getChartData = () => {
    const data = timeframe === 'weekly' ? weeklyProgress : monthlyProgress;
    if (!data) return [];
    
    // Convert object to array and sort by date
    return Object.entries(data)
      .map(([timeKey, periodData]) => {
        const formattedName = timeframe === 'weekly' 
          ? formatWeekKey(timeKey)
          : formatMonthKey(timeKey);
          
        return {
          key: timeKey,
          name: formattedName,
          tasks: periodData.tasks.completed,
          achievements: periodData.achievements,
          ...periodData.stats, // Include all stats
        };
      })
      .sort((a, b) => {
        // Sort by key descending (newest first)
        return b.key.localeCompare(a.key);
      });
  };
  
  // Get radar chart data for most recent period
  const getRadarData = () => {
    const chartData = getChartData();
    if (chartData.length === 0) return [];
    
    // Get the most recent period
    const latestPeriod = chartData[0];
    
    // Format data for radar chart
    return Object.keys(rawStats).map(stat => ({
      subject: stat,
      current: latestPeriod[stat] || 0,
      // If there's a previous period, include that too
      previous: chartData.length > 1 ? (chartData[1][stat] || 0) : 0,
    }));
  };
  
  // Custom tooltip for bar/line charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    
    return (
      <div className="bg-white p-4 shadow-lg rounded-lg border border-gray-200">
        <p className="font-semibold text-gray-800 mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="text-sm">{entry.name}: </span>
              <span className="text-sm font-medium ml-1">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Custom tooltip for radar chart
  const CustomRadarTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    
    const data = payload[0].payload;
    const change = data.current - data.previous;
    const changePercent = data.previous ? Math.round((change / data.previous) * 100) : 0;
    
    return (
      <div className="bg-white p-4 shadow-lg rounded-lg border border-gray-200">
        <p className="font-semibold text-gray-800 mb-2">{data.subject}</p>
        <div className="space-y-2">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-2 bg-indigo-500"></div>
            <span className="text-sm">Current: </span>
            <span className="text-sm font-medium ml-1">{data.current} points</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-2 bg-purple-300"></div>
            <span className="text-sm">Previous: </span>
            <span className="text-sm font-medium ml-1">{data.previous} points</span>
          </div>
          {data.previous > 0 && (
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${change >= 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm">Change: </span>
              <span className={`text-sm font-medium ml-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change >= 0 ? '+' : ''}{change} ({changePercent >= 0 ? '+' : ''}{changePercent}%)
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Render chart based on selected type
  const renderChart = () => {
    const data = getChartData();
    
    if (!data || data.length === 0) {
      return (
        <div className="p-10 text-center text-gray-500">
          <RiInformationLine className="mx-auto mb-2 h-10 w-10" />
          <p>Not enough progress data available yet.</p>
          <p className="text-sm mt-2">Complete more tasks to see your progress over time!</p>
        </div>
      );
    }
    
    if (chartType === 'tasks') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} {...animationConfig}>
            <CartesianGrid strokeDasharray="3 3" stroke={ColorTheme.chart.gridLines} />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#4b5563' }} 
              tickLine={{ stroke: '#6b7280' }}
            />
            <YAxis
              tick={{ fill: '#4b5563' }} 
              tickLine={{ stroke: '#6b7280' }}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="tasks" 
              name="Completed Tasks" 
              fill={ColorTheme.primary} 
              radius={[4, 4, 0, 0]}
              animationBegin={0}
              animationDuration={1200}
            />
            <Bar 
              dataKey="achievements" 
              name="Achievements" 
              fill={ColorTheme.secondary} 
              radius={[4, 4, 0, 0]}
              animationBegin={300}
              animationDuration={1200}
            />
          </BarChart>
        </ResponsiveContainer>
      );
    }
    
    if (chartType === 'stats') {
      const statTypes = Object.keys(rawStats);
      const statColors = getStatColors();
      
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} {...animationConfig}>
            <CartesianGrid strokeDasharray="3 3" stroke={ColorTheme.chart.gridLines} />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#4b5563' }} 
              tickLine={{ stroke: '#6b7280' }}
            />
            <YAxis
              tick={{ fill: '#4b5563' }} 
              tickLine={{ stroke: '#6b7280' }}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {statTypes.map((stat, index) => (
              <Line 
                key={stat}
                type="monotone" 
                dataKey={stat} 
                name={stat} 
                stroke={statColors[stat]} 
                strokeWidth={2}
                activeDot={{ r: 8 }}
                animationBegin={index * 100}
                animationDuration={1500}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );
    }
    
    if (chartType === 'radar') {
      const radarData = getRadarData();
      
      return (
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData} {...animationConfig}>
            <PolarGrid stroke={ColorTheme.chart.gridLines} />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563' }} />
            <PolarRadiusAxis tick={{ fill: '#4b5563' }} />
            <Radar 
              name="Current Period" 
              dataKey="current" 
              stroke={ColorTheme.primary} 
              fill={ColorTheme.primary} 
              fillOpacity={0.6} 
            />
            <Radar 
              name="Previous Period" 
              dataKey="previous" 
              stroke={ColorTheme.secondary} 
              fill={ColorTheme.secondary} 
              fillOpacity={0.3} 
            />
            <Legend />
            <Tooltip content={<CustomRadarTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      );
    }
  };
  
  // Generate a summary of the most recent period's progress
  const renderProgressSummary = () => {
    const data = getChartData();
    if (data.length < 2) return null;
    
    const current = data[0];
    const previous = data[1];
    
    // Calculate overall progress metrics
    const taskDiff = current.tasks - previous.tasks;
    const taskPercent = previous.tasks ? Math.round((taskDiff / previous.tasks) * 100) : 0;
    
    // Calculate total stat growth
    let totalStatGrowth = 0;
    let fastestGrowingStat = { name: '', growth: 0 };
    
    Object.keys(rawStats).forEach(stat => {
      const growth = (current[stat] || 0) - (previous[stat] || 0);
      totalStatGrowth += growth;
      
      if (growth > fastestGrowingStat.growth) {
        fastestGrowingStat = { name: stat, growth };
      }
    });
    
    return (
      <div className="bg-gray-50 p-4 rounded-lg mt-4 border border-gray-200 transition-all duration-300 hover:shadow-sm">
        <h3 className="font-medium mb-3 flex items-center">
          <RiArrowRightUpLine className="mr-2 h-5 w-5 text-gray-600" />
          {timeframe === 'weekly' ? 'This Week vs. Last Week' : 'This Month vs. Last Month'} Summary
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 transition-all duration-300 hover:shadow">
            <div className="text-sm text-gray-500 flex items-center">
              <RiBarChartLine className="mr-1 h-4 w-4" />
              Tasks Completed
            </div>
            <div className="text-xl font-semibold mt-1">{current.tasks}</div>
            <div className={`text-sm flex items-center ${taskDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {taskDiff >= 0 ? <RiArrowUpLine className="mr-1 h-4 w-4" /> : <RiArrowDownLine className="mr-1 h-4 w-4" />}
              {taskDiff >= 0 ? '+' : ''}{taskDiff} ({taskPercent >= 0 ? '+' : ''}{taskPercent}%)
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 transition-all duration-300 hover:shadow">
            <div className="text-sm text-gray-500 flex items-center">
              <RiLineChartLine className="mr-1 h-4 w-4" />
              Total Stat Growth
            </div>
            <div className="text-xl font-semibold mt-1">{totalStatGrowth}</div>
            <div className="text-sm text-gray-600">Points across all stats</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 transition-all duration-300 hover:shadow">
            <div className="text-sm text-gray-500 flex items-center">
              <RiArrowUpLine className="mr-1 h-4 w-4" />
              Fastest Growing Stat
            </div>
            <div className="text-xl font-semibold mt-1">
              {fastestGrowingStat.name || 'None'}
            </div>
            <div className="text-sm text-green-600 flex items-center">
              <RiArrowUpLine className="mr-1 h-4 w-4" />
              +{fastestGrowingStat.growth} points
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Button for toggling timeframes
  const TimeframeToggleButton = ({ value, label, icon: Icon, active }) => (
    <button
      className={`px-3 py-1 rounded text-sm flex items-center transition-all duration-200 ${
        active 
          ? 'bg-indigo-600 text-white shadow-sm' 
          : 'bg-gray-200 hover:bg-gray-300'
      }`}
      onClick={() => setTimeframe(value)}
      aria-pressed={active}
    >
      <Icon className="mr-1 h-4 w-4" />
      {label}
    </button>
  );
  
  // Button for toggling chart types
  const ChartTypeButton = ({ value, label, icon: Icon, active }) => (
    <button
      className={`px-3 py-1 rounded text-sm flex items-center transition-all duration-200 ${
        active 
          ? 'bg-indigo-600 text-white shadow-sm' 
          : 'bg-gray-200 hover:bg-gray-300'
      }`}
      onClick={() => setChartType(value)}
      aria-pressed={active}
    >
      <Icon className="mr-1 h-4 w-4" />
      {label}
    </button>
  );
  
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6 border border-gray-100 transition-all duration-300 hover:shadow-md">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center">
            <RiLineChartLine className="mr-2 h-6 w-6 text-gray-700" />
            Progress Reports
            {!showTitle && <span className="ml-2 text-xs text-gray-500 font-normal">Track your development over time</span>}
          </h2>
          <p className="text-xs text-gray-500">Showing raw stat points for more detailed tracking</p>
        </div>
        
        <div className="flex space-x-2">
          <TimeframeToggleButton 
            value="weekly" 
            label="Weekly" 
            icon={RiCalendarLine}
            active={timeframe === 'weekly'} 
          />
          <TimeframeToggleButton 
            value="monthly" 
            label="Monthly" 
            icon={RiCalendarLine}
            active={timeframe === 'monthly'} 
          />
        </div>
      </div>
      
      <div className="mb-4 flex space-x-2">
        <ChartTypeButton 
          value="tasks" 
          label="Tasks" 
          icon={RiBarChartLine}
          active={chartType === 'tasks'} 
        />
        <ChartTypeButton 
          value="stats" 
          label="Stats" 
          icon={RiLineChartLine}
          active={chartType === 'stats'} 
        />
        <ChartTypeButton 
          value="radar" 
          label="Compare" 
          icon={RiRadarLine}
          active={chartType === 'radar'} 
        />
      </div>
      
      {renderChart()}
      {renderProgressSummary()}
      
      <div className="mt-4 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
        <div className="flex items-start">
          <RiInformationLine className="h-5 w-5 mr-2 text-blue-500 mt-0.5" />
          <div>
            <p>These reports show your progress over time at a {timeframe === 'weekly' ? 'weekly' : 'monthly'} level.</p>
            <p className="mt-1">Use this to track your development and identify trends in your growth journey.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressReports;