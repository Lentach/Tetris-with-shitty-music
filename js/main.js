import { COLS, ROWS, BLOCK_SIZE, BUFFER_ROWS, POINTS, INITIAL_FALL_INTERVAL, LEVEL_SPEED_CURVE, COLORS } from './constants.js';
import { Playfield } from './playfield.js';
import { PieceFactory } from './pieceFactory.js';
import { Tetromino } from './tetromino.js';

class Game {
  constructor() {
    this.canvas = document.getElementById('tetrisCanvas');
    this.nextCanvas = document.getElementById('nextCanvas');
    this.holdCanvas = document.getElementById('holdCanvas');
    
    // Set canvas dimensions based on new block size
    this.canvas.width = COLS * BLOCK_SIZE;
    this.canvas.height = ROWS * BLOCK_SIZE;
    this.nextCanvas.width = 4 * BLOCK_SIZE;
    this.nextCanvas.height = 4 * BLOCK_SIZE;
    this.holdCanvas.width = 4 * BLOCK_SIZE;
    this.holdCanvas.height = 4 * BLOCK_SIZE;
    
    this.ctx = this.canvas.getContext('2d');
    this.nextCtx = this.nextCanvas.getContext('2d');
    this.holdCtx = this.holdCanvas.getContext('2d');

    // Game state
    this.playfield = new Playfield();
    this.pieceFactory = new PieceFactory();
    this.currentPiece = null;
    this.holdPiece = null;
    this.canHold = true;
    this.nextPieces = [];
    this.gameOver = false;
    this.isPaused = true;
    this.hasStarted = false;

    // Scoring
    this.score = 0;
    this.level = 1;
    this.lines = 0;

    // Game timing
    this.lastTime = 0;
    this.dropCounter = 0;
    this.dropInterval = INITIAL_FALL_INTERVAL;
    this.lastMoveDown = 0;
    
    // Initialize audio context and sounds
    this.soundsInitialized = false;
    this.audioContext = null;
    this.bgm = null;
    this.sfx = {};

    // Input handling
    this.keyElements = {
      'ArrowLeft': document.getElementById('leftKey'),
      'ArrowRight': document.getElementById('rightKey'),
      'ArrowDown': document.getElementById('downKey'),
      'ArrowUp': document.getElementById('upKey'),
      'Space': document.getElementById('spaceKey'),
      'KeyX': document.getElementById('xKey'),
      'KeyP': document.getElementById('pKey')
    };
    
    this.initInputHandling();

    // Start button handling
    this.startScreen = document.getElementById('start-screen');
    this.startButton = document.getElementById('start-button');
    this.startButton.addEventListener('click', () => this.startGame());

    // Initialize game
    this.reset();
    this.animate();

    // Add click handler for audio initialization
    document.addEventListener('click', () => this.initAudio(), { once: true });
    document.addEventListener('keydown', () => this.initAudio(), { once: true });
  }

  startGame() {
    if (!this.hasStarted) {
      this.hasStarted = true;
      this.isPaused = false;
      this.startScreen.style.display = 'none';
      if (this.bgm) {
        this.bgm.start();
      }
    }
  }

