import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const { theme } = useTheme();
  const { dispatch } = useGame();
  const { currentUser, login, signup } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('login');
  
  // Form states
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });
  
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  // Error states
  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');
  
  // Loading states
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);
  
  // Handle login form changes
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle register form changes
  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle login submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    
    try {
      // Just login - the auth state change will trigger loading the appropriate user data
      await login(loginForm.email, loginForm.password);
      // Navigation will happen automatically in the useEffect when currentUser changes
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(error.message || 'Failed to login. Please try again.');
      setIsLoggingIn(false);
    }
  };
  
  // Handle registration submission
  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError('');
    
    // Validate password match
    if (registerForm.password !== registerForm.confirmPassword) {
      setRegisterError('Passwords do not match');
      return;
    }
    
    setIsRegistering(true);
    
    try {
      // The signup already sets the display name, which will be used for the player name
      await signup(registerForm.email, registerForm.password, registerForm.name);
      // Navigation will happen automatically in the useEffect when currentUser changes
    } catch (error) {
      console.error('Registration error:', error);
      setRegisterError(error.message || 'Failed to create account. Please try again.');
      setIsRegistering(false);
    }
  };

  return (
    <div 
      style={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.background,
        padding: 'var(--spacing-lg)'
      }}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '450px',
          backgroundColor: theme.card,
          borderRadius: 'var(--border-radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden'
        }}
      >
        {/* Header with tabs */}
        <div 
          style={{
            display: 'flex',
            borderBottom: `1px solid ${theme.border}`
          }}
        >
          <button
            onClick={() => setActiveTab('login')}
            style={{
              flex: 1,
              padding: 'var(--spacing-md)',
              backgroundColor: activeTab === 'login' ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
              borderBottom: activeTab === 'login' ? `2px solid ${theme.primary}` : 'none',
              color: activeTab === 'login' ? theme.primary : theme.text,
              fontWeight: activeTab === 'login' ? 'bold' : 'normal',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab('register')}
            style={{
              flex: 1,
              padding: 'var(--spacing-md)',
              backgroundColor: activeTab === 'register' ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
              borderBottom: activeTab === 'register' ? `2px solid ${theme.primary}` : 'none',
              color: activeTab === 'register' ? theme.primary : theme.text,
              fontWeight: activeTab === 'register' ? 'bold' : 'normal',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Register
          </button>
        </div>
        
        {/* Login Form */}
        {activeTab === 'login' && (
          <div style={{ padding: 'var(--spacing-xl)' }}>
            <h2 style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
              Welcome Back
            </h2>
            
            {loginError && (
              <div 
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: theme.danger,
                  padding: 'var(--spacing-md)',
                  borderRadius: 'var(--border-radius-md)',
                  marginBottom: 'var(--spacing-md)',
                  textAlign: 'center'
                }}
              >
                {loginError}
              </div>
            )}
            
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label" htmlFor="login-email">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  value={loginForm.email}
                  onChange={handleLoginChange}
                  className="form-input"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label className="form-label" htmlFor="login-password">
                    Password
                  </label>
                  <a 
                    href="#forgot-password"
                    style={{ 
                      fontSize: '0.875rem',
                      color: theme.primary
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Password reset will be implemented with Firebase');
                    }}
                  >
                    Forgot password?
                  </a>
                </div>
                <input
                  id="login-password"
                  type="password"
                  name="password"
                  value={loginForm.password}
                  onChange={handleLoginChange}
                  className="form-input"
                  placeholder="Your password"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="btn btn-primary"
                style={{ 
                  width: '100%',
                  marginTop: 'var(--spacing-lg)',
                  position: 'relative',
                  height: '44px'
                }}
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <span>Logging in...</span>
                ) : (
                  <span>Login</span>
                )}
              </button>
            </form>
            
            <p 
              style={{ 
                textAlign: 'center',
                marginTop: 'var(--spacing-lg)',
                fontSize: '0.875rem',
                color: 'rgba(255, 255, 255, 0.7)'
              }}
            >
              Don't have an account?{' '}
              <button 
                onClick={() => setActiveTab('register')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: theme.primary,
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Register
              </button>
            </p>
          </div>
        )}
        
        {/* Register Form */}
        {activeTab === 'register' && (
          <div style={{ padding: 'var(--spacing-xl)' }}>
            <h2 style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
              Create Account
            </h2>
            
            {registerError && (
              <div 
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: theme.danger,
                  padding: 'var(--spacing-md)',
                  borderRadius: 'var(--border-radius-md)',
                  marginBottom: 'var(--spacing-md)',
                  textAlign: 'center'
                }}
              >
                {registerError}
              </div>
            )}
            
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label className="form-label" htmlFor="register-name">
                  Display Name
                </label>
                <input
                  id="register-name"
                  type="text"
                  name="name"
                  value={registerForm.name}
                  onChange={handleRegisterChange}
                  className="form-input"
                  placeholder="How others will see you"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="register-email">
                  Email
                </label>
                <input
                  id="register-email"
                  type="email"
                  name="email"
                  value={registerForm.email}
                  onChange={handleRegisterChange}
                  className="form-input"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="register-password">
                  Password
                </label>
                <input
                  id="register-password"
                  type="password"
                  name="password"
                  value={registerForm.password}
                  onChange={handleRegisterChange}
                  className="form-input"
                  placeholder="Create a strong password"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="register-confirm-password">
                  Confirm Password
                </label>
                <input
                  id="register-confirm-password"
                  type="password"
                  name="confirmPassword"
                  value={registerForm.confirmPassword}
                  onChange={handleRegisterChange}
                  className="form-input"
                  placeholder="Re-enter your password"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="btn btn-primary"
                style={{ 
                  width: '100%',
                  marginTop: 'var(--spacing-lg)',
                  position: 'relative',
                  height: '44px'
                }}
                disabled={isRegistering}
              >
                {isRegistering ? (
                  <span>Creating account...</span>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>
            
            <p 
              style={{ 
                textAlign: 'center',
                marginTop: 'var(--spacing-lg)',
                fontSize: '0.875rem',
                color: 'rgba(255, 255, 255, 0.7)'
              }}
            >
              Already have an account?{' '}
              <button 
                onClick={() => setActiveTab('login')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: theme.primary,
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Login
              </button>
            </p>
          </div>
        )}
        
        {/* App branding footer */}
        <div
          style={{
            borderTop: `1px solid ${theme.border}`,
            padding: 'var(--spacing-md)',
            textAlign: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.1)'
          }}
        >
          <h3 style={{ margin: 0, fontSize: '1.25rem' }}>
            Solo Leveling IRL
          </h3>
          <p style={{ 
            margin: '8px 0 0 0',
            fontSize: '0.875rem',
            opacity: 0.7
          }}>
            Track your progress, level up in real life
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
