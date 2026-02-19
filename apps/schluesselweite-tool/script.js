// Data Source: ISO 4014/4017 (DIN 931/933) for Bolts, ISO 4032 (DIN 934) for Nuts
// "sw_iso" = Width Across Flats (ISO)
// "sw_din" = Width Across Flats (DIN)
// "pitch" = Thread Pitch (Steigung)
// "clearance" = Clearance Hole (Durchgangsloch - Medium Series ISO 273)

const wrenchData = {
  "1.6": { sw_iso: 3.2, sw_din: 3.2, pitch: 0.35, clearance: 1.8 },
  "2": { sw_iso: 4, sw_din: 4, pitch: 0.4, clearance: 2.4 },
  "2.5": { sw_iso: 5, sw_din: 5, pitch: 0.45, clearance: 2.9 },
  "3": { sw_iso: 5.5, sw_din: 5.5, pitch: 0.5, clearance: 3.4 },
  "4": { sw_iso: 7, sw_din: 7, pitch: 0.7, clearance: 4.5 },
  "5": { sw_iso: 8, sw_din: 8, pitch: 0.8, clearance: 5.5 },
  "6": { sw_iso: 10, sw_din: 10, pitch: 1.0, clearance: 6.6 },
  "8": { sw_iso: 13, sw_din: 13, pitch: 1.25, clearance: 9.0 },
  "10": { sw_iso: 16, sw_din: 17, pitch: 1.5, clearance: 11.0 }, // Main diff ISO/DIN
  "12": { sw_iso: 18, sw_din: 19, pitch: 1.75, clearance: 13.5 }, // Main diff ISO/DIN
  "14": { sw_iso: 21, sw_din: 22, pitch: 2.0, clearance: 15.5 }, // Main diff ISO/DIN
  "16": { sw_iso: 24, sw_din: 24, pitch: 2.0, clearance: 17.5 },
  "18": { sw_iso: 27, sw_din: 27, pitch: 2.5, clearance: 20.0 }, // Non-preferred
  "20": { sw_iso: 30, sw_din: 30, pitch: 2.5, clearance: 22.0 },
  "22": { sw_iso: 34, sw_din: 32, pitch: 2.5, clearance: 24.0 }, // Diff ISO/DIN
  "24": { sw_iso: 36, sw_din: 36, pitch: 3.0, clearance: 26.0 },
  "27": { sw_iso: 41, sw_din: 41, pitch: 3.0, clearance: 30.0 },
  "30": { sw_iso: 46, sw_din: 46, pitch: 3.5, clearance: 33.0 },
  "33": { sw_iso: 50, sw_din: 50, pitch: 3.5, clearance: 36.0 },
  "36": { sw_iso: 55, sw_din: 55, pitch: 4.0, clearance: 39.0 },
  "39": { sw_iso: 60, sw_din: 60, pitch: 4.0, clearance: 42.0 },
  "42": { sw_iso: 65, sw_din: 65, pitch: 4.5, clearance: 45.0 },
  "45": { sw_iso: 70, sw_din: 70, pitch: 4.5, clearance: 48.0 },
  "48": { sw_iso: 75, sw_din: 75, pitch: 5.0, clearance: 52.0 },
  "52": { sw_iso: 80, sw_din: 80, pitch: 5.0, clearance: 56.0 },
  "56": { sw_iso: 85, sw_din: 85, pitch: 5.5, clearance: 62.0 },
  "60": { sw_iso: 90, sw_din: 90, pitch: 5.5, clearance: 66.0 },
  "64": { sw_iso: 95, sw_din: 95, pitch: 6.0, clearance: 70.0 }
};

// State
let currentStandard = 'iso'; // 'iso' or 'din'
let currentSize = '6'; // Default M6

