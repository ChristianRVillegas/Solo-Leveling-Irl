import React, { useState } from 'react';
import { 
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';
import { useAnalyticsContext } from '../../contexts/AnalyticsContext';
import { useGame } from '../../contexts/GameContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  RiGitMergeLine, 
  RiInformationLine, 
  RiArrowRightLine,
  RiArrowLeftLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiQuestionLine
} from 'react-icons/ri';

/**
 * StatCorrelations Component
 * 
 * Visualizes relationships between different stat categories.
 * Shows correlation strengths and allows users to explore specific stat relationships.
 */
const StatCorrelations = ({ showTitle = false }) => {
  const { statCorrelations, rawStats } = useAnalyticsContext();
  const { stats } = useGame();
  const { theme } = useTheme();
  const [selectedStats, setSelectedStats] = useState(null);
  
  // Animation configuration for charts
  const animationConfig = {
    animationBegin: 0,
    animationDuration: 1000,
    animationEasing: 'ease-in-out'
  };
  
  // Enhanced colors with semantic meaning
  const colors = {
    veryStrong: theme.primary,
    strong: `${theme.primary}d0`,
    moderate: `${theme.primary}a0`,
    weak: `${theme.primary}70`,
    veryWeak: `${theme.border}`,
    positive: theme.success,
    negative: theme.danger,
  };
  
  // Helper function to get color based on correlation strength
  const getCorrelationColor = (correlation) => {
    const absValue = Math.abs(correlation);
    if (absValue >= 0.8) return colors.veryStrong;
    if (absValue >= 0.6) return colors.strong;
    if (absValue >= 0.4) return colors.moderate;
    if (absValue >= 0.2) return colors.weak;
    return colors.veryWeak;
  };
  
  // Helper function to get direction icon
  const getDirectionIcon = (correlation) => {
    if (correlation > 0.6) return <RiArrowUpLine style={{ color: theme.success }} />;
    if (correlation < -0.6) return <RiArrowDownLine style={{ color: theme.danger }} />;
    if (correlation > 0) return <RiArrowUpLine style={{ color: 'currentColor', opacity: 0.5 }} />;
    if (correlation < 0) return <RiArrowDownLine style={{ color: 'currentColor', opacity: 0.5 }} />;
    return <RiQuestionLine style={{ color: 'currentColor', opacity: 0.5 }} />;
  };
  
  // Prepare data for the correlation matrix
  const getCorrelationData = () => {
    if (!statCorrelations || statCorrelations.length === 0) return [];
    
    // Create a matrix of stat pairs and their correlation values
    const statTypes = Object.keys(rawStats);
    const matrix = [];
    
    for (let i = 0; i < statTypes.length; i++) {
      for (let j = 0; j < statTypes.length; j++) {
        // Don't include self-correlations
        if (i === j) continue;
        
        const statA = statTypes[i];
        const statB = statTypes[j];
        
        // Find the correlation between these two stats
        const correlation = statCorrelations.find(c => 
          (c.statA === statA && c.statB === statB) || 
          (c.statA === statB && c.statB === statA)
        );
        
        if (correlation) {
          matrix.push({
            x: statA,
            y: statB,
            z: correlation.correlation,
            strength: correlation.strength,
            dataPoints: correlation.dataPoints,
            color: getCorrelationColor(correlation.correlation),
            direction: correlation.correlation > 0 ? 'positive' : 'negative',
          });
        } else {
          // Include placeholder for missing correlations
          matrix.push({
            x: statA,
            y: statB,
            z: 0,
            strength: 'insufficient data',
            dataPoints: 0,
            color: colors.veryWeak,
            direction: 'neutral',
          });
        }
      }
    }
    
    return matrix;
  };
  
  // Get data for scatter plot of specific stat pair
  const getScatterData = () => {
    if (!selectedStats) return [];
    
    // Find the correlation between these stats
    const correlation = statCorrelations.find(c => 
      (c.statA === selectedStats.x && c.statB === selectedStats.y) || 
      (c.statA === selectedStats.y && c.statB === selectedStats.x)
    );
    
    if (!correlation) return [];
    
    // Generate sample data points based on the correlation
    const sampleData = [];
    const corr = correlation.correlation;
    const statX = correlation.statA === selectedStats.x ? correlation.statA : correlation.statB;
    const statY = correlation.statA === selectedStats.x ? correlation.statB : correlation.statA;
    
    // Generate ~20 sample points with the right trend
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * 10;
      // Add some variance based on the correlation strength
      const noise = Math.random() * 5 * (1 - Math.abs(corr));
      const y = corr > 0 
        ? x + noise 
        : 10 - x + noise;
      
      sampleData.push({
        x,
        y,
        statX,
        statY,
      });
    }
    
    return sampleData;
  };
  
  // Custom tooltip for correlation matrix
  const CustomMatrixTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    
    const data = payload[0].payload;
    const directionIcon = getDirectionIcon(data.z);
    
    return (
      <div style={{ backgroundColor: theme.card, padding: '16px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)', border: `1px solid ${theme.border}` }}>
        <p className="font-semibold mb-2 flex items-center">
          {data.x} & {data.y} Relationship
        </p>
        <div className="space-y-2">
          <div className="flex items-center">
            <span className="text-sm w-24">Correlation:</span>
            <span className="font-medium" style={{ color: data.z > 0 ? theme.success : data.z < 0 ? theme.danger : theme.text }}>
              {data.z.toFixed(2)} {directionIcon}
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-sm w-24">Strength:</span>
            <span className="font-medium capitalize">{data.strength}</span>
          </div>
          <div className="flex items-center">
            <span className="text-sm w-24">Direction:</span>
            <span className="font-medium capitalize">{data.direction}</span>
          </div>
          <div className="flex items-center">
            <span className="text-sm w-24">Data points:</span>
            <span className="font-medium">{data.dataPoints}</span>
          </div>
        </div>
      </div>
    );
  };
  
  // Custom tooltip for scatter plot
  const CustomScatterTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    
    const data = payload[0].payload;
    
    return (
      <div style={{ backgroundColor: theme.card, padding: '12px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)', border: `1px solid ${theme.border}` }}>
        <p className="font-medium">{selectedStats.x} vs {selectedStats.y}</p>
        <p className="text-sm mt-1">
          {selectedStats.x}: <span className="font-medium">{data.x.toFixed(1)}</span>
        </p>
        <p className="text-sm">
          {selectedStats.y}: <span className="font-medium">{data.y.toFixed(1)}</span>
        </p>
      </div>
    );
  };
  
  // Check if we have enough data to show correlations
  const hasCorrelationData = statCorrelations && statCorrelations.length > 0;
  
  return (
    <div className="card mb-6 transition-all duration-300">
      <div>
        <h2 className="text-xl font-semibold flex items-center">
          <RiGitMergeLine className="mr-2 h-6 w-6" style={{ color: theme.primary }} />
          Stat Correlations
          {!showTitle && <span className="ml-2 text-xs opacity-70 font-normal">How stats influence each other</span>}
        </h2>
        <p className="text-xs opacity-70 mb-3">Using raw stat points for more granular analysis</p>
      </div>
      
      {!hasCorrelationData ? (
        <div className="p-10 text-center">
          <RiInformationLine className="mx-auto mb-2 h-10 w-10 opacity-50" />
          <p>Not enough data to analyze stat correlations yet.</p>
          <p className="text-sm mt-2">Complete more tasks that develop multiple stats to see correlations!</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="transition-all duration-300">
            <h3 className="text-lg font-medium mb-2 flex items-center">
              <RiGitMergeLine className="mr-2 h-5 w-5" style={{ color: theme.primary }} />
              Correlation Matrix
            </h3>
            <p className="text-sm opacity-70 mb-3">
              This chart shows how your different stats relate to each other. Bigger and darker bubbles indicate stronger relationships.
            </p>
            
            <div className="card p-4">
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  {...animationConfig}
                >
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke={theme.border}
                    opacity={0.5}
                  />
                  <XAxis 
                    dataKey="x" 
                    type="category" 
                    name="Stat A" 
                    allowDuplicatedCategory={false}
                    tick={{ fill: theme.text }}
                    tickLine={{ stroke: theme.border }}
                    axisLine={{ stroke: theme.border }}
                  />
                  <YAxis 
                    dataKey="y" 
                    type="category" 
                    name="Stat B" 
                    allowDuplicatedCategory={false}
                    tick={{ fill: theme.text }}
                    tickLine={{ stroke: theme.border }}
                    axisLine={{ stroke: theme.border }}
                  />
                  <ZAxis 
                    dataKey="z" 
                    range={[20, 500]} 
                    name="Correlation" 
                  />
                  <Tooltip content={<CustomMatrixTooltip />} />
                  <Scatter
                    name="Stat Correlations"
                    data={getCorrelationData()}
                    onClick={(data) => setSelectedStats(data)}
                    cursor="pointer"
                  >
                    {getCorrelationData().map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.direction === 'positive' ? colors.positive : entry.direction === 'negative' ? colors.negative : colors.veryWeak} 
                        fillOpacity={Math.abs(entry.z) * 0.8 + 0.2} 
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex justify-center mt-3 space-x-8">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: colors.positive }}></div>
                <span className="text-sm flex items-center">
                  <RiArrowUpLine className="mr-1 h-4 w-4" />
                  Positive Correlation
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: colors.negative }}></div>
                <span className="text-sm flex items-center">
                  <RiArrowDownLine className="mr-1 h-4 w-4" />
                  Negative Correlation
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: colors.veryWeak }}></div>
                <span className="text-sm flex items-center">
                  <RiQuestionLine className="mr-1 h-4 w-4" />
                  Weak/No Correlation
                </span>
              </div>
            </div>
          </div>
          
          {selectedStats && (
            <div className="transition-all duration-500 animate-fadeIn">
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <div className="flex items-center">
                  {selectedStats.x}
                  <RiArrowRightLine className="mx-2 h-4 w-4" />
                  {selectedStats.y}
                </div>
                <span className="ml-2 text-sm font-normal opacity-70">Relationship</span>
              </h3>
              
              <div className="card p-4">
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    {...animationConfig}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.border} opacity={0.5} />
                    <XAxis 
                      type="number" 
                      dataKey="x" 
                      name={selectedStats.statX} 
                      unit=" pts"
                      tick={{ fill: theme.text }}
                      tickLine={{ stroke: theme.border }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="y" 
                      name={selectedStats.statY} 
                      unit=" pts"
                      tick={{ fill: theme.text }}
                      tickLine={{ stroke: theme.border }}
                    />
                    <Tooltip content={<CustomScatterTooltip />} />
                    <Scatter 
                      name={`${selectedStats.x} vs ${selectedStats.y}`} 
                      data={getScatterData()} 
                      fill={selectedStats.z > 0 ? colors.positive : colors.negative}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
                
                <div className="mt-3 card p-3">
                  <p className="font-medium mb-1">What does this mean?</p>
                  {selectedStats.z > 0.6 && (
                    <p>There's a strong positive relationship between these stats. When you improve one, the other tends to improve too!</p>
                  )}
                  {selectedStats.z < -0.6 && (
                    <p>There's a strong negative relationship between these stats. When you improve one, the other tends to decrease.</p>
                  )}
                  {selectedStats.z > 0.3 && selectedStats.z <= 0.6 && (
                    <p>There's a moderate positive relationship between these stats. They often improve together, but not always.</p>
                  )}
                  {selectedStats.z < -0.3 && selectedStats.z >= -0.6 && (
                    <p>There's a moderate negative relationship between these stats. Improvements in one sometimes come at the expense of the other.</p>
                  )}
                  {Math.abs(selectedStats.z) <= 0.3 && (
                    <p>There's little to no relationship between these stats. They tend to develop independently of each other.</p>
                  )}
                </div>
              </div>
              
              <button
                className="mt-3 text-sm flex items-center hover:opacity-80 transition-opacity"
                onClick={() => setSelectedStats(null)}
                style={{ color: theme.primary }}
              >
                <RiArrowLeftLine className="mr-1 h-4 w-4" />
                Back to correlation matrix
              </button>
            </div>
          )}
          
          <div className="mt-4 text-sm p-3 rounded-lg card" style={{ backgroundColor: `${theme.primary}10` }}>
            <div className="flex items-start">
              <RiInformationLine className="h-5 w-5 mr-2 mt-0.5" style={{ color: theme.primary }} />
              <div>
                <p><strong>What are correlations?</strong> Correlations show how your different stat areas relate to each other.</p>
                <p className="mt-1"><strong>How to use this:</strong> Identify synergies between stats to optimize your growth. If two stats have a strong positive correlation, tasks that improve one will likely boost the other too!</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatCorrelations;