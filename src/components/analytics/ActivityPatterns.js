import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { useAnalyticsContext } from '../../contexts/AnalyticsContext';
import { 
  RiCalendarLine, 
  RiTimeLine, 
  RiInformationLine,
  RiBarChartLine,
  RiLineChartLine
} from 'react-icons/ri';
import ColorTheme from '../../styles/ColorTheme';

/**
 * ActivityPatterns Component
 * 
 * Visualizes user activity patterns across different time dimensions:
 * - Day of week (which days are most active)
 * - Time of day (which hours are most productive)
 * - Weekly activity trends
 * - Monthly activity trends
 */
const ActivityPatterns = ({ showTitle = false }) => {
  const { activityPatterns } = useAnalyticsContext();
  const [view, setView] = useState('day'); // 'day', 'hour', 'week', 'month'
  
  // Colors for the charts from our color theme
  const colors = {
    primary: ColorTheme.primary, 
    secondary: ColorTheme.secondary,
    tertiary: ColorTheme.info,
    accent: ColorTheme.warning,
  };
  
  // Animation configuration for charts
  const animationConfig = {
    animationBegin: 0,
    animationDuration: 1000,
    animationEasing: 'ease-in-out'
  };
  
  // Helper to convert day numbers to readable names
  const getDayName = (dayNum) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[dayNum];
  };
  
  // Helper to format hour to readable time
  const getHourLabel = (hour) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    if (hour > 12) return `${hour - 12} PM`;
    return `${hour} AM`;
  };
  
  // Format data for day of week view
  const getDayData = () => {
    if (!activityPatterns || !activityPatterns.byDay) return [];
    
    return Object.entries(activityPatterns.byDay).map(([day, count]) => ({
      name: getDayName(day),
      tasks: count,
      dayNum: parseInt(day), // For sorting
    })).sort((a, b) => a.dayNum - b.dayNum);
  };
  
  // Format data for hour of day view
  const getHourData = () => {
    if (!activityPatterns || !activityPatterns.byHour) return [];
    
    return Object.entries(activityPatterns.byHour).map(([hour, count]) => ({
      name: getHourLabel(hour),
      tasks: count,
      hourNum: parseInt(hour), // For sorting
    })).sort((a, b) => a.hourNum - b.hourNum);
  };
  
  // Format data for week view
  const getWeekData = () => {
    if (!activityPatterns || !activityPatterns.byWeek) return [];
    
    return Object.entries(activityPatterns.byWeek)
      .map(([week, count]) => ({
        name: week,
        tasks: count,
      }))
      .sort((a, b) => b.name.localeCompare(a.name)) // Sort by week descending
      .slice(0, 8); // Only show the last 8 weeks
  };
  
  // Format data for month view
  const getMonthData = () => {
    if (!activityPatterns || !activityPatterns.byMonth) return [];
    
    return Object.entries(activityPatterns.byMonth)
      .map(([month, count]) => {
        const [year, monthNum] = month.split('-');
        return {
          name: `${monthNum}/${year.substring(2)}`,
          fullName: new Date(year, monthNum - 1, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          tasks: count,
          timestamp: new Date(year, monthNum - 1, 1).getTime(), // For sorting
        };
      })
      .sort((a, b) => b.timestamp - a.timestamp) // Sort by month descending
      .slice(0, 6); // Only show the last 6 months
  };
  
  // Determine most active day/time
  const getMostActiveData = () => {
    if (!activityPatterns) return [];
    
    const data = [];
    
    // Most active day
    if (activityPatterns.byDay) {
      const mostActiveDay = Object.entries(activityPatterns.byDay)
        .sort((a, b) => b[1] - a[1])[0];
      
      if (mostActiveDay) {
        data.push({
          name: 'Day',
          value: mostActiveDay[1],
          label: getDayName(mostActiveDay[0]),
        });
      }
    }
    
    // Most active hour
    if (activityPatterns.byHour) {
      const mostActiveHour = Object.entries(activityPatterns.byHour)
        .sort((a, b) => b[1] - a[1])[0];
      
      if (mostActiveHour) {
        data.push({
          name: 'Time',
          value: mostActiveHour[1],
          label: getHourLabel(mostActiveHour[0]),
        });
      }
    }
    
    return data;
  };
  
  // Get chart data based on selected view
  const getChartData = () => {
    switch (view) {
      case 'day': return getDayData();
      case 'hour': return getHourData();
      case 'week': return getWeekData();
      case 'month': return getMonthData();
      default: return [];
    }
  };
  
  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="font-medium">{label}</p>
          <p className="text-sm mt-1">
            <span className="font-medium">Tasks Completed:</span> {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };
  
  // Render the appropriate chart based on view
  const renderChart = () => {
    const data = getChartData();
    
    if (!data || data.length === 0) {
      return (
        <div className="p-10 text-center text-gray-500">
          <RiInformationLine className="mx-auto mb-2 h-10 w-10" />
          <p>Not enough activity data available yet.</p>
          <p className="text-sm mt-2">Complete more tasks to see your patterns!</p>
        </div>
      );
    }
    
    // For day and hour views, show a bar chart
    if (view === 'day' || view === 'hour') {
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
            <Bar 
              dataKey="tasks" 
              name="Completed Tasks" 
              fill={colors.primary} 
              radius={[4, 4, 0, 0]}  // Rounded bar tops
              barSize={view === 'hour' ? 15 : 30}  // Thinner bars for hourly view
            />
          </BarChart>
        </ResponsiveContainer>
      );
    }
    
    // For week and month views, show a line chart
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
          <Tooltip 
            labelFormatter={(label) => view === 'month' ? data.find(d => d.name === label)?.fullName : label}
            content={<CustomTooltip />}
          />
          <Line 
            type="monotone" 
            dataKey="tasks" 
            name="Completed Tasks" 
            stroke={colors.tertiary} 
            strokeWidth={3} 
            dot={{ r: 6, fill: colors.tertiary, strokeWidth: 1, stroke: '#fff' }}
            activeDot={{ r: 8, fill: colors.tertiary, strokeWidth: 2, stroke: '#fff' }} 
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };
  
  // Render the most active day/time chart
  const renderMostActivePie = () => {
    const data = getMostActiveData();
    
    if (!data || data.length === 0) {
      return null;
    }
    
    const COLORS = [colors.primary, colors.tertiary];
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mt-4 transition-all duration-300 hover:shadow-md">
        <h3 className="text-lg font-semibold mb-2 flex items-center">
          <RiBarChartLine className="mr-2 h-5 w-5 text-gray-600" />
          Most Active
        </h3>
        
        <div className="flex items-center">
          <div className="w-1/2">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={70}
                  innerRadius={30}  // Make it a donut chart
                  fill="#8884d8"
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1500}
                  animationEasing="ease-out"
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [value, `Most Active ${props.payload.name}`]} 
                  itemStyle={{ color: '#4b5563' }}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    borderRadius: '0.375rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    border: '1px solid #e5e7eb'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="w-1/2 pl-4">
            <div className="space-y-4">
              {data.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <div>
                    <div className="font-medium flex items-center">
                      {index === 0 ? <RiCalendarLine className="mr-1 h-4 w-4" /> : <RiTimeLine className="mr-1 h-4 w-4" />}
                      Most Active {item.name}:
                    </div>
                    <div className="ml-5 text-lg font-bold">{item.label}</div>
                    <div className="ml-5 text-sm text-gray-600">
                      {item.value} tasks completed
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Button for view toggling with active state
  const ViewToggleButton = ({ viewName, label, icon: Icon, active }) => (
    <button
      className={`px-3 py-1 rounded text-sm flex items-center transition-all duration-200 ${
        active 
          ? `bg-${ColorTheme.primary} text-white shadow-sm` 
          : 'bg-gray-200 hover:bg-gray-300'
      }`}
      onClick={() => setView(viewName)}
      aria-pressed={active}
    >
      <Icon className="mr-1 h-4 w-4" />
      {label}
    </button>
  );
  
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6 border border-gray-100 transition-all duration-300 hover:shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center">
          <RiBarChartLine className="mr-2 h-6 w-6 text-gray-700" />
          Activity Patterns
          {!showTitle && <span className="ml-2 text-xs text-gray-500 font-normal">When you're most productive</span>}
        </h2>
        
        <div className="flex space-x-2">
          <ViewToggleButton 
            viewName="day" 
            label="Day" 
            icon={RiCalendarLine} 
            active={view === 'day'} 
          />
          <ViewToggleButton 
            viewName="hour" 
            label="Time" 
            icon={RiTimeLine} 
            active={view === 'hour'} 
          />
          <ViewToggleButton 
            viewName="week" 
            label="Weekly" 
            icon={RiLineChartLine} 
            active={view === 'week'} 
          />
          <ViewToggleButton 
            viewName="month" 
            label="Monthly" 
            icon={RiBarChartLine} 
            active={view === 'month'} 
          />
        </div>
      </div>
      
      {renderChart()}
      {renderMostActivePie()}
      
      <div className="mt-4 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
        <div className="flex items-start">
          <RiInformationLine className="h-5 w-5 mr-2 text-blue-500 mt-0.5" />
          <div>
            <p>This chart shows when you're most active based on your completed tasks.</p>
            <p className="mt-1">Use these insights to schedule tasks during your naturally productive times.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityPatterns;