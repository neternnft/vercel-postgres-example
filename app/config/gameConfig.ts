export const GAME_CONFIG = {
  DESKTOP_SPEED_MULTIPLIER: 1,
  MOBILE_SPEED_MULTIPLIER: 0.8,
  GROUND_HEIGHT: 60,
  PLAYER: {
    WIDTH: 30,
    HEIGHT: 30,
    INITIAL_X: 80,
    JUMP_VELOCITY: -12,
    MAX_JUMPS: 2,
    GRAVITY: 0.8,
  },
  OBSTACLE: {
    MIN_WIDTH: 20,
    MAX_WIDTH_ADDITION: 30,
    MIN_HEIGHT: 40,
    MAX_HEIGHT_ADDITION: 60,
    SPAWN_CHANCE: 0.02,
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
        SPEED_MULTIPLIER: 1,
        OBSTACLE_FREQUENCY: 0.8,
        SCORE_MULTIPLIER: 1,
        POWER_UP_FREQUENCY: 1.2
      },
      MEDIUM: {
        SPEED_MULTIPLIER: 1.5,
        OBSTACLE_FREQUENCY: 1,
        SCORE_MULTIPLIER: 1.5,
        POWER_UP_FREQUENCY: 1
      },
      HARD: {
        SPEED_MULTIPLIER: 2,
        OBSTACLE_FREQUENCY: 1.2,
        SCORE_MULTIPLIER: 2,
        POWER_UP_FREQUENCY: 0.8
      }
    },
    PROGRESSION: {
      EASY_THRESHOLD: 0,    // Score 0-19
      MEDIUM_THRESHOLD: 20,  // Score 20-49
      HARD_THRESHOLD: 50    // Score 50+
    }
  },
} as const; 