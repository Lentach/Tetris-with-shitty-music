# Tetris Clone

## Description
This project is a clone of the popular Tetris game written in pure HTML, CSS, and JavaScript.

## Requirements
- Modern web browser (Chrome, Firefox, Edge, Safari)
- No additional dependencies

## Running the Game
1. Clone the repository:
   ```bash
   git clone <repository_address>
   ```
2. Navigate to the project directory:
   ```bash
   cd Tetris
   ```
3. Open the `index.html` file in a browser:
   - Double-click the file
   - Or `Ctrl+O` → select `index.html`

## Controls
- Left Arrow (`←`): move left
- Right Arrow (`→`): move right
- Down Arrow (`↓`): soft drop
- Up Arrow (`↑`): rotate piece (CW)
- Space (`Space`): hard drop
- Key `X`: hold piece
- Key `P`: pause / resume game
- Space after Game Over: restart the game

## Information Panel
- **Next**: queue of upcoming pieces
- **Hold**: currently held piece
- **Score**: current score
- **Level**: game level
- **Lines**: number of cleared lines

## Project Structure
```
Tetris/
├── css/
│   └── style.css
├── js/
│   ├── constants.js
│   ├── playfield.js
│   ├── pieceFactory.js
│   ├── tetromino.js
│   └── main.js
├── background_pattern.png
├── block_sprite.png
├── *.mp3 (audio files)
└── index.html
```

## Graphics and Sounds
- `.png` files contain the sprites for the pieces and background
- `.mp3` files contain sound effects:
  - Piece movement, rotation, locking, line clearing, Tetris, level up, game over, and background music.

## Configuration
- Configuration values (board sizes, speed, colors) are located in `js/constants.js`
- Game style can be modified in `css/style.css`

## License
Project available under the MIT license. 