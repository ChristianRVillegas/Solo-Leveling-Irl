import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Settings = () => {
  const { playerName, dispatch } = useGame();
  const { theme, themes, currentTheme, changeTheme } = useTheme();
  const { logout } = useAuth();
  const [newPlayerName, setNewPlayerName] = useState(playerName);
  const navigate = useNavigate();

  const handleNameChange = (e) => {
    e.preventDefault();
    if (newPlayerName.trim()) {
      dispatch({
        type: 'SET_PLAYER_NAME',
        payload: newPlayerName.trim()
      });
    }
  };

  const handleResetGame = () => {
    if (window.confirm('Are you sure you want to reset all game data? This cannot be undone!')) {
      dispatch({ type: 'RESET_GAME' });
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      try {
        await logout();
        navigate('/login');
      } catch (error) {
        console.error('Failed to log out', error);
      }
    }
  };

  // Functionality to export game data
  const handleExportData = () => {
    const gameData = localStorage.getItem('gameState');
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(gameData);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "solo_leveling_irl_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Functionality to import game data
  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (window.confirm('This will replace your current game data. Continue?')) {
          dispatch({
            type: 'IMPORT_GAME_STATE',
            payload: data
          });
        }
      } catch (error) {
        alert('Failed to import game data. The file may be corrupted.');
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl mb-md">Settings</h2>

      <div className="card mb-lg">
        <h3 className="text-xl mb-md">Appearance</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-md">
          {Object.keys(themes).map((themeName) => (
            <div 
              key={themeName}
              className="card"
              style={{ 
                cursor: 'pointer',
                borderColor: currentTheme === themeName ? themes[themeName].primary : theme.border,
                borderWidth: currentTheme === themeName ? '2px' : '1px',
                borderStyle: 'solid',
                backgroundColor: themes[themeName].card,
                color: themes[themeName].text
              }}
              onClick={() => changeTheme(themeName)}
            >
              <div className="flex items-center justify-between mb-md">
                <h4 style={{ margin: 0, color: themes[themeName].text }}>{themeName.charAt(0).toUpperCase() + themeName.slice(1)} Theme</h4>
                {currentTheme === themeName && (
                  <span style={{ color: themes[themeName].success }}>✓ Active</span>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: themes[themeName].primary }}></div>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: themes[themeName].secondary }}></div>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: themes[themeName].accent }}></div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                <div style={{ 
                  padding: 'var(--spacing-xs) var(--spacing-sm)',
                  backgroundColor: themes[themeName].background,
                  color: themes[themeName].text,
                  borderRadius: 'var(--border-radius-sm)',
                  fontSize: '0.75rem'
                }}>
                  Background
                </div>
                <div style={{ 
                  padding: 'var(--spacing-xs) var(--spacing-sm)',
                  backgroundColor: themes[themeName].card,
                  color: themes[themeName].text,
                  borderRadius: 'var(--border-radius-sm)',
                  fontSize: '0.75rem',
                  border: `1px solid ${themes[themeName].border}`
                }}>
                  Card
                </div>
                <div style={{ 
                  padding: 'var(--spacing-xs) var(--spacing-sm)',
                  backgroundColor: themes[themeName].primary,
                  color: 'white',
                  borderRadius: 'var(--border-radius-sm)',
                  fontSize: '0.75rem'
                }}>
                  Primary Button
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card mb-lg">
        <h3 className="text-xl mb-md">Profile</h3>
        <form onSubmit={handleNameChange}>
          <div className="form-group">
            <label htmlFor="playerName" className="form-label">Your Name</label>
            <input
              type="text"
              id="playerName"
              className="form-input"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Update Name
          </button>
        </form>
      </div>

      <div className="card mb-lg">
        <h3 className="text-xl mb-md">Data Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div>
            <h4 className="mb-sm">Sign Out</h4>
            <p className="text-sm mb-md">
              Sign out of your account. Your data will remain saved for when you log back in.
            </p>
            <button 
              className="btn btn-outline"
              onClick={handleLogout}
            >
              Sign Out
            </button>
          </div>
          
          <div>
            <h4 className="mb-sm">Export Your Data</h4>
            <p className="text-sm mb-md">
              Download a backup of your current progress and tasks. You can import this file later to restore your data.
            </p>
            <button 
              className="btn btn-outline"
              onClick={handleExportData}
            >
              Export Data
            </button>
          </div>
          
          <div>
            <h4 className="mb-sm">Import Data</h4>
            <p className="text-sm mb-md">
              Restore your progress from a previously exported file. This will replace your current data.
            </p>
            <label className="btn btn-outline" style={{ position: 'relative' }}>
              Import Data
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                style={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  opacity: 0,
                  width: '100%',
                  height: '100%',
                  cursor: 'pointer'
                }}
              />
            </label>
          </div>
        </div>
      </div>

      <div className="card" style={{ borderColor: theme.danger, borderWidth: '1px', borderStyle: 'solid' }}>
        <h3 className="text-xl mb-md" style={{ color: theme.danger }}>Danger Zone</h3>
        <p className="mb-md">
          Reset all of your progress, tasks, and stats. This action cannot be undone.
        </p>
        <button 
          className="btn btn-danger"
          onClick={handleResetGame}
        >
          Reset All Data
        </button>
      </div>
    </div>
  );
};

export default Settings;
