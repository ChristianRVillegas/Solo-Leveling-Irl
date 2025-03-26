import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, LineChart, Line, Legend, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { useAnalyticsContext } from '../../contexts/AnalyticsContext';
import { useGame } from '../../contexts/GameContext';
import { useTheme } from '../../contexts/ThemeContext';
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
  const { theme } = useTheme();
  const [timeframe, setTimeframe] = useState('weekly'); // 'weekly' or 'monthly'
  const [chartType, setChartType] = useState('tasks'); // 'tasks', 'stats', 'radar'
  
  // Animation configuration for charts
  const animationConfig = {
    animationBegin: 0,
    animationDuration: 1000,
    animationEasing: 'ease-in-out'
  };
  
  // Get stat colors from our theme
  const getStatColors = () => {
    const statTypes = Object.keys(rawStats);
    const statColors = {};
    
    // Assign colors based on stat type
    const baseColors = [
      theme.primary,
      theme.success,
      theme.warning,
      theme.accent,
      theme.info,
      theme.secondary
    ];
    
    statTypes.forEach((stat, index) => {
      statColors[stat] = baseColors[index % baseColors.length];
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
      <div style={{ backgroundColor: theme.card, padding: '16px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)', border: `1px solid ${theme.border}` }}>
        <p className="font-semibold mb-2">{label}</p>
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
      <div style={{ backgroundColor: theme.card, padding: '16px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)', border: `1px solid ${theme.border}` }}>
        <p className="font-semibold mb-2">{data.subject}</p>
        <div className="space-y-2">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: theme.primary }}></div>
            <span className="text-sm">Current: </span>
            <span className="text-sm font-medium ml-1">{data.current} points</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: `${theme.primary}80` }}></div>
            <span className="text-sm">Previous: </span>
            <span className="text-sm font-medium ml-1">{data.previous} points</span>
          </div>
          {data.previous > 0 && (
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: change >= 0 ? theme.success : theme.danger }}></div>
              <span className="text-sm">Change: </span>
              <span className="text-sm font-medium ml-1" style={{ color: change >= 0 ? theme.success : theme.danger }}>
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
        <div className="p-10 text-center">
          <RiInformationLine className="mx-auto mb-2 h-10 w-10 opacity-50" />
          <p>Not enough progress data available yet.</p>
          <p className="text-sm mt-2">Complete more tasks to see your progress over time!</p>
        </div>
      );
    }
    
    if (chartType === 'tasks') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} {...animationConfig}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.border} opacity={0.5} />
            <XAxis 
              dataKey="name" 
              tick={{ fill: theme.text }} 
              tickLine={{ stroke: theme.border }}
            />
            <YAxis
              tick={{ fill: theme.text }} 
              tickLine={{ stroke: theme.border }}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="tasks" 
              name="Completed Tasks" 
              fill={theme.primary} 
              radius={[4, 4, 0, 0]}
              animationBegin={0}
              animationDuration={1200}
            />
            <Bar 
              dataKey="achievements" 
              name="Achievements" 
              fill={theme.accent} 
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
            <CartesianGrid strokeDasharray="3 3" stroke={theme.border} opacity={0.5} />
            <XAxis 
              dataKey="name" 
              tick={{ fill: theme.text }} 
              tickLine={{ stroke: theme.border }}
            />
            <YAxis
              tick={{ fill: theme.text }} 
              tickLine={{ stroke: theme.border }}
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
            <PolarGrid stroke={theme.border} opacity={0.5} />
            <PolarAngleAxis dataKey="subject" tick={{ fill: theme.text }} />
            <PolarRadiusAxis tick={{ fill: theme.text }} />
            <Radar 
              name="Current Period" 
              dataKey="current" 
              stroke={theme.primary} 
              fill={theme.primary} 
              fillOpacity={0.6} 
            />
            <Radar 
              name="Previous Period" 
              dataKey="previous" 
              stroke={`${theme.primary}80`} 
              fill={`${theme.primary}80`} 
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
      <div className="card p-4 mt-4">
        <h3 className="font-medium mb-3 flex items-center">
          <RiArrowRightUpLine className="mr-2 h-5 w-5" style={{ color: theme.primary }} />
          {timeframe === 'weekly' ? 'This Week vs. Last Week' : 'This Month vs. Last Month'} Summary
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-4">
            <div className="text-sm opacity-70 flex items-center">
              <RiBarChartLine className="mr-1 h-4 w-4" />
              Tasks Completed
            </div>
            <div className="text-xl font-semibold mt-1">{current.tasks}</div>
            <div className="text-sm flex items-center" style={{ color: taskDiff >= 0 ? theme.success : theme.danger }}>
              {taskDiff >= 0 ? <RiArrowUpLine className="mr-1 h-4 w-4" /> : <RiArrowDownLine className="mr-1 h-4 w-4" />}
              {taskDiff >= 0 ? '+' : ''}{taskDiff} ({taskPercent >= 0 ? '+' : ''}{taskPercent}%)
            </div>
          </div>
          
          <div className="card p-4">
            <div className="text-sm opacity-70 flex items-center">
              <RiLineChartLine className="mr-1 h-4 w-4" />
              Total Stat Growth
            </div>
            <div className="text-xl font-semibold mt-1">{totalStatGrowth}</div>
            <div className="text-sm opacity-70">Points across all stats</div>
          </div>
          
          <div className="card p-4">
            <div className="text-sm opacity-70 flex items-center">
              <RiArrowUpLine className="mr-1 h-4 w-4" />
              Fastest Growing Stat
            </div>
            <div className="text-xl font-semibold mt-1">
              {fastestGrowingStat.name || 'None'}
            </div>
            <div className="text-sm flex items-center" style={{ color: theme.success }}>
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
      className={`px-3 py-1 rounded text-sm flex items-center transition-all duration-200 ${active ? 'font-bold' : ''}`}
      style={{
        backgroundColor: active ? `${theme.primary}20` : 'rgba(255, 255, 255, 0.05)',
        color: active ? theme.primary : theme.text,
      }}
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
      className={`px-3 py-1 rounded text-sm flex items-center transition-all duration-200 ${active ? 'font-bold' : ''}`}
      style={{
        backgroundColor: active ? `${theme.primary}20` : 'rgba(255, 255, 255, 0.05)',
        color: active ? theme.primary : theme.text,
      }}
      onClick={() => setChartType(value)}
      aria-pressed={active}
    >
      <Icon className="mr-1 h-4 w-4" />
      {label}
    </button>
  );
  
  return (
    <div className="card mb-6 transition-all duration-300">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center">
            <RiLineChartLine className="mr-2 h-6 w-6" style={{ color: theme.primary }} />
            Progress Reports
            {!showTitle && <span className="ml-2 text-xs opacity-70 font-normal">Track your development over time</span>}
          </h2>
          <p className="text-xs opacity-70">Showing raw stat points for more detailed tracking</p>
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
      
      <div className="mt-4 text-sm p-3 rounded-lg card" style={{ backgroundColor: `${theme.primary}10` }}>
        <div className="flex items-start">
          <RiInformationLine className="h-5 w-5 mr-2 mt-0.5" style={{ color: theme.primary }} />
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