  async initAudio() {
    if (this.soundsInitialized) return;
    
    try {
      // Create audio context directly instead of relying on Tone.js
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Function to load an audio file
      const loadAudio = async (url) => {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        return await this.audioContext.decodeAudioData(arrayBuffer);
      };

      // Load and setup audio files
      const [bgmBuffer, moveBuffer, rotateBuffer, lockBuffer, clearBuffer, 
             tetrisBuffer, levelUpBuffer, gameOverBuffer] = await Promise.all([
        loadAudio('/tetris_bgm.mp3'),
        loadAudio('/move_piece.mp3'),
        loadAudio('/rotate_piece.mp3'),
        loadAudio('/piece_lock.mp3'),
        loadAudio('/line_clear.mp3'),
        loadAudio('/tetris_clear.mp3'),
        loadAudio('/level_up.mp3'),
        loadAudio('/game_over.mp3')
      ]);

      // Setup background music
      const createLoopingSource = () => {
        const source = this.audioContext.createBufferSource();
        source.buffer = bgmBuffer;
        source.loop = true;
        source.connect(this.audioContext.destination);
        return source;
      };

      this.bgm = createLoopingSource();

      // Setup sound effects
      const playSfx = (buffer) => {
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioContext.destination);
        source.start(0);
      };

      this.sfx = {
        move: () => playSfx(moveBuffer),
        rotate: () => playSfx(rotateBuffer),
        lock: () => playSfx(lockBuffer),
        clear: () => playSfx(clearBuffer),
        tetris: () => playSfx(tetrisBuffer),
        levelUp: () => playSfx(levelUpBuffer),
        gameOver: () => playSfx(gameOverBuffer)
      };

      // Start background music if game is active
      if (!this.gameOver) {
        this.bgm.start();
      }
      
      this.soundsInitialized = true;
      console.log('Audio initialized successfully');
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  }

  initInputHandling() {
    document.addEventListener('keydown', (e) => {
      if (this.gameOver) {
        if (e.code === 'Space') {
          this.reset();
        }
        return;
      }

      // Add visual feedback for key press
      const keyElement = this.keyElements[e.code];
      if (keyElement) {
        keyElement.classList.add('active');
      }

      if (e.code === 'KeyP') {
        this.isPaused = !this.isPaused;
        if (this.isPaused && this.bgm) {
          this.bgm.stop();
        } else if (this.bgm) {
          this.bgm.start();
        }
        return;
      }

      if (this.isPaused) return;

      switch (e.code) {
        case 'ArrowLeft':
          this.moveCurrentPiece(-1, 0);
          break;
        case 'ArrowRight':
          this.moveCurrentPiece(1, 0);
          break;
        case 'ArrowDown':
          this.moveCurrentPiece(0, 1);
          this.score += 1;
          this.updateScore();
          break;
        case 'ArrowUp':
          this.rotateCurrentPiece('CW');
          break;
        case 'Space':
          this.hardDrop();
          break;
        case 'KeyX':
          this.holdCurrentPiece();
          break;
      }
    });

    // Add keyup handler for visual feedback
    document.addEventListener('keyup', (e) => {
      const keyElement = this.keyElements[e.code];
      if (keyElement) {
        keyElement.classList.remove('active');
      }
    });
  }

  getNextPiece() {
    const piece = this.nextPieces.shift();
    this.nextPieces.push(this.pieceFactory.getNextPiece());
    return piece;
  }

  holdCurrentPiece() {
    if (!this.canHold) return;
    
    const currentType = this.currentPiece.type;
    if (this.holdPiece === null) {
      // If no piece is being held, get next piece from queue
      this.holdPiece = currentType;
      this.currentPiece = this.getNextPiece();
    } else {
      // Swap current piece with held piece
      const tempType = this.holdPiece;
      this.holdPiece = currentType;
      this.currentPiece = new Tetromino(tempType);
    }
    
    // Reset position of the new piece
    this.currentPiece.resetPosition();
    this.canHold = false;
    if (this.soundsInitialized && this.sfx?.move) {
      this.sfx.move();
    }
    
    this.drawHoldPiece();
  }

  moveCurrentPiece(dx, dy) {
    this.currentPiece.move(dx, dy);
    if (this.playfield.hasCollision(this.currentPiece.matrix, this.currentPiece.x, this.currentPiece.y)) {
      this.currentPiece.move(-dx, -dy);
      if (dy > 0) {
        this.lockPiece();
        return;
      }
    } else if (this.soundsInitialized && this.sfx?.move) {
      this.sfx.move();
    }
  }

  rotateCurrentPiece(direction) {
    if (this.currentPiece.rotate(direction, this.playfield)) {
      if (this.soundsInitialized && this.sfx?.rotate) {
        this.sfx.rotate();
      }
    }
  }

