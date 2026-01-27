// Snake mit Highscore Reset, Modal, Swipe Gesten, Partikeln & Themes

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highscoreEl = document.getElementById('highscore');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const difficultySelect = document.getElementById('difficulty');
const resetHighscoreBtn = document.getElementById('resetHighscoreBtn');
const themeSelect = document.getElementById('theme');

// Grid / Größe
const COLS = 20; // Spalten
const ROWS = 20; // Reihen
let TILE = Math.floor(canvas.width / COLS); // Größe pro Kachel

let snake = [];
let dir = {x:1, y:0};
let nextDir = {x:1, y:0};
let food = {x:0, y:0};
let running = false;
let score = 0;
let tickInterval = Number(difficultySelect.value) || 100;
let loopId = null;
let foodPulsePhase = 0;
let particles = [];

const HIGHSCORE_KEY = 'snake-highscore';
const TOP_SCORES_KEY = 'snake-top-scores';
let highscore = parseInt(localStorage.getItem(HIGHSCORE_KEY)) || 0;
highscoreEl.textContent = 'Highscore: ' + highscore;

// UI elements for new features
const swipeSelect = document.getElementById('swipeSensitivity');
const vibrateToggle = document.getElementById('vibrateToggle');
const modal = document.getElementById('gameModal');
const modalMessage = document.getElementById('modalMessage');
const modalRestart = document.getElementById('modalRestart');
const modalReset = document.getElementById('modalResetHighscore');
const modalClose = document.getElementById('modalClose');

// Vibration preference
let vibrateEnabled = (localStorage.getItem('snake-vibrate') !== 'false') && ('vibrate' in navigator);
if (vibrateToggle) vibrateToggle.checked = vibrateEnabled;

function getTopScores() {
  const raw = localStorage.getItem(TOP_SCORES_KEY);
  return raw ? JSON.parse(raw) : [];
}
function saveTopScores(arr) { localStorage.setItem(TOP_SCORES_KEY, JSON.stringify(arr)); }
function addToTopScores(val) {
  const arr = getTopScores();
  arr.push({ score: val, date: Date.now() });
  arr.sort((a, b) => b.score - a.score);
  if (arr.length > 5) arr.length = 5;
  saveTopScores(arr);
}
function renderTopScores() {
  const ol = document.getElementById('topScores');
  if (!ol) return;
  const arr = getTopScores();
  ol.innerHTML = '';
  if (arr.length === 0) {
    ol.innerHTML = '<li>Kein Eintrag</li>';
    return;
  }
  arr.forEach((s, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>#${i+1}</strong><span>${s.score}</span>`;
    ol.appendChild(li);
  });
}

const THEME_KEY = 'snake-theme';
const THEMES = {
  classic: { bg: '#071020', snake: '#34d399', food: '#e11d48' },
  neon: { bg: '#000814', snake: '#7fffd4', food: '#ff007f' },
  sunset: { bg: '#07121a', snake: '#ffd166', food: '#fb923c' }
};
let currentTheme = localStorage.getItem(THEME_KEY) || 'classic';
themeSelect.value = currentTheme;

function applyTheme(name) {
  currentTheme = name;
  localStorage.setItem(THEME_KEY, name);
}
applyTheme(currentTheme);

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

function spawnParticles(x, y, color) {
  const count = 18 + Math.floor(Math.random()*8);
  for (let i=0;i<count;i++) {
    particles.push({
      x, y,
      vx: (Math.random()-0.5) * 2.6,
      vy: (Math.random()-0.5) * 2.6,
      life: 40 + Math.random()*30,
      size: 1 + Math.random()*2.5,
      color
    });
  }
}

function updateParticles() {
  for (let i = particles.length -1; i >=0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.04; // slight gravity
    p.life -= 1;
    if (p.life <= 0) particles.splice(i,1);
  }
}

function update() {
  if ((nextDir.x !== -dir.x || nextDir.y !== -dir.y)) {
    dir = nextDir;
  }

  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

  if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
    gameOver();
    return;
  }

  if (snake.some(seg => seg.x === head.x && seg.y === head.y)) {
    gameOver();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 1;
    updateHud();
    if (score > highscore) {
      highscore = score;
      localStorage.setItem(HIGHSCORE_KEY, String(highscore));
      highscoreEl.textContent = 'Highscore: ' + highscore;
    }
    // Spawn particles at food center
    const fx = food.x * TILE + TILE/2;
    const fy = food.y * TILE + TILE/2;
    spawnParticles(fx, fy, THEMES[currentTheme].food);
    placeFood();
  } else {
    snake.pop();
  }
}

