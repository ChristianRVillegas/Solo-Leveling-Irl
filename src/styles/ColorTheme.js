/**
 * ColorTheme.js
 * 
 * This file contains a consistent color theme for the entire analytics dashboard.
 * The colors are designed to be accessible and distinguishable for users with color vision deficiencies.
 * Each stat has its own unique color, and we maintain consistent colors for various UI elements.
 */

// Main color palette
const ColorTheme = {
  // Primary UI colors
  primary: '#4f46e5',     // Indigo-600 - Main app color
  secondary: '#7c3aed',   // Violet-600 - Secondary elements
  success: '#059669',     // Emerald-600 - Success states
  warning: '#d97706',     // Amber-600 - Warning states
  danger: '#dc2626',      // Red-600 - Error/danger states
  info: '#0284c7',        // Sky-600 - Information highlights
  
  // Stat specific colors - colorblind friendly palette
  // These colors have been selected to be distinguishable even with protanopia, deuteranopia, and tritanopia
  statColors: {
    strength: '#ef4444',      // Red
    intelligence: '#3b82f6',  // Blue
    charisma: '#8b5cf6',      // Purple
    vitality: '#10b981',      // Green
    agility: '#f59e0b',       // Amber
    wisdom: '#6366f1',        // Indigo
  },
  
  // Chart and visualization colors
  chart: {
    background: '#ffffff',      // White
    gridLines: '#e5e7eb',       // Gray-200
    tooltip: '#f3f4f6',         // Gray-100
    
    // Color scales for heatmaps, correlations, etc.
    positive: '#059669',        // Green
    negative: '#dc2626',        // Red
    neutral: '#9ca3af',         // Gray-400
    
    // Color scales for intensity (light to dark)
    scale: [
      '#dbeafe', // Blue-100
      '#93c5fd', // Blue-300
      '#60a5fa', // Blue-400
      '#3b82f6', // Blue-500
      '#2563eb', // Blue-600
      '#1d4ed8', // Blue-700
    ],
  }
};

export default ColorTheme;