const symbols = [
  'sprite2.png', 'sprite2.png',
  'token.png',   'token.png',
  'sprite3.png', 'sprite3.png',
  'sprite4.png', 'sprite4.png',
  'sprite5.png', 'sprite5.png',
  'sprite6.png', 'sprite6.png',
  'sprite7.png', 'sprite7.png',
  'sprite8.png', 'sprite8.png'
];

let firstCard = null, secondCard = null, lock = false, matched = 0;
let timer = 40;
let timerInterval = null;
let gameActive = true;

const endMenu = document.getElementById('memoryEndMenu');
const endTitle = document.getElementById('memoryEndTitle');
const endMsg = document.getElementById('memoryEndMsg');

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function startTimer() {
  timer = 40;
  document.getElementById('memoryTimer').textContent = 'Time: ' + timer;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timer--;
    document.getElementById('memoryTimer').textContent = 'Time: ' + timer;
    if (timer <= 0) {
      clearInterval(timerInterval);
      gameActive = false;
      showEndMenu(false, 0);
      // Отключаем все карточки
      document.querySelectorAll('.memory-card').forEach(card => card.onclick = null);
    }
  }, 1000);
}

function createBoard() {
  const grid = document.getElementById('memoryGrid');
  grid.innerHTML = '';
  const shuffled = shuffle([...symbols]);
  shuffled.forEach((symbol, idx) => {
    const card = document.createElement('div');
    card.className = 'memory-card';
    card.dataset.symbol = symbol;
    card.dataset.index = idx;
    card.onclick = () => flipCard(card);
    grid.appendChild(card);
  });
  matched = 0;
  document.getElementById('memoryResult').textContent = '';
  gameActive = true;
  startTimer();
  endMenu.style.display = 'none';
  [firstCard, secondCard] = [null, null];
  lock = false;
}

function flipCard(card) {
  if (!gameActive || lock || card.classList.contains('flipped') || card.classList.contains('matched')) return;
  card.innerHTML = `<img src="${card.dataset.symbol}" alt="sprite" draggable="false">`;
  card.classList.add('flipped');
  if (!firstCard) {
    firstCard = card;
  } else {
    secondCard = card;
    lock = true;
    if (firstCard.dataset.symbol === secondCard.dataset.symbol) {
      firstCard.classList.add('matched');
      secondCard.classList.add('matched');
      matched += 2;
      if (matched === symbols.length) {
        showEndMenu(true, timer);
        gameActive = false;
        clearInterval(timerInterval);
      }
      resetTurn();
    } else {
      setTimeout(() => {
        firstCard.innerHTML = '';
        secondCard.innerHTML = '';
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        resetTurn();
      }, 900);
    }
  }
}

function resetTurn() {
  [firstCard, secondCard] = [null, null];
  lock = false;
}

function showEndMenu(win, timeLeft) {
  if (win) {
    endTitle.textContent = "Congratulations!";
    endMsg.textContent = `You found all pairs with ${timeLeft} seconds left!`;
  } else {
    endTitle.textContent = "Time's up!";
    endMsg.textContent = "Try again and find all Sprite pairs before time runs out!";
  }
  endMenu.style.display = 'flex';
}

function restartMemory() {
  clearInterval(timerInterval);
  createBoard();
}

createBoard();