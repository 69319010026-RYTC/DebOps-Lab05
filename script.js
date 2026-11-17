const rows = 4;
const cols = 5;
const totalPieces = rows * cols;

const boardElement = document.getElementById('puzzleBoard');
const moveCountElement = document.getElementById('moveCount');
const timerElement = document.getElementById('timer');
const shuffleButton = document.getElementById('shuffleBtn');
const resetButton = document.getElementById('resetBtn');
const messageElement = document.getElementById('message');
const musicToggle = document.getElementById('musicToggle');
const musicFrame = document.getElementById('bgMusic');

let board = [];
let totalMoves = 0;
let timerId = null;
let startTimestamp = 0;
let elapsedSeconds = 0;
let dragSourceSlot = null;
let selectedSlot = null;
let isMusicOn = false;

function buildSolvedBoard() {
  return Array.from({ length: totalPieces }, (_, index) => index);
}

function shuffleArray(array) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function isSolved() {
  return board.every((pieceIndex, index) => pieceIndex === index);
}

function updateMoves() {
  moveCountElement.textContent = String(totalMoves);
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

function updateTimer() {
  timerElement.textContent = formatTime(elapsedSeconds);
}

function startTimer() {
  if (timerId) {
    return;
  }

  startTimestamp = Date.now() - elapsedSeconds * 1000;
  timerId = setInterval(() => {
    elapsedSeconds = Math.floor((Date.now() - startTimestamp) / 1000);
    updateTimer();
  }, 1000);
}

function stopTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
}

function resetStatus() {
  messageElement.classList.add('hidden');
  messageElement.textContent = '';
}

function swapTiles(sourceSlot, targetSlot) {
  if (sourceSlot === targetSlot) {
    selectedSlot = null;
    return;
  }

  [board[sourceSlot], board[targetSlot]] = [board[targetSlot], board[sourceSlot]];
  totalMoves += 1;
  selectedSlot = null;
  updateMoves();

  if (isSolved()) {
    stopTimer();
    messageElement.textContent = 'Congratulations! Puzzle solved!';
    messageElement.classList.remove('hidden');
  }

  renderBoard();
}

function getPieceStyle(pieceIndex) {
  const row = Math.floor(pieceIndex / cols);
  const col = pieceIndex % cols;
  const x = (col / (cols - 1)) * 100;
  const y = (row / (rows - 1)) * 100;

  return {
    backgroundImage: "url('car.jpg')",
    backgroundPosition: `${x}% ${y}%`,
    backgroundSize: `${cols * 100}% ${rows * 100}%`
  };
}

function createTile(pieceIndex, slotIndex) {
  const tile = document.createElement('div');
  tile.className = 'tile';
  tile.dataset.slot = String(slotIndex);
  tile.draggable = true;

  const style = getPieceStyle(pieceIndex);
  tile.style.backgroundImage = style.backgroundImage;
  tile.style.backgroundPosition = style.backgroundPosition;
  tile.style.backgroundSize = style.backgroundSize;

  if (pieceIndex === slotIndex) {
    tile.classList.add('correct');
  }

  if (selectedSlot === slotIndex) {
    tile.classList.add('selected');
  }

  tile.addEventListener('dragstart', (event) => {
    dragSourceSlot = Number(tile.dataset.slot);
    selectedSlot = dragSourceSlot;
    renderBoard();
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(dragSourceSlot));
  });

  tile.addEventListener('dragend', () => {
    dragSourceSlot = null;
  });

  tile.addEventListener('click', () => {
    const currentSlot = Number(tile.dataset.slot);

    if (selectedSlot === null) {
      selectedSlot = currentSlot;
      renderBoard();
      return;
    }

    if (selectedSlot === currentSlot) {
      selectedSlot = null;
      renderBoard();
      return;
    }

    swapTiles(selectedSlot, currentSlot);
  });

  return tile;
}

function renderBoard() {
  boardElement.innerHTML = '';

  board.forEach((pieceIndex, slotIndex) => {
    const slot = document.createElement('div');
    slot.className = 'slot';
    slot.dataset.slot = String(slotIndex);

    slot.addEventListener('dragover', (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    });

    slot.addEventListener('drop', (event) => {
      event.preventDefault();
      const targetSlot = Number(slot.dataset.slot);
      const slotFromData = Number(event.dataTransfer.getData('text/plain'));

      if (!Number.isNaN(slotFromData) && slotFromData !== targetSlot) {
        swapTiles(slotFromData, targetSlot);
      } else {
        selectedSlot = null;
        renderBoard();
      }
    });

    const tile = createTile(pieceIndex, slotIndex);
    slot.appendChild(tile);
    boardElement.appendChild(slot);
  });
}

function shufflePuzzle() {
  board = shuffleArray(buildSolvedBoard());
  totalMoves = 0;
  elapsedSeconds = 0;
  selectedSlot = null;
  updateMoves();
  updateTimer();
  resetStatus();
  stopTimer();
  startTimer();
  renderBoard();
}

function resetPuzzle() {
  board = buildSolvedBoard();
  totalMoves = 0;
  elapsedSeconds = 0;
  selectedSlot = null;
  updateMoves();
  updateTimer();
  resetStatus();
  stopTimer();
  renderBoard();
}

function startNewGame() {
  shufflePuzzle();
  messageElement.textContent = 'Click two tiles to swap them!';
  messageElement.classList.remove('hidden');
}

function toggleMusic() {
  isMusicOn = !isMusicOn;
  musicToggle.textContent = `Music: ${isMusicOn ? 'On' : 'Off'}`;

  if (isMusicOn) {
    const youtubeUrl = 'https://www.youtube.com/embed/4q3RG9DI6AY?autoplay=1&mute=0&controls=0&loop=1&playlist=4q3RG9DI6AY';
    musicFrame.src = youtubeUrl;
    musicFrame.style.display = 'block';
  } else {
    musicFrame.src = '';
    musicFrame.style.display = 'none';
  }
}

musicToggle.addEventListener('click', toggleMusic);
shuffleButton.addEventListener('click', shufflePuzzle);
resetButton.addEventListener('click', resetPuzzle);

startNewGame();
