import { Tetromino } from './tetromino.js';

export class PieceFactory {
  constructor() {
    this.bag = [];
    this.pieceTypes = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
  }

  getNextPiece() {
    if (this.bag.length === 0) {
      this._fillBag();
    }
    return new Tetromino(this.bag.pop());
  }

  _fillBag() {
    this.bag = [...this.pieceTypes];
    // Fisher-Yates shuffle
    for (let i = this.bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
    }
  }

  reset() {
    this.bag = [];
  }
}

