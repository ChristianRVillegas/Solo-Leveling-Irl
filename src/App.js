// In src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { GameProvider } from './contexts/GameContext';
import { AchievementProvider } from './contexts/AchievementContext';
import { TaskProvider } from './contexts/TaskContext';
import { AnalyticsProvider } from './contexts/AnalyticsContext';
import { AuthProvider, useAuth } from './contexts/AuthContext'; // Add this

// Import pages
import Dashboard from './pages/Dashboard';
import Stats from './pages/Stats';
import Tasks from './pages/Tasks';
import Settings from './pages/Settings';
import Layout from './components/Layout';
import Achievements from './pages/Achievements';
import Calendar from './pages/Calendar';
import EnhancedTasks from './pages/EnhancedTasks';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Login from './pages/Login';

// Global styles
import './App.css';

// Private route component
const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return currentUser ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <GameProvider>
          <AchievementProvider>
            <TaskProvider>
              <AnalyticsProvider>
                <Router>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={
                      <PrivateRoute>
                        <Layout>
                          <Dashboard />
                        </Layout>
                      </PrivateRoute>
                    } />
                    <Route path="/stats" element={
                      <PrivateRoute>
                        <Layout>
                          <Stats />
                        </Layout>
                      </PrivateRoute>
                    } />
                    <Route path="/tasks" element={
                      <PrivateRoute>
                        <Layout>
                          <EnhancedTasks />
                        </Layout>
                      </PrivateRoute>
                    } />
                    <Route path="/achievements" element={
                      <PrivateRoute>
                        <Layout>
                          <Achievements />
                        </Layout>
                      </PrivateRoute>
                    } />
                    <Route path="/calendar" element={
                      <PrivateRoute>
                        <Layout>
                          <Calendar />
                        </Layout>
                      </PrivateRoute>
                    } />
                    <Route path="/settings" element={
                      <PrivateRoute>
                        <Layout>
                          <Settings />
                        </Layout>
                      </PrivateRoute>
                    } />
                    <Route path="/analytics" element={
                      <PrivateRoute>
                        <Layout>
                          <Analytics />
                        </Layout>
                      </PrivateRoute>
                    } />
                    <Route path="/profile" element={
                      <PrivateRoute>
                        <Layout>
                          <Profile />
                        </Layout>
                      </PrivateRoute>
                    } />
                  </Routes>
                </Router>
              </AnalyticsProvider>
            </TaskProvider>
          </AchievementProvider>
        </GameProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;