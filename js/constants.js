// Board dimensions
export const COLS = 10;
export const ROWS = 20;
export const BUFFER_ROWS = 4;
export const BLOCK_SIZE = 45;

// Visual constants
export const COLORS = {
  I: '#00f0f0',
  O: '#f0f000',
  T: '#a000f0',
  S: '#00f000',
  Z: '#f00000',
  J: '#0000f0',
  L: '#f0a000',
  GHOST: 'rgba(255, 255, 255, 0.2)',
  GRID: '#333333'
};

// Piece shapes
export const TETROMINOES = {
  I: {
    shapes: [
      [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]],
      [[0,0,1,0], [0,0,1,0], [0,0,1,0], [0,0,1,0]],
      [[0,0,0,0], [0,0,0,0], [1,1,1,1], [0,0,0,0]],
      [[0,1,0,0], [0,1,0,0], [0,1,0,0], [0,1,0,0]]
    ],
    spawnX: 3,
    spawnY: -1
  },
  O: {
    shapes: [
      [[1,1], [1,1]]
    ],
    spawnX: 4,
    spawnY: -1
  },
  T: {
    shapes: [
      [[0,1,0], [1,1,1], [0,0,0]],
      [[0,1,0], [0,1,1], [0,1,0]],
      [[0,0,0], [1,1,1], [0,1,0]],
      [[0,1,0], [1,1,0], [0,1,0]]
    ],
    spawnX: 3,
    spawnY: -1
  },
  S: {
    shapes: [
      [[0,1,1], [1,1,0], [0,0,0]],
      [[0,1,0], [0,1,1], [0,0,1]],
      [[0,0,0], [0,1,1], [1,1,0]],
      [[1,0,0], [1,1,0], [0,1,0]]
    ],
    spawnX: 3,
    spawnY: -1
  },
  Z: {
    shapes: [
      [[1,1,0], [0,1,1], [0,0,0]],
      [[0,0,1], [0,1,1], [0,1,0]],
      [[0,0,0], [1,1,0], [0,1,1]],
      [[0,1,0], [1,1,0], [1,0,0]]
    ],
    spawnX: 3,
    spawnY: -1
  },
  J: {
    shapes: [
      [[1,0,0], [1,1,1], [0,0,0]],
      [[0,1,1], [0,1,0], [0,1,0]],
      [[0,0,0], [1,1,1], [0,0,1]],
      [[0,1,0], [0,1,0], [1,1,0]]
    ],
    spawnX: 3,
    spawnY: -1
  },
  L: {
    shapes: [
      [[0,0,1], [1,1,1], [0,0,0]],
      [[0,1,0], [0,1,0], [0,1,1]],
      [[0,0,0], [1,1,1], [1,0,0]],
      [[1,1,0], [0,1,0], [0,1,0]]
    ],
    spawnX: 3,
    spawnY: -1
  }
};

// SRS Kick Data
export const SRS_KICK_DATA_JLSTZ = {
  '0->1': [[0,0], [-1,0], [-1,-1], [0,2], [-1,2]],
  '1->0': [[0,0], [1,0], [1,1], [0,-2], [1,-2]],
  '1->2': [[0,0], [1,0], [1,1], [0,-2], [1,-2]],
  '2->1': [[0,0], [-1,0], [-1,-1], [0,2], [-1,2]],
  '2->3': [[0,0], [1,0], [1,1], [0,-2], [1,-2]],
  '3->2': [[0,0], [-1,0], [-1,-1], [0,2], [-1,2]],
  '3->0': [[0,0], [-1,0], [-1,-1], [0,2], [-1,2]],
  '0->3': [[0,0], [1,0], [1,1], [0,-2], [1,-2]]
};

export const SRS_KICK_DATA_I = {
  '0->1': [[0,0], [-2,0], [1,0], [-2,-1], [1,2]],
  '1->0': [[0,0], [2,0], [-1,0], [2,1], [-1,-2]],
  '1->2': [[0,0], [-1,0], [2,0], [-1,2], [2,-1]],
  '2->1': [[0,0], [1,0], [-2,0], [1,-2], [-2,1]],
  '2->3': [[0,0], [2,0], [-1,0], [2,1], [-1,-2]],
  '3->2': [[0,0], [-2,0], [1,0], [-2,-1], [1,2]],
  '3->0': [[0,0], [1,0], [-2,0], [1,-2], [-2,1]],
  '0->3': [[0,0], [-1,0], [2,0], [-1,2], [2,-1]]
};

// Game timing (in milliseconds)
export const INITIAL_FALL_INTERVAL = 1000;
export const SOFT_DROP_INTERVAL = 50;
export const LOCK_DELAY = 500;
export const DAS_DELAY = 167;
export const ARR_INTERVAL = 33;

// Scoring
export const POINTS = {
  SINGLE: 100,
  DOUBLE: 300,
  TRIPLE: 500,
  TETRIS: 800,
  SOFT_DROP: 1,
  HARD_DROP: 2,
  T_SPIN_DOUBLE: 1200
};

export const LINES_PER_LEVEL = 10;
export const LEVEL_SPEED_CURVE = 0.8; // Multiplier for speed increase per level

// Input keys
export const KEYS = {
  LEFT: 'ArrowLeft',
  RIGHT: 'ArrowRight',
  DOWN: 'ArrowDown',
  UP: 'ArrowUp',
  SPACE: ' ',
  SHIFT: 'Shift',
  P: 'p',
  C: 'c'
};