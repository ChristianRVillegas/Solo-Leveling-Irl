import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { TITLES, TITLE_CATEGORIES, getTitleById } from '../../utils/titles/titleDefinitions';
import { getUserTitles, selectTitle, removeSelectedTitle } from '../../utils/titles/titleService';
import TitleDisplay from './TitleDisplay';

/**
 * Component for managing user titles, allowing selection and viewing
 */
const TitlesManager = () => {
  const { theme } = useTheme();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userTitles, setUserTitles] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    const loadUserTitles = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      
      try {
        const result = await getUserTitles(currentUser.uid);
        if (result.success) {
          // Map title IDs to full title objects
          const titles = result.titles.map(titleId => getTitleById(titleId)).filter(Boolean);
          setUserTitles(titles);
          setSelectedTitle(result.selectedTitle);
        }
      } catch (error) {
        console.error('Error loading titles:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserTitles();
  }, [currentUser]);
  
  const handleSelectTitle = async (titleId) => {
    if (!currentUser) return;
    
    try {
      if (selectedTitle === titleId) {
        // Deselect the title
        const result = await removeSelectedTitle(currentUser.uid);
        if (result.success) {
          setSelectedTitle(null);
        }
      } else {
        // Select a new title
        const result = await selectTitle(currentUser.uid, titleId);
        if (result.success) {
          setSelectedTitle(titleId);
        }
      }
    } catch (error) {
      console.error('Error selecting title:', error);
    }
  };
  
  const categories = [
    { id: 'all', name: 'All', icon: '🏆' },
    { id: TITLE_CATEGORIES.STAT_BASED, name: 'Stat-Based', icon: '📊' },
    { id: TITLE_CATEGORIES.ACHIEVEMENT, name: 'Achievement', icon: '🎯' },
    { id: TITLE_CATEGORIES.CHALLENGE, name: 'Challenge', icon: '⚔️' },
    { id: TITLE_CATEGORIES.SPECIAL, name: 'Special', icon: '✨' }
  ];
  
  // Filter titles by category and search term
  const filteredTitles = userTitles.filter(title => {
    const matchesCategory = activeCategory === 'all' || title.category === activeCategory;
    const matchesSearch = !searchQuery || 
      title.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      title.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });
  
  if (loading) {
    return (
      <div className="card p-lg flex justify-center items-center">
        <div>Loading titles...</div>
      </div>
    );
  }
  
  return (
    <div className="animate-fade-in">
      <div className="card">
        <h3 className="text-xl mb-md">Your Titles</h3>
        
        {userTitles.length > 0 ? (
          <>
            {/* Currently selected title */}
            <div className="mb-lg" style={{ textAlign: 'center' }}>
              <div className="text-sm mb-xs" style={{ opacity: 0.7 }}>Currently displaying</div>
              {selectedTitle ? (
                <TitleDisplay 
                  titleId={selectedTitle} 
                  size="large"
                  style={{ padding: '4px 12px' }}
                />
              ) : (
                <div style={{ opacity: 0.5 }}>No title selected</div>
              )}
            </div>
            
            {/* Search and filter */}
            <div className="mb-md">
              <input
                type="text"
                placeholder="Search titles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input mb-sm"
              />
              
              <div className="flex overflow-x-auto mb-md" style={{ borderBottom: `1px solid ${theme.border}` }}>
                {categories.map(category => (
                  <button
                    key={category.id}
                    className={`px-md py-sm whitespace-nowrap ${activeCategory === category.id ? 'font-bold' : ''}`}
                    style={{
                      color: activeCategory === category.id ? theme.primary : theme.text,
                      borderBottom: activeCategory === category.id ? `2px solid ${theme.primary}` : 'none',
                      backgroundColor: 'transparent',
                      margin: '0 4px',
                      marginBottom: '-1px'
                    }}
                    onClick={() => setActiveCategory(category.id)}
                  >
                    <span className="mr-xs">{category.icon}</span>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Titles grid */}
            {filteredTitles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                {filteredTitles.map(title => (
                  <div
                    key={title.id}
                    onClick={() => handleSelectTitle(title.id)}
                    style={{
                      padding: 'var(--spacing-md)',
                      backgroundColor: selectedTitle === title.id ? 
                        `${title.rarity.color}20` : 'rgba(255, 255, 255, 0.05)',
                      borderRadius: 'var(--border-radius-md)',
                      border: selectedTitle === title.id ? 
                        `1px solid ${title.rarity.color}` : 'none',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                    className="hover:bg-opacity-20"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-2xl mr-md">{title.icon}</span>
                        <div>
                          <div className="font-bold" style={{ color: title.rarity.color }}>
                            {title.name}
                          </div>
                          <div className="text-sm" style={{ opacity: 0.7 }}>
                            {title.description}
                          </div>
                        </div>
                      </div>
                      <div 
                        className="text-xs py-xs px-sm"
                        style={{ 
                          backgroundColor: `${title.rarity.color}20`,
                          color: title.rarity.color,
                          borderRadius: 'var(--border-radius-sm)',
                          fontWeight: 'bold'
                        }}
                      >
                        {title.rarity.name}
                      </div>
                    </div>
                    
                    {selectedTitle === title.id && (
                      <div 
                        className="text-xs mt-sm" 
                        style={{ color: theme.primary, textAlign: 'right' }}
                      >
                        Active
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-lg text-center opacity-70">
                No titles match your search.
              </div>
            )}
          </>
        ) : (
          <div className="p-lg text-center">
            <p>You haven't earned any titles yet.</p>
            <p className="mt-sm text-sm opacity-70">
              Complete tasks, level up your stats, and participate in challenges to earn titles!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TitlesManager;