import { COLS, ROWS, BUFFER_ROWS } from './constants.js';

export class Playfield {
  constructor() {
    this.grid = Array(ROWS + BUFFER_ROWS).fill().map(() => Array(COLS).fill(0));
  }

  hasCollision(pieceMatrix, x, y) {
    for (let row = 0; row < pieceMatrix.length; row++) {
      for (let col = 0; col < pieceMatrix[row].length; col++) {
        if (pieceMatrix[row][col]) {
          const boardX = x + col;
          const boardY = y + row;

          if (
            boardX < 0 || 
            boardX >= COLS || 
            boardY >= ROWS + BUFFER_ROWS ||
            (boardY >= 0 && this.grid[boardY][boardX])
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }

  addPiece(piece) {
    const matrix = piece.matrix;
    for (let row = 0; row < matrix.length; row++) {
      for (let col = 0; col < matrix[row].length; col++) {
        if (matrix[row][col]) {
          const boardY = piece.y + row;
          if (boardY >= 0) { // Only add if within bounds
            this.grid[boardY][piece.x + col] = piece.color;
          }
        }
      }
    }
  }

  clearLines() {
    let linesCleared = 0;
    let row = this.grid.length - 1;
    while (row >= 0) {
      if (this.grid[row].every(cell => cell !== 0)) {
        this.grid.splice(row, 1);
        this.grid.unshift(Array(COLS).fill(0));
        linesCleared++;
      } else {
        row--;
      }
    }
    return linesCleared;
  }

  isGameOver() {
    return this.grid[BUFFER_ROWS - 1].some(cell => cell !== 0);
  }

  reset() {
    this.grid = Array(ROWS + BUFFER_ROWS).fill().map(() => Array(COLS).fill(0));
  }
}

