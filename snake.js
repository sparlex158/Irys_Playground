const gridSize = 48;
const tileCount = 8;
const canvas = document.getElementById('snake');
const ctx = canvas.getContext('2d');

const bgImg = new Image();
bgImg.src = 'snakebackground.png';
const snakeImg = new Image();
snakeImg.src = 'sprite2.png';
const foodImg = new Image();
foodImg.src = 'food.png';

let snake, food, dx, dy, score, gameOver, moveQueue, speed, moveProgress, lastMoveTime, animating;

function initGame() {
  // Два сегмента для плавного старта!
  snake = [
    {x: 4, y: 4},
    {x: 3, y: 4}
  ];
  dx = 1; dy = 0;
  moveQueue = [];
  placeFood();
  score = 0;
  speed = 200; // ms per cell
  gameOver = false;
  moveProgress = 0; // СТАРТУЕМ С ПЛАВНОГО ДВИЖЕНИЯ
  lastMoveTime = performance.now();
  document.getElementById('score').textContent = 'Score: 0';
  document.getElementById('gameOver').textContent = '';
  animating = true;
  requestAnimationFrame(gameLoop);
}

function placeFood() {
  while (true) {
    food = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount)
    };
    if (!snake.some(seg => seg.x === food.x && seg.y === food.y)) break;
  }
}

function gameLoop(now) {
  if (!animating) return;

  let elapsed = now - lastMoveTime;
  moveProgress += elapsed / speed;
  lastMoveTime = now;

  if (moveProgress >= 1) {
    moveSnake();
    moveProgress = 0;
  }

  draw(moveProgress);

  if (!gameOver) {
    requestAnimationFrame(gameLoop);
  }
}

function moveSnake() {
  let newDir = moveQueue.shift();
  if (newDir) {
    [dx, dy] = newDir;
  }
  const head = {x: snake[0].x + dx, y: snake[0].y + dy};

  if (
    head.x < 0 || head.x >= tileCount ||
    head.y < 0 || head.y >= tileCount ||
    snake.some(seg => seg.x === head.x && seg.y === head.y)
  ) {
    document.getElementById('gameOver').textContent = 'Game Over! Your score: ' + score;
    gameOver = true;
    animating = false;
    draw(1); // Нарисовать последний кадр с затемнением
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    document.getElementById('score').textContent = 'Score: ' + score;
    placeFood();
    if (speed > 100 && score % 5 === 0) {
      speed -= 10;
    }
    // Не удаляем хвост — змейка увеличивается на 1
  } else {
    snake.pop(); // Обычный ход — удаляем хвост
  }
}

function draw(progress) {
  // Фон
  if (bgImg.complete) {
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = '#181828';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Еда
  if (foodImg.complete) {
    ctx.drawImage(foodImg, food.x * gridSize, food.y * gridSize, gridSize, gridSize);
  } else {
    ctx.fillStyle = '#00FFD0';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
  }

  // Плавное смещение головы и хвоста
  for (let i = snake.length - 1; i >= 0; i--) {
    let seg = snake[i];
    let prev = snake[i - 1] || seg;
    let x = seg.x, y = seg.y;

    // Только для головы и первого сегмента — делаем плавное движение
    if (i === 0 && snake.length > 1) {
      // Голова движется к следующей клетке
      x = seg.x - dx * (1 - progress);
      y = seg.y - dy * (1 - progress);
    } else if (i > 0) {
      // Хвост движется к предыдущему сегменту
      let pdx = prev.x - seg.x;
      let pdy = prev.y - seg.y;
      x = seg.x + pdx * progress;
      y = seg.y + pdy * progress;
    }

    if (snakeImg.complete) {
      ctx.save();
      if (i === 0) {
        // Выделяем голову: делаем обводку
        ctx.beginPath();
        ctx.arc(
          x * gridSize + gridSize / 2,
          y * gridSize + gridSize / 2,
          gridSize / 2 + 4,
          0, 2 * Math.PI
        );
        ctx.strokeStyle = "#00FFD0";
        ctx.lineWidth = 4;
        ctx.shadowColor = "#00FFD0";
        ctx.shadowBlur = 8;
        ctx.stroke();
      }
      ctx.drawImage(snakeImg, x * gridSize, y * gridSize, gridSize, gridSize);
      ctx.restore();
    } else {
      ctx.fillStyle = i === 0 ? '#00FFD0' : '#6C47FF';
      ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
    }
  }

  // Затемнение после смерти
  if (gameOver) {
    ctx.save();
    ctx.fillStyle = "rgba(24,24,40,0.75)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }
}

// Управление стрелками и WASD
document.addEventListener('keydown', e => {
  if (gameOver) return;
  let dir;
  if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') && dy !== 1) dir = [0, -1];
  else if ((e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') && dy !== -1) dir = [0, 1];
  else if ((e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') && dx !== 1) dir = [-1, 0];
  else if ((e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') && dx !== -1) dir = [1, 0];
  if (dir) moveQueue.push(dir);
});

function restartGame() {
  animating = false;
  setTimeout(initGame, 100);
}

// Ждём загрузки всех картинок
let loaded = 0;
[bgImg, snakeImg, foodImg].forEach(img => {
  img.onload = () => {
    loaded++;
    if (loaded === 3) initGame();
  };
});