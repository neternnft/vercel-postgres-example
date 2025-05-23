export const GAME_CONFIG = {
  // Base resolution that all calculations will be relative to
  BASE_WIDTH: 800,  // Base width to calculate ratios from
  BASE_HEIGHT: 600, // Base height to calculate ratios from
  
  // Remove separate desktop/mobile multipliers since we want consistency
  SPEED_MULTIPLIER: 1.5,
  
  GROUND_HEIGHT: 60,
  PLAYER: {
    WIDTH: 30,
    HEIGHT: 30,
    INITIAL_X: 80,
    JUMP_VELOCITY: -14,
    MAX_JUMPS: 2,
    GRAVITY: 0.7,
  },
  OBSTACLE: {
    MIN_WIDTH: 20,
    MAX_WIDTH_ADDITION: 30,
    MIN_HEIGHT: 40,
    MAX_HEIGHT_ADDITION: 60,
    SPAWN_CHANCE: 0.02,
    MIN_DISTANCE_RATIO: 0.5,  // Minimum distance between obstacles as ratio of BASE_WIDTH
  },
  COLORS: {
    DISCO: [
      '#54CA9B',  // Main theme green
      '#4a90e2',  // Theme blue
      '#c471ed',  // Theme purple
      '#f64f59',  // Theme red
      '#54CA9B',  // Theme green again
      '#4a90e2'   // Theme blue again
    ],
    GROUND: '#000000',  // Black ground to match app
    BACKGROUND: '#000000',  // Black background to match app
  },
  DIFFICULTY: {
    LEVELS: {
      EASY: {
        SPEED_MULTIPLIER: 1.2,
        OBSTACLE_FREQUENCY: 0.8,
        SCORE_MULTIPLIER: 1,
        POWER_UP_FREQUENCY: 1.2
      },
      MEDIUM: {
        SPEED_MULTIPLIER: 1.6,
        OBSTACLE_FREQUENCY: 1,
        SCORE_MULTIPLIER: 1.5,
        POWER_UP_FREQUENCY: 1
      },
      HARD: {
        SPEED_MULTIPLIER: 2.1,
        OBSTACLE_FREQUENCY: 1.2,
        SCORE_MULTIPLIER: 2,
        POWER_UP_FREQUENCY: 0.8
      }
    },
    PROGRESSION: {
      EASY_THRESHOLD: 0,
      MEDIUM_THRESHOLD: 15,
      HARD_THRESHOLD: 40
    }
  },
} as const; 