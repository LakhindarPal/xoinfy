const boardEl = document.getElementById('board');
const turnEl = document.getElementById('playerTurn');
const resultEl = document.getElementById('result');
const restartBtn = document.getElementById('restart');
const modeSelect = document.getElementById('modeSelect');
const strikeEl = document.getElementById('strike');

const SIZE = 9;
const winPatterns = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8], // rows
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8], // cols
  [0, 4, 8],
  [2, 4, 6] // diagonals
];

let board = [];
let playerMoves = {};
let currentPlayer = 'X';
let moveCount = 0;
let gameEnded = false;
let isSinglePlayer = false;

function init() {
  board = Array(SIZE).fill('');
  playerMoves = { X: [], O: [] };
  currentPlayer = 'X';
  moveCount = 0;
  gameEnded = false;
  isSinglePlayer = modeSelect.value === 'single';
  resultEl.textContent = '';
  strikeEl.className = 'strike';
  Array.from({ length: SIZE }, (_, i) => updateCell(i));
  updateStatus();
};

function updateCell(i, action = '') {
  const cell = boardEl.children[i];
  const symbol = board[i];
  cell.textContent = symbol;
  cell.className = 'cell';
  if (symbol) cell.classList.add('used');
  if (action) cell.classList.add(action);
  
  if (action === 'remove') {
    setTimeout(() => {
      cell.className = 'cell';
      cell.textContent = '';
    }, 300);
  }
};

function updateStatus() {
  turnEl.textContent = currentPlayer;
};

function checkWin(moves) {
  return winPatterns.findIndex(p => p.every(i => moves.includes(i)));
}

function makeMove(i, player) {
  const moves = playerMoves[player];
  board[i] = player;
  moves.push(i);
  moveCount++;
  updateCell(i, 'pop');
  
  if (moves.length > 3) {
    const removed = moves.shift();
    board[removed] = '';
    updateCell(removed, 'remove');
  }
  
  const winIndex = checkWin(moves);
  if (winIndex >= 0) {
    showStrike(winIndex);
    const winner = isSinglePlayer ? (player === 'X' ? 'You' : 'Bot') : player;
    resultEl.textContent = `${winner} wins in ${moveCount} move${moveCount > 1 ? 's' : ''}!`;
    gameEnded = true;
    return;
  }
  
  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  updateStatus();
  
  if (isSinglePlayer && currentPlayer === 'O' && !gameEnded) {
    setTimeout(botMove, 300);
  }
};

const handleMove = (i) => {
  if (gameEnded || board[i]) return;
  makeMove(i, currentPlayer);
};

function botMove() {
  const empty = board
    .map((val, i) => (val === '' ? i : null))
    .filter(i => i !== null);
  
  const winOrBlock = (p) =>
    empty.find(i => checkWin([...playerMoves[p], i]) >= 0);
  
  const index =
    winOrBlock('O') ??
    winOrBlock('X') ??
    (empty.includes(4) && 4) ?? [0, 2, 6, 8].find(i => empty.includes(i)) ??
    empty[Math.floor(Math.random() * empty.length)];
  
  if (index != null) makeMove(index, 'O');
};

function showStrike(index) {
  strikeEl.className = `strike strike-${index}`;
};

// Event bindings
boardEl.addEventListener('click', e => {
  if (e.target.matches('.cell')) {
    handleMove(+e.target.dataset.index);
  }
});

restartBtn.addEventListener('click', init);
modeSelect.addEventListener('change', init);

init();