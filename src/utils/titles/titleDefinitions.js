/**
 * Defines all available titles in the game, their requirements, and display properties
 */

export const TITLE_CATEGORIES = {
  STAT_BASED: 'stat_based',
  ACHIEVEMENT: 'achievement',
  CHALLENGE: 'challenge',
  SPECIAL: 'special'
};

export const TITLE_RARITIES = {
  COMMON: { name: 'Common', color: '#BDBDBD' },
  UNCOMMON: { name: 'Uncommon', color: '#4CAF50' },
  RARE: { name: 'Rare', color: '#2196F3' },
  EPIC: { name: 'Epic', color: '#9C27B0' },
  LEGENDARY: { name: 'Legendary', color: '#FF9800' },
  MYTHIC: { name: 'Mythic', color: '#F44336' }
};

// Base definitions of all available titles
export const TITLES = [
  // Stat-based titles
  {
    id: 'disciplined',
    name: 'The Disciplined',
    description: 'Reached level 25 in Discipline',
    category: TITLE_CATEGORIES.STAT_BASED,
    rarity: TITLE_RARITIES.UNCOMMON,
    requirements: { stat: 'discipline', level: 25 },
    icon: '📋'
  },
  {
    id: 'master_linguist',
    name: 'Master Linguist',
    description: 'Reached level 25 in Linguist',
    category: TITLE_CATEGORIES.STAT_BASED,
    rarity: TITLE_RARITIES.UNCOMMON,
    requirements: { stat: 'linguist', level: 25 },
    icon: '🗣️'
  },
  {
    id: 'endurance_runner',
    name: 'Endurance Runner',
    description: 'Reached level 25 in Stamina',
    category: TITLE_CATEGORIES.STAT_BASED,
    rarity: TITLE_RARITIES.UNCOMMON,
    requirements: { stat: 'stamina', level: 25 },
    icon: '🏃'
  },
  {
    id: 'mighty',
    name: 'The Mighty',
    description: 'Reached level 25 in Strength',
    category: TITLE_CATEGORIES.STAT_BASED,
    rarity: TITLE_RARITIES.UNCOMMON,
    requirements: { stat: 'strength', level: 25 },
    icon: '💪'
  },
  {
    id: 'nimble',
    name: 'The Nimble',
    description: 'Reached level 25 in Agility',
    category: TITLE_CATEGORIES.STAT_BASED,
    rarity: TITLE_RARITIES.UNCOMMON,
    requirements: { stat: 'agility', level: 25 },
    icon: '🤸'
  },
  {
    id: 'genius',
    name: 'The Genius',
    description: 'Reached level 25 in Intelligence',
    category: TITLE_CATEGORIES.STAT_BASED,
    rarity: TITLE_RARITIES.UNCOMMON,
    requirements: { stat: 'intelligence', level: 25 },
    icon: '🧠'
  },
  {
    id: 'zen_master',
    name: 'Zen Master',
    description: 'Reached level 25 in Concentration',
    category: TITLE_CATEGORIES.STAT_BASED,
    rarity: TITLE_RARITIES.UNCOMMON,
    requirements: { stat: 'concentration', level: 25 },
    icon: '🧘'
  },
  
  // Higher tier stat titles
  {
    id: 'paragon_of_discipline',
    name: 'Paragon of Discipline',
    description: 'Reached level 50 in Discipline',
    category: TITLE_CATEGORIES.STAT_BASED,
    rarity: TITLE_RARITIES.RARE,
    requirements: { stat: 'discipline', level: 50 },
    icon: '📋'
  },
  {
    id: 'polyglot',
    name: 'Polyglot',
    description: 'Reached level 50 in Linguist',
    category: TITLE_CATEGORIES.STAT_BASED,
    rarity: TITLE_RARITIES.RARE,
    requirements: { stat: 'linguist', level: 50 },
    icon: '🗣️'
  },
  {
    id: 'marathon_champion',
    name: 'Marathon Champion',
    description: 'Reached level 50 in Stamina',
    category: TITLE_CATEGORIES.STAT_BASED,
    rarity: TITLE_RARITIES.RARE,
    requirements: { stat: 'stamina', level: 50 },
    icon: '🏃'
  },
  {
    id: 'titan',
    name: 'Titan',
    description: 'Reached level 50 in Strength',
    category: TITLE_CATEGORIES.STAT_BASED,
    rarity: TITLE_RARITIES.RARE,
    requirements: { stat: 'strength', level: 50 },
    icon: '💪'
  },
  {
    id: 'acrobat',
    name: 'Master Acrobat',
    description: 'Reached level 50 in Agility',
    category: TITLE_CATEGORIES.STAT_BASED,
    rarity: TITLE_RARITIES.RARE,
    requirements: { stat: 'agility', level: 50 },
    icon: '🤸'
  },
  {
    id: 'archmage',
    name: 'Archmage',
    description: 'Reached level 50 in Intelligence',
    category: TITLE_CATEGORIES.STAT_BASED,
    rarity: TITLE_RARITIES.RARE,
    requirements: { stat: 'intelligence', level: 50 },
    icon: '🧠'
  },
  {
    id: 'enlightened',
    name: 'The Enlightened',
    description: 'Reached level 50 in Concentration',
    category: TITLE_CATEGORIES.STAT_BASED,
    rarity: TITLE_RARITIES.RARE,
    requirements: { stat: 'concentration', level: 50 },
    icon: '🧘'
  },
  
  // Class-based titles from stat combinations
  {
    id: 'warrior',
    name: 'Warrior',
    description: 'Reached level 20 in both Strength and Stamina',
    category: TITLE_CATEGORIES.STAT_BASED,
    rarity: TITLE_RARITIES.UNCOMMON,
    requirements: { 
      multistat: true,
      stats: [
        { stat: 'strength', level: 20 },
        { stat: 'stamina', level: 20 }
      ]
    },
    icon: '⚔️'
  },
  {
    id: 'monk',
    name: 'Monk',
    description: 'Reached level 20 in both Discipline and Concentration',
    category: TITLE_CATEGORIES.STAT_BASED,
    rarity: TITLE_RARITIES.UNCOMMON,
    requirements: { 
      multistat: true,
      stats: [
        { stat: 'discipline', level: 20 },
        { stat: 'concentration', level: 20 }
      ]
    },
    icon: '🙏'
  },
  {
    id: 'wizard',
    name: 'Wizard',
    description: 'Reached level 20 in both Intelligence and Concentration',
    category: TITLE_CATEGORIES.STAT_BASED,
    rarity: TITLE_RARITIES.UNCOMMON,
    requirements: { 
      multistat: true,
      stats: [
        { stat: 'intelligence', level: 20 },
        { stat: 'concentration', level: 20 }
      ]
    },
    icon: '🧙'
  },
  {
    id: 'bard',
    name: 'Bard',
    description: 'Reached level 20 in both Linguist and Intelligence',
    category: TITLE_CATEGORIES.STAT_BASED,
    rarity: TITLE_RARITIES.UNCOMMON,
    requirements: { 
      multistat: true,
      stats: [
        { stat: 'linguist', level: 20 },
        { stat: 'intelligence', level: 20 }
      ]
    },
    icon: '🎭'
  },
  {
    id: 'ranger',
    name: 'Ranger',
    description: 'Reached level 20 in both Stamina and Discipline',
    category: TITLE_CATEGORIES.STAT_BASED,
    rarity: TITLE_RARITIES.UNCOMMON,
    requirements: { 
      multistat: true,
      stats: [
        { stat: 'stamina', level: 20 },
        { stat: 'discipline', level: 20 }
      ]
    },
    icon: '🏹'
  },
  {
    id: 'paladin',
    name: 'Paladin',
    description: 'Reached level 20 in both Strength and Discipline',
    category: TITLE_CATEGORIES.STAT_BASED,
    rarity: TITLE_RARITIES.UNCOMMON,
    requirements: { 
      multistat: true,
      stats: [
        { stat: 'strength', level: 20 },
        { stat: 'discipline', level: 20 }
      ]
    },
    icon: '🛡️'
  },
  {
    id: 'rogue',
    name: 'Rogue',
    description: 'Reached level 20 in both Agility and Concentration',
    category: TITLE_CATEGORIES.STAT_BASED,
    rarity: TITLE_RARITIES.UNCOMMON,
    requirements: { 
      multistat: true,
      stats: [
        { stat: 'agility', level: 20 },
        { stat: 'concentration', level: 20 }
      ]
    },
    icon: '🔪'
  },
  {
    id: 'dancer',
    name: 'Dancer',
    description: 'Reached level 20 in both Agility and Stamina',
    category: TITLE_CATEGORIES.STAT_BASED,
    rarity: TITLE_RARITIES.UNCOMMON,
    requirements: { 
      multistat: true,
      stats: [
        { stat: 'agility', level: 20 },
        { stat: 'stamina', level: 20 }
      ]
    },
    icon: '💃'
  },
  
  // Advanced class titles (higher requirements)
  {
    id: 'arch_paladin',
    name: 'Arch Paladin',
    description: 'Reached level 40 in both Strength and Discipline',
    category: TITLE_CATEGORIES.STAT_BASED,
    rarity: TITLE_RARITIES.RARE,
    requirements: { 
      multistat: true,
      stats: [
        { stat: 'strength', level: 40 },
        { stat: 'discipline', level: 40 }
      ]
    },
    icon: '🛡️'
  },
  {
    id: 'grand_wizard',
    name: 'Grand Wizard',
    description: 'Reached level 40 in both Intelligence and Concentration',
    category: TITLE_CATEGORIES.STAT_BASED,
    rarity: TITLE_RARITIES.RARE,
    requirements: { 
      multistat: true,
      stats: [
        { stat: 'intelligence', level: 40 },
        { stat: 'concentration', level: 40 }
      ]
    },
    icon: '🧙'
  },
  {
    id: 'shadow_dancer',
    name: 'Shadow Dancer',
    description: 'Reached level 40 in both Agility and Concentration',
    category: TITLE_CATEGORIES.STAT_BASED,
    rarity: TITLE_RARITIES.RARE,
    requirements: { 
      multistat: true,
      stats: [
        { stat: 'agility', level: 40 },
        { stat: 'concentration', level: 40 }
      ]
    },
    icon: '👥'
  },
  
  // Achievement-based titles
  {
    id: 'streak_master',
    name: 'Streak Master',
    description: 'Maintained a 30-day streak',
    category: TITLE_CATEGORIES.ACHIEVEMENT,
    rarity: TITLE_RARITIES.UNCOMMON,
    requirements: { streak: 30 },
    icon: '🔥'
  },
  {
    id: 'centurion',
    name: 'Centurion',
    description: 'Completed 100 tasks',
    category: TITLE_CATEGORIES.ACHIEVEMENT,
    rarity: TITLE_RARITIES.UNCOMMON,
    requirements: { tasksCompleted: 100 },
    icon: '💯'
  },
  {
    id: 'veteran',
    name: 'Veteran',
    description: 'Been active for 100 days',
    category: TITLE_CATEGORIES.ACHIEVEMENT,
    rarity: TITLE_RARITIES.UNCOMMON,
    requirements: { daysActive: 100 },
    icon: '📅'
  },
  
  // Challenge-based titles
  {
    id: 'streak_champion',
    name: 'Streak Champion',
    description: 'Won a Streak Competition challenge',
    category: TITLE_CATEGORIES.CHALLENGE,
    rarity: TITLE_RARITIES.RARE,
    requirements: { wonChallenge: 'streak_competition' },
    icon: '🏆'
  },
  {
    id: 'weekly_champion',
    name: 'Weekly Champion',
    description: 'Won a Weekly Leaderboard challenge',
    category: TITLE_CATEGORIES.CHALLENGE,
    rarity: TITLE_RARITIES.RARE,
    requirements: { wonChallenge: 'weekly_leaderboard' },
    icon: '🏆'
  },
  
  // Special titles
  {
    id: 'jack_of_all_trades',
    name: 'Jack of All Trades',
    description: 'Reached level 15 in all stats',
    category: TITLE_CATEGORIES.SPECIAL,
    rarity: TITLE_RARITIES.RARE,
    requirements: { 
      multistat: true,
      allStats: true,
      level: 15
    },
    icon: '🃏'
  },
  {
    id: 'master_of_all',
    name: 'Master of All',
    description: 'Reached level 30 in all stats',
    category: TITLE_CATEGORIES.SPECIAL,
    rarity: TITLE_RARITIES.EPIC,
    requirements: { 
      multistat: true,
      allStats: true,
      level: 30
    },
    icon: '👑'
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: 'Maintained a 100-day streak',
    category: TITLE_CATEGORIES.SPECIAL,
    rarity: TITLE_RARITIES.LEGENDARY,
    requirements: { streak: 100 },
    icon: '⚡'
  },
  {
    id: 'grandmaster',
    name: 'Grandmaster',
    description: 'Reached level 50 in all stats',
    category: TITLE_CATEGORIES.SPECIAL,
    rarity: TITLE_RARITIES.MYTHIC,
    requirements: { 
      multistat: true,
      allStats: true,
      level: 50
    },
    icon: '✨'
  }
];

/**
 * Get a title by its ID
 * @param {string} id - The title ID
 * @returns {object|null} The title object or null if not found
 */
export const getTitleById = (id) => {
  return TITLES.find(title => title.id === id) || null;
};

/**
 * Get all titles in a specific category
 * @param {string} category - The category ID
 * @returns {array} Array of title objects
 */
export const getTitlesByCategory = (category) => {
  return TITLES.filter(title => title.category === category);
};

/**
 * Get all titles of a specific rarity
 * @param {object} rarity - The rarity object
 * @returns {array} Array of title objects
 */
export const getTitlesByRarity = (rarity) => {
  return TITLES.filter(title => title.rarity === rarity);
};