  hardDrop() {
    while (!this.playfield.hasCollision(
      this.currentPiece.matrix,
      this.currentPiece.x,
      this.currentPiece.y + 1
    )) {
      this.currentPiece.move(0, 1);
      this.score += 2;
    }
    this.lockPiece();
    this.updateScore();
  }

  lockPiece() {
    this.playfield.addPiece(this.currentPiece);
    if (this.soundsInitialized && this.sfx?.lock) {
      this.sfx.lock();
    }
    
    const linesCleared = this.playfield.clearLines();
    if (linesCleared > 0) {
      this.updateScore(linesCleared);
      if (this.soundsInitialized) {
        if (linesCleared === 4 && this.sfx?.tetris) {
          this.sfx.tetris();
        } else if (this.sfx?.clear) {
          this.sfx.clear();
        }
      }
    }
    
    if (this.playfield.isGameOver()) {
      this.gameOver = true;
      if (this.soundsInitialized) {
        if (this.bgm) {
          this.bgm.stop();
          this.bgm = null;
        }
        if (this.sfx?.gameOver) {
          this.sfx.gameOver();
        }
      }
      return;
    }
    
    this.currentPiece = this.getNextPiece();
    this.canHold = true;
    this.drawNextPieces();
  }

  updateScore(linesCleared = 0) {
    if (linesCleared > 0) {
      // Add score based on lines cleared
      const multiplier = this.level;
      switch (linesCleared) {
        case 1: this.score += POINTS.SINGLE * multiplier; break;
        case 2: this.score += POINTS.DOUBLE * multiplier; break;
        case 3: this.score += POINTS.TRIPLE * multiplier; break;
        case 4: this.score += POINTS.TETRIS * multiplier; break;
      }
      
      // Update lines and check for level up
      this.lines += linesCleared;
      const newLevel = Math.floor(this.lines / 10) + 1;
      if (newLevel > this.level) {
        this.level = newLevel;
        this.dropInterval *= LEVEL_SPEED_CURVE;
        if (this.soundsInitialized && this.sfx?.levelUp) {
          this.sfx.levelUp();
        }
      }
    }
    
    // Update UI
    document.getElementById('scoreDisplay').textContent = this.score;
    document.getElementById('levelDisplay').textContent = this.level;
    document.getElementById('linesDisplay').textContent = this.lines;
  }

  getGhostPiecePosition() {
    const ghost = this.currentPiece.clone();
    while (!this.playfield.hasCollision(ghost.matrix, ghost.x, ghost.y + 1)) {
      ghost.move(0, 1);
    }
    return ghost;
  }

  reset() {
    this.playfield = new Playfield();
    this.nextPieces = [];
    for (let i = 0; i < 3; i++) {
      this.nextPieces.push(this.pieceFactory.getNextPiece());
    }
    this.currentPiece = this.getNextPiece();
    this.holdPiece = null;
    this.canHold = true;
    this.score = 0;
    this.level = 1;
    this.lines = 0;
    this.gameOver = false;
    this.dropInterval = INITIAL_FALL_INTERVAL;
    this.lastMoveDown = 0;
    this.isPaused = true;
    this.hasStarted = false;
    this.startScreen.style.display = 'block';
    
    if (this.bgm) {
      this.bgm.stop();
      this.bgm = null;
    }
    this.updateScore();
  }

