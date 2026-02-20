// Data Source: ISO 4014/4017 (DIN 931/933) for Bolts, ISO 4032 (DIN 934) for Nuts
const wrenchData = {
  "1.6": { sw_iso: 3.2, sw_din: 3.2, pitch: 0.35, clearance: 1.8, tap_drill: 1.25 },
  "2": { sw_iso: 4, sw_din: 4, pitch: 0.4, clearance: 2.4, tap_drill: 1.6 },
  "2.5": { sw_iso: 5, sw_din: 5, pitch: 0.45, clearance: 2.9, tap_drill: 2.05 },
  "3": { sw_iso: 5.5, sw_din: 5.5, pitch: 0.5, clearance: 3.4, tap_drill: 2.5 },
  "4": { sw_iso: 7, sw_din: 7, pitch: 0.7, clearance: 4.5, tap_drill: 3.3 },
  "5": { sw_iso: 8, sw_din: 8, pitch: 0.8, clearance: 5.5, tap_drill: 4.2 },
  "6": { sw_iso: 10, sw_din: 10, pitch: 1.0, clearance: 6.6, tap_drill: 5.0 },
  "8": { sw_iso: 13, sw_din: 13, pitch: 1.25, clearance: 9.0, tap_drill: 6.8 },
  "10": { sw_iso: 16, sw_din: 17, pitch: 1.5, clearance: 11.0, tap_drill: 8.5 }, // Main diff ISO/DIN
  "12": { sw_iso: 18, sw_din: 19, pitch: 1.75, clearance: 13.5, tap_drill: 10.2 }, // Main diff ISO/DIN
  "14": { sw_iso: 21, sw_din: 22, pitch: 2.0, clearance: 15.5, tap_drill: 12.0 }, // Main diff ISO/DIN
  "16": { sw_iso: 24, sw_din: 24, pitch: 2.0, clearance: 17.5, tap_drill: 14.0 },
  "18": { sw_iso: 27, sw_din: 27, pitch: 2.5, clearance: 20.0, tap_drill: 15.5 },
  "20": { sw_iso: 30, sw_din: 30, pitch: 2.5, clearance: 22.0, tap_drill: 17.5 },
  "22": { sw_iso: 34, sw_din: 32, pitch: 2.5, clearance: 24.0, tap_drill: 19.5 },
  "24": { sw_iso: 36, sw_din: 36, pitch: 3.0, clearance: 26.0, tap_drill: 21.0 },
  "27": { sw_iso: 41, sw_din: 41, pitch: 3.0, clearance: 30.0, tap_drill: 24.0 },
  "30": { sw_iso: 46, sw_din: 46, pitch: 3.5, clearance: 33.0, tap_drill: 26.5 },
  "33": { sw_iso: 50, sw_din: 50, pitch: 3.5, clearance: 36.0, tap_drill: 29.5 },
  "36": { sw_iso: 55, sw_din: 55, pitch: 4.0, clearance: 39.0, tap_drill: 32.0 },
  "39": { sw_iso: 60, sw_din: 60, pitch: 4.0, clearance: 42.0, tap_drill: 35.0 },
  "42": { sw_iso: 65, sw_din: 65, pitch: 4.5, clearance: 45.0, tap_drill: 37.5 },
  "45": { sw_iso: 70, sw_din: 70, pitch: 4.5, clearance: 48.0, tap_drill: 40.5 },
  "48": { sw_iso: 75, sw_din: 75, pitch: 5.0, clearance: 52.0, tap_drill: 43.0 },
  "52": { sw_iso: 80, sw_din: 80, pitch: 5.0, clearance: 56.0, tap_drill: 47.0 },
  "56": { sw_iso: 85, sw_din: 85, pitch: 5.5, clearance: 62.0, tap_drill: 50.5 },
  "60": { sw_iso: 90, sw_din: 90, pitch: 5.5, clearance: 66.0, tap_drill: 54.5 },
  "64": { sw_iso: 95, sw_din: 95, pitch: 6.0, clearance: 70.0, tap_drill: 58.0 }
};

// State
let currentStandard = 'iso';
let currentSize = '6';
let previousSw = 0; // For animation

// DOM Elements
const isoBtn = document.getElementById('isoBtn');
const dinBtn = document.getElementById('dinBtn');
const sizeInput = document.getElementById('sizeInput');
const quickGrid = document.getElementById('quickGrid');
const resultValue = document.getElementById('resultValue');

const detailPitch = document.getElementById('detailPitch');
const detailTapDrill = document.getElementById('detailTapDrill');
const detailClearance = document.getElementById('detailClearance');
const detailAltStandard = document.getElementById('detailAltStandard');

// SVG Elements
const hexPath = document.getElementById('hexPath');
const visualLabel = document.getElementById('visualLabel');
const innerHole = document.getElementById('innerHole');
const hexSvg = document.getElementById('hexSvg');

