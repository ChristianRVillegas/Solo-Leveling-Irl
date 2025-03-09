# Solo Leveling IRL

A web application to gamify self-improvement and personal development, based on the "Solo Leveling IRL" game concept.

## Features

- **Stat Tracking:** Monitor progress across six core stats: Discipline, Linguist, Stamina, Strength, Intelligence, and Concentration
- **Task Management:** Add, complete, and track tasks of varying difficulty levels
- **Level System:** Gain experience points and level up your stats
- **Streak System:** Maintain daily streaks for bonus points
- **Progress Visualization:** View your progress with interactive charts and graphs
- **Customizable Themes:** Choose between different visual themes

## Getting Started

1. Clone this repository
2. Install dependencies with `npm install`
3. Start the development server with `npm start`

## Game Rules

### Core Stats

1. **Discipline**: Organization, routine adherence, mindful choices
2. **Linguist**: Language learning, communication, writing
3. **Stamina**: Cardio, endurance, energy management
4. **Strength**: Physical power, resistance training
5. **Intelligence**: Learning, problem-solving, mental growth
6. **Concentration**: Focus, meditation, attention span

### Task System

Tasks come in different difficulty levels:

- **Simple Habit** (1 point): Quick, easy tasks (5-15 minutes)
- **Regular Practice** (2 points): Standard difficulty (15-30 minutes)
- **Challenge** (3 points): Demanding tasks (30-60 minutes)
- **Major Effort** (5 points): Significant undertaking (1+ hours)
- **Milestone** (8 points): Achievement-level task

### Leveling System

Points needed per level:
- Levels 1-10: 10 points
- Levels 11-20: 15 points
- Levels 21-30: 25 points
- Levels 31-40: 40 points
- Levels 41-50: 60 points
- Levels 51-60: 85 points
- Levels 61-70: 115 points
- Levels 71-80: 150 points
- Levels 81-90: 190 points
- Levels 91-100: 250 points

### Streak Bonuses

Maintaining daily streaks gives XP bonuses:
- 3-7 days: +15% points on all tasks
- 8-14 days: +20% points
- 15-30 days: +25% points
- 30+ days: +30% points

### Progress Ranks

Your level determines your rank:
- Levels 0-9: Beginner
- Levels 10-19: Novice
- Levels 20-29: Apprentice
- Levels 30-39: Adept
- Levels 40-49: Expert
- Levels 50-59: Master
- Levels 60-69: Grandmaster
- Levels 70-79: Legend
- Levels 80-89: Mythic
- Levels 90-99: Sovereign
- Level 100+: Transcendent

## Data Storage

The app currently uses local storage to persist your game data. In the future, this may be extended to include cloud storage via Firebase.

## Contributing

Feel free to submit issues or pull requests if you have ideas for improvements or have found bugs.
