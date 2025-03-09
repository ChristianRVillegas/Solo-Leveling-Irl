import React, { createContext, useContext, useState, useEffect } from 'react';

// Define our theme options
const themes = {
  light: {
    name: 'light',
    primary: '#4F46E5', // Indigo
    secondary: '#10B981', // Emerald
    background: '#F9FAFB',
    card: '#FFFFFF',
    text: '#1F2937',
    border: '#E5E7EB',
    accent: '#8B5CF6', // Violet
    success: '#10B981', // Emerald
    danger: '#EF4444', // Red
    warning: '#F59E0B', // Amber
  },
  dark: {
    name: 'dark',
    primary: '#6366F1', // Indigo
    secondary: '#10B981', // Emerald
    background: '#111827',
    card: '#1F2937',
    text: '#F9FAFB',
    border: '#374151',
    accent: '#8B5CF6', // Violet
    success: '#10B981', // Emerald
    danger: '#EF4444', // Red
    warning: '#F59E0B', // Amber
  },
  gaming: {
    name: 'gaming',
    primary: '#7C3AED', // Purple
    secondary: '#EC4899', // Pink
    background: '#0F172A',
    card: '#1E293B',
    text: '#F8FAFC',
    border: '#334155',
    accent: '#F97316', // Orange
    success: '#22C55E', // Green
    danger: '#EF4444', // Red
    warning: '#EAB308', // Yellow
  }
};

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    // Get theme from localStorage or default to dark
    const savedTheme = localStorage.getItem('theme');
    return savedTheme && themes[savedTheme] ? savedTheme : 'dark';
  });

  const theme = themes[currentTheme];

  // Update the CSS variables when theme changes
  useEffect(() => {
    Object.entries(theme).forEach(([key, value]) => {
      if (key !== 'name') {
        document.documentElement.style.setProperty(`--color-${key}`, value);
      }
    });
    localStorage.setItem('theme', currentTheme);
  }, [currentTheme, theme]);

  const changeTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, theme, changeTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};