// DOM Elements
const isoBtn = document.getElementById('isoBtn');
const dinBtn = document.getElementById('dinBtn');
const sizeInput = document.getElementById('sizeInput');
const quickGrid = document.getElementById('quickGrid');
const resultValue = document.getElementById('resultValue');
const resultUnit = document.getElementById('resultUnit');
const resultLabel = document.getElementById('resultLabel');
const standardBadge = document.getElementById('standardBadge');

const detailPitch = document.getElementById('detailPitch');
const detailClearance = document.getElementById('detailClearance');
const detailAltStandard = document.getElementById('detailAltStandard');
const detailsContent = document.getElementById('detailsContent');
const detailsToggleBtn = document.getElementById('detailsToggleBtn');
const toggleIcon = document.getElementById('toggleIcon');

// Initialize
function init() {
  renderQuickButtons();
  updateDisplay();

  // Event Listeners
  isoBtn.addEventListener('click', () => setStandard('iso'));
  dinBtn.addEventListener('click', () => setStandard('din'));

  sizeInput.addEventListener('input', (e) => {
    // Strip "M" if user types it
    let val = e.target.value.replace(/m/i, '').trim();
    if (val && wrenchData[val]) {
      currentSize = val;
      updateDisplay();
      highlightButton(val);
    } else {
       // Allow typing but don't update if invalid yet
    }
  });

  detailsToggleBtn.addEventListener('click', () => {
    const isHidden = detailsContent.style.display === 'none' || detailsContent.style.display === '';
    detailsContent.style.display = isHidden ? 'grid' : 'none';
    toggleIcon.textContent = isHidden ? '▲' : '▼';
  });
}

function setStandard(std) {
  currentStandard = std;

  // Update Toggle UI
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
  sizeInput.value = `M${size}`; // Update input field
  updateDisplay();
  highlightButton(size);
}

function highlightButton(size) {
  // Remove active class from all
  document.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('active'));

  // Add to matching button if exists
  const target = document.querySelector(`.size-btn[data-size="${size}"]`);
  if (target) {
    target.classList.add('active');
  }
}

function renderQuickButtons() {
  const commonSizes = ["3", "4", "5", "6", "8", "10", "12", "16", "20", "24"];
  quickGrid.innerHTML = '';

  commonSizes.forEach(size => {
    const btn = document.createElement('div');
    btn.className = 'size-btn';
    btn.textContent = `M${size}`;
    btn.dataset.size = size;
    btn.onclick = () => selectSize(size);
    quickGrid.appendChild(btn);
  });

  // Highlight default
  highlightButton(currentSize);
  sizeInput.value = `M${currentSize}`;
}

function updateDisplay() {
  const data = wrenchData[currentSize];

  if (!data) {
    // Invalid size state
    // resultValue.textContent = "-";
    return;
  }

  // Animate Result
  resultValue.classList.remove('animate-in');
  void resultValue.offsetWidth; // Trigger reflow
  resultValue.classList.add('animate-in');

  const sw = currentStandard === 'iso' ? data.sw_iso : data.sw_din;
  resultValue.textContent = sw;
  resultLabel.textContent = `Schlüsselweite (M${currentSize})`;
  standardBadge.textContent = currentStandard.toUpperCase();

  // Update Details
  detailPitch.textContent = data.pitch + " mm";
  detailClearance.textContent = data.clearance + " mm";

  // Show alternative standard value in details
  const altStandard = currentStandard === 'iso' ? 'DIN' : 'ISO';
  const altValue = currentStandard === 'iso' ? data.sw_din : data.sw_iso;

  // Only show alt standard row if there is a difference
  if (data.sw_iso !== data.sw_din) {
      document.getElementById('detailAltContainer').style.display = 'flex';
      document.getElementById('detailAltLabel').textContent = `${altStandard} SW`;
      detailAltStandard.textContent = altValue + " mm";
      detailAltStandard.style.color = "#f59e0b"; // Warning color for difference
  } else {
      document.getElementById('detailAltContainer').style.display = 'none';
  }
}

// Run
document.addEventListener('DOMContentLoaded', init);
