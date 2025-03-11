import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { GameProvider } from './contexts/GameContext';
import { AchievementProvider } from './contexts/AchievementContext';
import { TaskProvider } from './contexts/TaskContext';
import { AnalyticsProvider } from './contexts/AnalyticsContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import FriendProvider from './contexts/FriendContext';
import NotificationProvider from './contexts/NotificationContext';
import ChallengeProvider from './contexts/ChallengeContext';

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
import Social from './pages/Social/Social';
import FriendProfile from './pages/Social/FriendProfile';
import Challenges from './pages/Social/Challenges';

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
                <FriendProvider>
                  <NotificationProvider>
                    <ChallengeProvider>
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
                    <Route path="/social" element={
                      <PrivateRoute>
                        <Layout>
                          <Social />
                        </Layout>
                      </PrivateRoute>
                    } />
                    <Route path="/social/friend/:friendId" element={
                      <PrivateRoute>
                        <Layout>
                          <FriendProfile />
                        </Layout>
                      </PrivateRoute>
                    } />
                    <Route path="/social/challenges" element={
                      <PrivateRoute>
                        <Layout>
                          <Challenges />
                        </Layout>
                      </PrivateRoute>
                    } />
                      </Routes>
                      </Router>
                    </ChallengeProvider>
                  </NotificationProvider>
                </FriendProvider>
              </AnalyticsProvider>
            </TaskProvider>
          </AchievementProvider>
        </GameProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;