  draw() {
    // Clear canvas
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw playfield grid
    this.ctx.strokeStyle = COLORS.GRID;
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        this.ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      }
    }
    
    // Draw ghost piece
    const ghost = this.getGhostPiecePosition();
    this.drawPiece(ghost, true);
    
    // Draw current piece
    this.drawPiece(this.currentPiece);
    
    // Draw locked pieces
    for (let y = BUFFER_ROWS; y < ROWS + BUFFER_ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (this.playfield.grid[y][x]) {
          this.drawBlock(x * BLOCK_SIZE, (y - BUFFER_ROWS) * BLOCK_SIZE, this.playfield.grid[y][x]);
        }
      }
    }

    // Draw game over screen
    if (this.gameOver) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '30px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
      this.ctx.font = '20px Arial';
      this.ctx.fillText('Press SPACE to restart', this.canvas.width / 2, this.canvas.height / 2 + 40);
    }

    // Draw pause screen
    if (this.isPaused && this.hasStarted) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '30px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
    }
  }

  drawBlock(x, y, color, isGhost = false) {
    this.ctx.fillStyle = isGhost ? COLORS.GHOST : color;
    this.ctx.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
    this.ctx.strokeStyle = '#000';
    this.ctx.strokeRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
  }

  drawPiece(piece, isGhost = false) {
    const matrix = piece.matrix;
    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix[y].length; x++) {
        if (matrix[y][x]) {
          const drawX = (piece.x + x) * BLOCK_SIZE;
          const drawY = (piece.y + y - BUFFER_ROWS) * BLOCK_SIZE;
          if (drawY >= 0) {
            this.drawBlock(drawX, drawY, piece.color, isGhost);
          }
        }
      }
    }
  }

  drawNextPieces() {
    // Clear next canvas
    this.nextCtx.fillStyle = '#000';
    this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
    
    // Draw the next piece
    const piece = this.nextPieces[0];
    const matrix = piece.matrix;
    const offsetX = (4 - matrix[0].length) / 2;
    const offsetY = (4 - matrix.length) / 2;
    
    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix[y].length; x++) {
        if (matrix[y][x]) {
          this.nextCtx.fillStyle = piece.color;
          this.nextCtx.fillRect(
            (offsetX + x) * BLOCK_SIZE,
            (offsetY + y) * BLOCK_SIZE,
            BLOCK_SIZE,
            BLOCK_SIZE
          );
          this.nextCtx.strokeStyle = '#000';
          this.nextCtx.strokeRect(
            (offsetX + x) * BLOCK_SIZE,
            (offsetY + y) * BLOCK_SIZE,
            BLOCK_SIZE,
            BLOCK_SIZE
          );
        }
      }
    }
  }

  drawHoldPiece() {
    // Clear hold canvas
    this.holdCtx.fillStyle = '#000';
    this.holdCtx.fillRect(0, 0, this.holdCanvas.width, this.holdCanvas.height);
    
    if (this.holdPiece) {
      // Create temporary piece for drawing
      const piece = new Tetromino(this.holdPiece);
      const matrix = piece.matrix;
      const offsetX = (4 - matrix[0].length) / 2;
      const offsetY = (4 - matrix.length) / 2;
      
      for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < matrix[y].length; x++) {
          if (matrix[y][x]) {
            this.holdCtx.fillStyle = piece.color;
            this.holdCtx.fillRect(
              (offsetX + x) * BLOCK_SIZE,
              (offsetY + y) * BLOCK_SIZE,
              BLOCK_SIZE,
              BLOCK_SIZE
            );
            this.holdCtx.strokeStyle = '#000';
            this.holdCtx.strokeRect(
              (offsetX + x) * BLOCK_SIZE,
              (offsetY + y) * BLOCK_SIZE,
              BLOCK_SIZE,
              BLOCK_SIZE
            );
          }
        }
      }
    }
  }

  animate(time = 0) {
    const deltaTime = time - this.lastTime;
    this.lastTime = time;

    if (!this.isPaused && !this.gameOver) {
      this.dropCounter += deltaTime;
      if (this.dropCounter > this.dropInterval) {
        this.moveCurrentPiece(0, 1);
        this.dropCounter = 0;
      }
    }

    this.draw();
    this.drawNextPieces();
    requestAnimationFrame((time) => this.animate(time));
  }
}

// Start the game when the page loads
window.addEventListener('load', () => {
  new Game();
});