function draw() {
  // Background (theme aware)
  const theme = THEMES[currentTheme];
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Particles (behind snake)
  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, p.life / 60);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // pulsing food
  foodPulsePhase += 0.12;
  const pulse = 0.9 + Math.sin(foodPulsePhase) * 0.12;
  const cx = food.x * TILE + TILE / 2;
  const cy = food.y * TILE + TILE / 2;
  const radius = (TILE / 2) * pulse;
  ctx.fillStyle = theme.food;
  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(2, radius), 0, Math.PI * 2);
  ctx.fill();

  // Snake
  ctx.fillStyle = theme.snake;
  for (let i = 0; i < snake.length; i++) {
    const s = snake[i];
    roundRect(ctx, s.x * TILE + 1, s.y * TILE + 1, TILE - 2, TILE - 2, 4, true, false);
  }
}

function animate() {
  draw();
  updateParticles();
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

function showModal(score) {
  modalMessage.textContent = 'Punkte: ' + score;
  modal.setAttribute('aria-hidden', 'false');
}
function hideModal() {
  modal.setAttribute('aria-hidden', 'true');
}

function gameOver() {
  stop();
  // show modal
  setTimeout(() => { showModal(score); }, 60);
}

function updateHud() {
  scoreEl.textContent = 'Punkte: ' + score;
}

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
  const dirArr = btn.dataset.dir.split(',').map(Number);
  const setDir = () => { if (dirArr[0] !== -dir.x || dirArr[1] !== -dir.y) nextDir = {x: dirArr[0], y: dirArr[1]}; };

  btn.addEventListener('touchstart', (e) => { e.preventDefault(); setDir(); btn.classList.add('active'); });
  btn.addEventListener('touchend', (e) => { e.preventDefault(); btn.classList.remove('active'); });

  btn.addEventListener('mousedown', (e) => { e.preventDefault(); setDir(); btn.classList.add('active'); });
  window.addEventListener('mouseup', () => dpadButtons.forEach(b => b.classList.remove('active')));

  btn.addEventListener('click', (e) => { e.preventDefault(); setDir(); });
});

// Swipe gestures on canvas for better touch UX
let touchStart = null;
canvas.addEventListener('touchstart', (e) => {
  const t = e.touches[0];
  touchStart = { x: t.clientX, y: t.clientY };
}, {passive:true});
canvas.addEventListener('touchend', (e) => {
  if (!touchStart) return;
  const t = e.changedTouches[0];
  const dx = t.clientX - touchStart.x;
  const dy = t.clientY - touchStart.y;
  const absX = Math.abs(dx), absY = Math.abs(dy);
  const threshold = Number(swipeSelect ? swipeSelect.value : 20); // px, user configurable
  if (Math.max(absX, absY) > threshold) {
    if (absX > absY) {
      // horizontal
      if (dx > 0 && dir.x !== -1) nextDir = {x:1, y:0};
      if (dx < 0 && dir.x !== 1) nextDir = {x:-1, y:0};
    } else {
      // vertical
      if (dy > 0 && dir.y !== -1) nextDir = {x:0, y:1};
      if (dy < 0 && dir.y !== 1) nextDir = {x:0, y:-1};
    }
  }
  touchStart = null;
}, {passive:true});

// Difficulty change while playing
difficultySelect.addEventListener('change', () => {
  tickInterval = Number(difficultySelect.value);
  if (running) {
    clearInterval(loopId);
    loopId = setInterval(loop, tickInterval);
  }
});

// Theme change
themeSelect.addEventListener('change', () => {
  applyTheme(themeSelect.value);
});


// Modal buttons
if (modalRestart) modalRestart.addEventListener('click', () => { hideModal(); restart(); });
if (modalClose) modalClose.addEventListener('click', () => { hideModal(); });
if (modalReset) modalReset.addEventListener('click', () => {
  if (confirm('Highscore wirklich zurücksetzen?')) {
    localStorage.removeItem(HIGHSCORE_KEY);
    localStorage.removeItem(TOP_SCORES_KEY);
    highscore = 0;
    highscoreEl.textContent = 'Highscore: ' + highscore;
    renderTopScores();
    hideModal();
  }
});

// Vibration toggle
if (vibrateToggle) {
  vibrateToggle.addEventListener('change', () => {
    vibrateEnabled = !!vibrateToggle.checked && ('vibrate' in navigator);
    localStorage.setItem('snake-vibrate', vibrateEnabled ? 'true' : 'false');
  });
  // ensure initial state reflects preference
  vibrateToggle.checked = vibrateEnabled;
}
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

