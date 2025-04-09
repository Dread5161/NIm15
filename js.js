let mode = '';
let difficulty = 'easy';
let currentPlayer = 1;
let rows = [];
let selected = {};
let moveCount = 0;
let botThinking = false;

function selectMode(selectedMode) {
  mode = selectedMode;
  document.querySelector('.menu').style.display = 'none';
  document.querySelector('.form-section').style.display = 'block';
  document.getElementById('difficulty-section').style.display = (mode === 'bot') ? 'block' : 'none';
}

function goBackToMenu() {
    document.querySelector('.form-section').style.display = 'none';
    document.querySelector('.menu').style.display = 'block';
}

function startGame() {
  const row1 = parseInt(document.getElementById('row1').value);
  const row2 = parseInt(document.getElementById('row2').value);
  const row3 = parseInt(document.getElementById('row3').value);
  difficulty = document.getElementById('difficulty').value;

  rows = [
    Array(row1).fill(true),
    Array(row2).fill(true),
    Array(row3).fill(true)
  ];

  selected = {};
  currentPlayer = 1;
  moveCount = 0;

  document.querySelector('.form-section').style.display = 'none';
  document.querySelector('.game-section').style.display = 'block';

  document.getElementById('game-message').textContent = '';
  document.getElementById('difficulty-label').textContent = (mode === 'bot') ? `(бот: ${difficulty})` : '';
  updateGameView();
}

function updateGameView() {
  const container = document.getElementById('game-rows');
  container.innerHTML = '';

  rows.forEach((row, rowIndex) => {
    const rowDiv = document.createElement('div');
    rowDiv.classList.add('row');

    const label = document.createElement('div');
    label.classList.add('row-label');
    label.textContent = `Ряд ${rowIndex + 1}`;
    rowDiv.appendChild(label);

    row.forEach((active, stickIndex) => {
      if (!active) return;
      const stick = document.createElement('div');
      stick.classList.add('stick');
      if (selected[rowIndex] && selected[rowIndex].includes(stickIndex)) {
        stick.classList.add('selected');
      }
      stick.onclick = () => handleStickClick(rowIndex, stickIndex);
      rowDiv.appendChild(stick);
    });

    container.appendChild(rowDiv);
  });

  document.getElementById('current-player').textContent = (mode === 'bot' && currentPlayer === 2) ? 'Бот' : `Игрок ${currentPlayer}`;
  document.getElementById('score-board').textContent = `Ход: ${moveCount}`;
}

function handleStickClick(rowIndex, stickIndex) {
  if (mode === 'bot' && currentPlayer === 2) return;

  if (!selected[rowIndex]) {
    selected = {};
    selected[rowIndex] = [stickIndex];
  } else {
    const sticks = selected[rowIndex];
    const index = sticks.indexOf(stickIndex);
    if (index === -1) {
      sticks.push(stickIndex);
    } else {
      sticks.splice(index, 1);
      if (sticks.length === 0) delete selected[rowIndex];
    }
  }

  const totalSelected = Object.values(selected).reduce((acc, arr) => acc + arr.length, 0);
  document.getElementById('confirm-btn').disabled = totalSelected === 0;

  updateGameView();
}

function confirmMove() {
  for (const [rowIndex, stickIndices] of Object.entries(selected)) {
    stickIndices.forEach(i => rows[rowIndex][i] = false);
  }

  selected = {};
  moveCount++;

  if (isGameOver()) {
    document.getElementById('game-message').textContent = `${(mode === 'bot' && currentPlayer === 2) ? 'Бот' : `Игрок ${currentPlayer}`} проиграл!`;
    document.getElementById('confirm-btn').disabled = true;
    return;
  }

  currentPlayer = currentPlayer === 1 ? 2 : 1;
  updateGameView();
  document.getElementById('confirm-btn').disabled = true;

  if (mode === 'bot' && currentPlayer === 2) {
    setTimeout(botMove, 800);
  }
}

function isGameOver() {
  return rows.flat().every(stick => !stick);
}

function botMove() {
  if (botThinking) return;
  botThinking = true;

  let rowOptions = rows.map((row, index) => ({
    index,
    sticks: row.map((v, i) => v ? i : -1).filter(i => i !== -1)
  })).filter(r => r.sticks.length > 0);

  let move;
  if (difficulty === 'easy') {
    let row = rowOptions[Math.floor(Math.random() * rowOptions.length)];
    let removeCount = 1 + Math.floor(Math.random() * row.sticks.length);
    move = { [row.index]: row.sticks.slice(0, removeCount) };
  } else if (difficulty === 'medium') {
    let nonEmpty = rowOptions.filter(r => r.sticks.length > 1);
    if (nonEmpty.length > 0 && Math.random() > 0.5) {
      let row = nonEmpty[Math.floor(Math.random() * nonEmpty.length)];
      let count = 1 + Math.floor(Math.random() * (row.sticks.length - 1));
      move = { [row.index]: row.sticks.slice(0, count) };
    } else {
      let row = rowOptions[Math.floor(Math.random() * rowOptions.length)];
      move = { [row.index]: [row.sticks[0]] };
    }
  } else {
    
    let xor = rows.reduce((acc, row) => acc ^ row.filter(Boolean).length, 0);
    for (let i = 0; i < rows.length; i++) {
      let count = rows[i].filter(Boolean).length;
      let target = count ^ xor;
      if (target < count) {
        let toRemove = count - target;
        let indices = [];
        for (let j = 0; j < rows[i].length && indices.length < toRemove; j++) {
          if (rows[i][j]) indices.push(j);
        }
        if (indices.length) {
          move = { [i]: indices };
          break;
        }
      }
    }

    
    if (!move) {
      let row = rowOptions[0];
      move = { [row.index]: [row.sticks[0]] };
    }
  }

  for (const [rowIndex, stickIndices] of Object.entries(move)) {
    stickIndices.forEach(i => rows[rowIndex][i] = false);
  }

  moveCount++;
  if (isGameOver()) {
    document.getElementById('game-message').textContent = 'Бот проиграл!';
    document.getElementById('confirm-btn').disabled = true;
    botThinking = false;
    updateGameView();
    return;
  }

  currentPlayer = 1;
  botThinking = false;
  updateGameView();
}

const openRulesBtn = document.getElementById('open-rules-btn');
const closeRulesBtn = document.getElementById('close-rules-btn');
const rulesSection = document.getElementById('rules-section');


openRulesBtn.addEventListener('click', () => {
  rulesSection.classList.add('active');
});


closeRulesBtn.addEventListener('click', () => {
  rulesSection.classList.remove('active');
});
