const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('highScore');
const statusEl = document.getElementById('status');

const GRID = 20;

let snake = [{ x: 10, y: 10 }];
let food = { x: 15, y: 15 };

let dir = { x: 1, y: 0 };
let nextDir = { x: 1, y: 0 };

let score = 0;
let running = false;
let iv;

let highScore = localStorage.getItem("highScore") || 0;
highScoreEl.textContent = highScore;

function draw() {

  ctx.fillStyle = "#020617";
  ctx.fillRect(0, 0, 400, 400);

  snake.forEach((s, i) => {
    ctx.fillStyle = i === 0 ? "#22c55e" : "#4ade80";
    ctx.fillRect(
      s.x * GRID,
      s.y * GRID,
      GRID - 2,
      GRID - 2
    );
  });

  ctx.fillStyle = "#fb7185";
  ctx.fillRect(
    food.x * GRID,
    food.y * GRID,
    GRID - 2,
    GRID - 2
  );
}

function update() {

  dir = nextDir;

  const head = {
    x: snake[0].x + dir.x,
    y: snake[0].y + dir.y
  };

  if (
    head.x < 0 ||
    head.x >= 20 ||
    head.y < 0 ||
    head.y >= 20 ||
    snake.some(s => s.x === head.x && s.y === head.y)
  ) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {

    score += 10;
    scoreEl.textContent = score;

    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore);
      highScoreEl.textContent = highScore;
    }

    food = {
      x: Math.floor(Math.random() * 20),
      y: Math.floor(Math.random() * 20)
    };

  } else {
    snake.pop();
  }
}

function gameLoop() {
  update();
  draw();
}

function startGame() {

  if (!running) {

    running = true;
    statusEl.textContent = "Playing";

    iv = setInterval(gameLoop, 160);
  }
}

function pauseGame() {

  running = false;
  statusEl.textContent = "Paused";

  clearInterval(iv);
}

function restartGame() {

  clearInterval(iv);

  snake = [{ x: 10, y: 10 }];

  dir = { x: 1, y: 0 };
  nextDir = { x: 1, y: 0 };

  score = 0;

  scoreEl.textContent = 0;

  food = {
    x: 15,
    y: 15
  };

  running = false;

  statusEl.textContent = "Restarted";

  draw();
}

function endGame() {

  pauseGame();

  statusEl.textContent = "Game Over";

  setTimeout(() => {
    alert(`Game Over! Score: ${score}`);
  }, 100);

}

document.addEventListener('keydown', e => {

  const moves = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 }
  };

  if (moves[e.key]) {
    nextDir = moves[e.key];
  }
});

draw();
