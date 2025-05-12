import { TETROMINOES, SRS_KICK_DATA_JLSTZ, SRS_KICK_DATA_I, COLORS } from './constants.js';

export class Tetromino {
  constructor(type) {
    this.type = type;
    this.shapes = TETROMINOES[type].shapes;
    this.color = COLORS[type];
    this.rotationIndex = 0;
    this.x = TETROMINOES[type].spawnX;
    this.y = TETROMINOES[type].spawnY;
  }

  get matrix() {
    return this.shapes[this.rotationIndex];
  }

  clone() {
    const clone = new Tetromino(this.type);
    clone.rotationIndex = this.rotationIndex;
    clone.x = this.x;
    clone.y = this.y;
    return clone;
  }

  rotate(direction, playfield) {
    const oldIndex = this.rotationIndex;
    const newIndex = (this.rotationIndex + (direction === 'CW' ? 1 : -1) + 4) % 4;
    
    const kickData = this.type === 'I' ? SRS_KICK_DATA_I : SRS_KICK_DATA_JLSTZ;
    const tests = kickData[`${oldIndex}->${newIndex}`];

    for (const [dx, dy] of tests) {
      const newX = this.x + dx;
      const newY = this.y - dy; // Inverted Y for SRS standard

      if (!playfield.hasCollision(this.shapes[newIndex], newX, newY)) {
        this.x = newX;
        this.y = newY;
        this.rotationIndex = newIndex;
        return true;
      }
    }
    return false;
  }

  move(dx, dy) {
    this.x += dx;
    this.y += dy;
  }

  resetPosition() {
    this.x = TETROMINOES[this.type].spawnX;
    this.y = TETROMINOES[this.type].spawnY;
    this.rotationIndex = 0;
  }
}

