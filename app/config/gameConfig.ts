export const GAME_CONFIG = {
  DESKTOP_SPEED_MULTIPLIER: 1.5,
  MOBILE_SPEED_MULTIPLIER: 2.5,
  GROUND_HEIGHT: 20,
  PLAYER: {
    WIDTH: 50,
    HEIGHT: 50,
    INITIAL_X: 50,
    JUMP_VELOCITY: -18,
    MAX_JUMPS: 2,
    GRAVITY: 1.0,
  },
  OBSTACLE: {
    MIN_WIDTH: 15,
    MAX_WIDTH_ADDITION: 25,
    MIN_HEIGHT: 35,
    MAX_HEIGHT_ADDITION: 35,
    SPAWN_CHANCE: 0.025,
  },
  COLORS: {
    DISCO: [
      '#FF0000',
      '#FF7F00',
      '#FFFF00',
      '#00FF00',
      '#0000FF',
      '#4B0082',
      '#8F00FF',
      '#00FFFF',
      '#FF00FF',
    ],
    GROUND: '#4ade80',
    BACKGROUND: '#000000',
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