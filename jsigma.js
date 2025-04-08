let gameMode = '';
let gameState = [];
let currentPlayer = 'Игрок 1';
let difficulty = 'easy';
let selectedSticks = [];

function selectMode(mode) {
  gameMode = mode;
  document.querySelector('.form-section').style.display = 'block';
  document.getElementById('difficulty-section').style.display = mode === 'bot' ? 'block' : 'none';
}

function startGame() {
  const r1 = parseInt(document.getElementById('row1').value);
  const r2 = parseInt(document.getElementById('row2').value);
  const r3 = parseInt(document.getElementById('row3').value);
  difficulty = document.getElementById('difficulty').value;
  gameState = [r1, r2, r3];
  selectedSticks = [[], [], []];
  document.querySelector('.form-section').style.display = 'none';
  document.querySelector('.game-section').style.display = 'block';
  document.getElementById('difficulty-label').textContent = gameMode === 'bot' ? `(Сложность: ${getDifficultyLabel(difficulty)})` : '';
  updateDisplay();
}

function getDifficultyLabel(level) {
  switch (level) {
    case 'easy': return 'Легко';
    case 'medium': return 'Средне';
    case 'hard': return 'Хардкор';
    default: return '';
  }
}

function updateDisplay() {
  document.getElementById('current-player').textContent = currentPlayer;
  const container = document.getElementById('game-rows');
  container.innerHTML = '';
  gameState.forEach((count, rowIndex) => {
    const rowDiv = document.createElement('div');
    rowDiv.classList.add('row');

    const rowLabel = document.createElement('div');
    rowLabel.className = 'row-label';
    rowLabel.textContent = `Ряд ${rowIndex + 1} (осталось: ${count})`;

    rowDiv.appendChild(rowLabel);

    for (let i = 0; i < count; i++) {
      const stick = document.createElement('div');
      stick.classList.add('stick');
      stick.dataset.row = rowIndex;
      stick.dataset.index = i;
      if (selectedSticks[rowIndex].includes(i)) {
        stick.classList.add('selected');
      }
      stick.onclick = () => toggleStickSelection(rowIndex, i);
      rowDiv.appendChild(stick);
    }

    container.appendChild(rowDiv);
  });
}

function toggleStickSelection(row, index) {
  if (!selectedSticks[row]) selectedSticks[row] = [];
  const pos = selectedSticks[row].indexOf(index);
  if (pos !== -1) {
    selectedSticks[row].splice(pos, 1);
  } else {
    if (selectedSticks.filter(arr => arr.length > 0).length > 0 && !selectedSticks[row].length) return;
    selectedSticks[row].push(index);
  }
  updateDisplay();
}

function confirmMove() {
  const rowUsed = selectedSticks.findIndex(arr => arr.length > 0);
  if (rowUsed === -1) {
    alert("Выберите хотя бы одну палочку.");
    return;
  }
  
  const countToRemove = selectedSticks[rowUsed].length;
  gameState[rowUsed] -= countToRemove;
  selectedSticks = [[], [], []];

  if (gameState.reduce((a, b) => a + b, 0) === 0) {
    endGame(`${currentPlayer} проиграл! Он забрал последнюю палочку.`);
    return;
  }

  if (gameMode === 'bot') {
    updateDisplay();
    setTimeout(botMove, 600);
  } else {
    currentPlayer = currentPlayer === 'Игрок 1' ? 'Игрок 2' : 'Игрок 1';
    updateDisplay();
  }
}

function botMove() {
  let move;
  
  switch (difficulty) {
    case 'easy':
      move = getEasyMove();
      break;
    case 'medium':
      move = getMediumMove();
      break;
    case 'hard':
      move = getHardMove();
      break;
    default:
      move = getEasyMove();
  }
  
  gameState[move.row] -= move.count;
  
  if (gameState.reduce((a, b) => a + b, 0) === 0) {
    endGame("Бот проиграл! Он забрал последнюю палочку.");
    return;
  }
  
  updateDisplay();
}

function getEasyMove() {
  const availableRows = gameState.map((count, i) => ({count, i})).filter(row => row.count > 0);
  const randomRow = availableRows[Math.floor(Math.random() * availableRows.length)];
  const maxToTake = Math.min(randomRow.count, 3);
  const countToTake = Math.max(1, Math.floor(Math.random() * maxToTake) + 1);
  
  return {
    row: randomRow.i,
    count: countToTake
  };
}

function getMediumMove() {
  if (Math.random() < 0.3) {
    return getEasyMove();
  }
  return getStrategicMove();
}

function getHardMove() {
  return getStrategicMove(true);
}

function getStrategicMove(aggressive = false) {
  const xor = gameState[0] ^ gameState[1] ^ gameState[2];
  const availableRows = gameState.map((count, i) => ({count, i})).filter(row => row.count > 0);
  
  if (xor === 0) {
    return {
      row: availableRows[0].i,
      count: 1
    };
  } else {
    for (let i = 0; i < gameState.length; i++) {
      const target = gameState[i] ^ xor;
      if (target < gameState[i]) {
        let countToTake = gameState[i] - target;
        
        if (aggressive) {
          const maxPossible = gameState[i];
          countToTake = Math.max(countToTake, Math.min(maxPossible, 3));
        }
        
        return {
          row: i,
          count: countToTake
        };
      }
    }
  }
  
  return {
    row: availableRows[0].i,
    count: 1
  };
}

function endGame(message) {
  document.getElementById('popup-message').textContent = message;
  document.getElementById('end-overlay').style.display = 'flex';
}