function init() {
  renderQuickButtons();
  updateDisplay();

  isoBtn.addEventListener('click', () => setStandard('iso'));
  dinBtn.addEventListener('click', () => setStandard('din'));

  sizeInput.addEventListener('input', (e) => {
    let val = e.target.value.replace(/[^0-9.]/g, '').trim();
    if (val && wrenchData[val]) {
      currentSize = val;
      updateDisplay();
      highlightButton(val);
    }
  });
}

function setStandard(std) {
  currentStandard = std;

  // UI Toggle
  if (std === 'iso') {
    isoBtn.classList.add('active');
    dinBtn.classList.remove('active');
  } else {
    dinBtn.classList.add('active');
    isoBtn.classList.remove('active');
  }

  updateDisplay();
}

function selectSize(size) {
  currentSize = size;
  sizeInput.value = size;
  updateDisplay();
  highlightButton(size);
}

function highlightButton(size) {
  document.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('active'));
  const target = document.querySelector(`.size-btn[data-size="${size}"]`);
  if (target) target.classList.add('active');
}

function renderQuickButtons() {
  const commonSizes = ["3", "4", "5", "6", "8", "10", "12", "16", "20", "24", "30", "36"];
  quickGrid.innerHTML = '';

  commonSizes.forEach(size => {
    const btn = document.createElement('div');
    btn.className = 'size-btn';
    btn.textContent = `M${size}`;
    btn.dataset.size = size;
    btn.onclick = () => selectSize(size);
    quickGrid.appendChild(btn);
  });

  highlightButton(currentSize);
  sizeInput.value = currentSize;
}

// Animate numbers
function animateValue(obj, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);

    // Easing (Ease Out Quad)
    const easedProgress = 1 - (1 - progress) * (1 - progress);

    obj.innerHTML = Math.floor(progress * (end - start) + start);

    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      obj.innerHTML = end;
    }
  };
  window.requestAnimationFrame(step);
}

function updateDisplay() {
  const data = wrenchData[currentSize];
  if (!data) return;

  const targetSw = currentStandard === 'iso' ? data.sw_iso : data.sw_din;

  // Animate Number if changed
  if (targetSw !== previousSw) {
    animateValue(resultValue, previousSw, targetSw, 500);
    previousSw = targetSw;

    // Slight rotation effect on change
    hexSvg.style.transform = `rotate(${Math.random() * 10 - 5}deg) scale(1.05)`;
    setTimeout(() => {
        hexSvg.style.transform = `rotate(0deg) scale(1)`;
    }, 400);
  }

  // Update Technical Details
  detailPitch.textContent = data.pitch;
  detailClearance.textContent = data.clearance;
  detailTapDrill.textContent = data.tap_drill;

  // Alt Standard logic
  const altStandard = currentStandard === 'iso' ? 'DIN' : 'ISO';
  const altValue = currentStandard === 'iso' ? data.sw_din : data.sw_iso;

  // Check if alt value exists and differs
  const altDiffers = currentStandard === 'iso'
    ? (data.sw_din && data.sw_din !== data.sw_iso)
    : (data.sw_iso && data.sw_iso !== data.sw_din);

  if (altDiffers) {
      document.getElementById('detailAltContainer').style.display = 'flex';
      document.getElementById('detailAltLabel').textContent = `${altStandard} - Unterschied!`;
      detailAltStandard.textContent = `SW ${altValue} mm`;
  } else {
      document.getElementById('detailAltContainer').style.display = 'none';
  }

  // Update Visual Hexagon (SVG)
  updateHexagonVisual(targetSw, data.clearance);
}

function updateHexagonVisual(sw, holeSize) {
  // Normalize sizes for visual representation (approx 0-100 scale)
  // Max typical SW is ~95 (M64), so map 0-100 roughly.
  // We want small screws to still be visible, and big ones not to overflow.

  // Base scale factor (arbitrary for aesthetics)
  const visualScale = Math.min(Math.max(sw * 1.2, 20), 85);

  // Hexagon math:
  // Center (50, 50)
  // Radius = visualScale / 2 (approx)

  const r = visualScale / 2;
  const cX = 50;
  const cY = 50;

  // Hexagon vertices
  // Angle starts at 30 deg for flat top
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle_deg = 30 + 60 * i;
    const angle_rad = Math.PI / 180 * angle_deg;
    const x = cX + r * Math.cos(angle_rad);
    const y = cY + r * Math.sin(angle_rad);
    points.push(`${x},${y}`);
  }

  // Update Path
  const d = `M ${points[0]} L ${points[1]} L ${points[2]} L ${points[3]} L ${points[4]} L ${points[5]} Z`;
  hexPath.setAttribute("d", d);

  // Update Inner Hole (Thread)
  const holeRadius = Math.max(r * 0.5, 3); // Ensure hole doesn't disappear
  innerHole.setAttribute("r", holeRadius);

  // Update visual text
  visualLabel.textContent = `M${currentSize}`;

  // Adjust stroke width based on size to keep it looking crisp
  hexPath.setAttribute("stroke-width", Math.max(1.5, r * 0.08));
}

document.addEventListener('DOMContentLoaded', init);
