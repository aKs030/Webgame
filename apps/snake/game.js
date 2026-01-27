// Einfaches Snake-Spiel (Canvas)
// Erweiterungen: Highscore (localStorage), On‑Screen DPad (Touch), Schwierigkeit/Speed & pulsing Food Animation

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highscoreEl = document.getElementById('highscore');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const difficultySelect = document.getElementById('difficulty');

// Grid / Größe
const COLS = 20; // Spalten
const ROWS = 20; // Reihen
let TILE = canvas.width / COLS; // Größe pro Kachel (kann bei Resize angepasst werden)

let snake = []; // Array von {x,y}
let dir = {x:1, y:0}; // aktuelle Richtung
let nextDir = {x:1, y:0};
let food = {x:0, y:0};
let running = false;
let score = 0;
let tickInterval = Number(difficultySelect.value) || 100; // ms
let loopId = null;
let foodPulsePhase = 0;

const HIGHSCORE_KEY = 'snake-highscore';
let highscore = parseInt(localStorage.getItem(HIGHSCORE_KEY)) || 0;
highscoreEl.textContent = 'Highscore: ' + highscore;

function reset() {
  snake = [ {x:8, y:10}, {x:7, y:10}, {x:6, y:10} ];
  dir = {x:1, y:0};
  nextDir = {x:1, y:0};
  placeFood();
  score = 0;
  updateHud();
}

function placeFood() {
  do {
    food.x = Math.floor(Math.random() * COLS);
    food.y = Math.floor(Math.random() * ROWS);
  } while (snake.some(s => s.x === food.x && s.y === food.y));
}

function update() {
  // Richtung übernehmen (verhindere direkte Umdrehung)
  if ((nextDir.x !== -dir.x || nextDir.y !== -dir.y)) {
    dir = nextDir;
  }

  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

  // Kollision mit Wänden
  if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
    gameOver();
    return;
  }

  // Kollision mit Selbst
  if (snake.some(seg => seg.x === head.x && seg.y === head.y)) {
    gameOver();
    return;
  }

  snake.unshift(head);

  // Nahrung erwischt?
  if (head.x === food.x && head.y === food.y) {
    score += 1;
    updateHud();
    // Highscore ggf. aktualisieren
    if (score > highscore) {
      highscore = score;
      localStorage.setItem(HIGHSCORE_KEY, String(highscore));
      highscoreEl.textContent = 'Highscore: ' + highscore;
    }
    placeFood();
  } else {
    snake.pop();
  }
}

function draw() {
  // Background
  ctx.fillStyle = '#071020';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // pulsing food (smooth animation via RAF)
  foodPulsePhase += 0.12;
  const pulse = 0.9 + Math.sin(foodPulsePhase) * 0.12;
  const cx = food.x * TILE + TILE / 2;
  const cy = food.y * TILE + TILE / 2;
  const radius = (TILE / 2) * pulse;
  ctx.fillStyle = '#e11d48';
  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(2, radius), 0, Math.PI * 2);
  ctx.fill();

  // Snake
  ctx.fillStyle = '#34d399';
  for (let i = 0; i < snake.length; i++) {
    const s = snake[i];
    roundRect(ctx, s.x * TILE + 1, s.y * TILE + 1, TILE - 2, TILE - 2, 4, true, false);
  }
}

function animate() {
  draw();
  requestAnimationFrame(animate);
}

function loop() {
  update();
}

function start() {
  if (running) return;
  running = true;
  startBtn.disabled = true;
  restartBtn.disabled = false;
  tickInterval = Number(difficultySelect.value) || tickInterval;
  if (loopId) clearInterval(loopId);
  loopId = setInterval(loop, tickInterval);
}

function stop() {
  running = false;
  startBtn.disabled = false;
  if (loopId) clearInterval(loopId);
}

function restart() {
  stop();
  reset();
  start();
}

function gameOver() {
  stop();
  // kleine Verzögerung für UX
  setTimeout(() => {
    if (confirm('Game Over! Punkte: ' + score + '\nNeustart?')) {
      restart();
    }
  }, 80);
}

function updateHud() {
  scoreEl.textContent = 'Punkte: ' + score;
}

// Hilfsfunktionen
function roundRect(ctx, x, y, w, h, r, fill, stroke) {
  if (r === undefined) r = 5;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

// Input: Keyboard
window.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  if (key === 'arrowup' || key === 'w') nextDir = {x:0, y:-1};
  if (key === 'arrowdown' || key === 's') nextDir = {x:0, y:1};
  if (key === 'arrowleft' || key === 'a') nextDir = {x:-1, y:0};
  if (key === 'arrowright' || key === 'd') nextDir = {x:1, y:0};
});

// Mobile / On-screen DPad (Touch & Mouse)
const dpadButtons = document.querySelectorAll('.dpad-btn');
dpadButtons.forEach(btn => {
  const dir = btn.dataset.dir.split(',').map(Number);
  const setDir = () => { nextDir = {x: dir[0], y: dir[1]}; };

  // Touch
  btn.addEventListener('touchstart', (e) => { e.preventDefault(); setDir(); btn.classList.add('active'); });
  btn.addEventListener('touchend', (e) => { e.preventDefault(); btn.classList.remove('active'); });

  // Mouse
  btn.addEventListener('mousedown', (e) => { e.preventDefault(); setDir(); btn.classList.add('active'); });
  window.addEventListener('mouseup', () => btn.classList.remove('active'));

  // Click fallback
  btn.addEventListener('click', (e) => { e.preventDefault(); setDir(); });
});

// Difficulty change while playing
difficultySelect.addEventListener('change', () => {
  tickInterval = Number(difficultySelect.value);
  if (running) {
    clearInterval(loopId);
    loopId = setInterval(loop, tickInterval);
  }
});

// Buttons
startBtn.addEventListener('click', () => start());
restartBtn.addEventListener('click', () => { restart(); });

// Resize handling to keep TILE integer
window.addEventListener('resize', () => {
  TILE = Math.floor(canvas.width / COLS);
});

// Init
reset();
animate();

