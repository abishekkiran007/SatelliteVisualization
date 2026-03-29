/**
 * Satellite Orbit Simulation
 * ─────────────────────────────────────────────────────────
 * Physics based on Kepler's Third Law:
 *   T = 2π × √( a³ / μ )
 *   where μ = GM = 398,600 km³/s²  (Earth's gravitational parameter)
 *         a = semi-major axis (orbital radius) in km
 *
 * Orbital velocity: v = √( μ / a )
 * ─────────────────────────────────────────────────────────
 */

// ── Constants ──────────────────────────────────────────────
const MU          = 398600;   // km³/s²  — Earth's gravitational parameter
const EARTH_RADIUS_KM = 6371; // km

// ── Canvas Setup ───────────────────────────────────────────
const canvas  = document.getElementById('orbitCanvas');
const ctx     = canvas.getContext('2d');

function resizeCanvas() {
  const wrapper = canvas.parentElement;
  canvas.width  = wrapper.clientWidth;
  canvas.height = wrapper.clientHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ── Simulation State ───────────────────────────────────────
let paused     = false;
let missionSec = 0;
let lastTime   = null;
let frameCount = 0;
let fpsTimer   = 0;

// ── Satellites ─────────────────────────────────────────────
// orbitR: canvas pixels (maps to km via SCALE)
// angle:  current angle in radians
// speed:  angular velocity multiplier

const satellites = [
  {
    id:      1,
    color:   '#00f5ff',
    glowColor: 'rgba(0,245,255,0.25)',
    orbitR:  200,   // slider value (100–300)
    speed:   5,     // slider value (1–20)
    angle:   0,
    trail:   [],
    trailMax: 120,
  },
  {
    id:      2,
    color:   '#ff8c00',
    glowColor: 'rgba(255,140,0,0.25)',
    orbitR:  280,
    speed:   3,
    angle:   Math.PI, // start on opposite side
    trail:   [],
    trailMax: 120,
  },
];

// ── Physics ────────────────────────────────────────────────
function sliderToKm(sliderVal) {
  // Map slider 100–300 → 300 km altitude – 2000 km altitude (LEO to MEO)
  return EARTH_RADIUS_KM + (sliderVal / 300) * 1700;
}

function orbitalPeriodSec(altKm) {
  const a = altKm; // total radius from Earth's center
  return 2 * Math.PI * Math.sqrt((a * a * a) / MU);
}

function orbitalVelocityKms(altKm) {
  return Math.sqrt(MU / altKm);
}

// Angular velocity (radians per real second) given period and speed multiplier
// We speed up by ×1000 so you can see the orbit in real-time
function angularVelocity(altKm, speedMultiplier) {
  const T   = orbitalPeriodSec(altKm);   // seconds in real life
  const sim = (2 * Math.PI / T) * 1000 * (speedMultiplier / 5);
  return sim;
}

// ── UI helpers ─────────────────────────────────────────────
function fmtPeriod(sec) {
  const m = Math.floor(sec / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  return `${m}m ${Math.floor(sec % 60)}s`;
}

function fmtKm(km) {
  return km >= 1000
    ? `${(km / 1000).toFixed(2)} Mm`
    : `${Math.round(km)} km`;
}

function updatePanel(sat, altKm) {
  const T = orbitalPeriodSec(altKm);
  const v = orbitalVelocityKms(altKm);
  const i = sat.id;

  document.getElementById(`period${i}`).textContent = fmtPeriod(T);
  document.getElementById(`alt${i}`).textContent    = fmtKm(altKm - EARTH_RADIUS_KM);
  document.getElementById(`vel${i}`).textContent    = `${v.toFixed(2)} km/s`;
}

// ── Drawing ────────────────────────────────────────────────
function drawStars() {
  // Drawn via CSS, but add a few canvas twinkling stars
  const cx = canvas.width / 2, cy = canvas.height / 2;
  ctx.save();
  const starPositions = [
    [0.1,0.1],[0.9,0.1],[0.15,0.85],[0.85,0.9],[0.45,0.05],
    [0.55,0.97],[0.05,0.5],[0.97,0.5],[0.3,0.3],[0.7,0.7],
    [0.2,0.7],[0.8,0.25],[0.6,0.4],[0.4,0.6],[0.05,0.2],
  ];
  const t = Date.now() / 1000;
  starPositions.forEach(([fx, fy], idx) => {
    const x   = fx * canvas.width;
    const y   = fy * canvas.height;
    const opc = 0.3 + 0.4 * Math.abs(Math.sin(t * 0.5 + idx));
    ctx.globalAlpha = opc;
    ctx.fillStyle   = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, 1, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawGridRings(cx, cy) {
  const rings = [80, 160, 240, 320];
  ctx.save();
  rings.forEach(r => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(14,45,74,0.35)';
    ctx.lineWidth   = 1;
    ctx.setLineDash([4, 8]);
    ctx.stroke();
    ctx.setLineDash([]);
  });
  ctx.restore();
}

function drawEarth(cx, cy) {
  const R = 60;

  // Glow
  const glow = ctx.createRadialGradient(cx, cy, R * 0.5, cx, cy, R * 2.5);
  glow.addColorStop(0,   'rgba(0,100,200,0.15)');
  glow.addColorStop(0.5, 'rgba(0,60,150,0.06)');
  glow.addColorStop(1,   'transparent');
  ctx.save();
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, R * 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Atmosphere ring
  ctx.save();
  const atmo = ctx.createRadialGradient(cx, cy, R, cx, cy, R + 14);
  atmo.addColorStop(0,   'rgba(100,180,255,0.25)');
  atmo.addColorStop(1,   'transparent');
  ctx.fillStyle = atmo;
  ctx.beginPath();
  ctx.arc(cx, cy, R + 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Ocean base
  ctx.save();
  const ocean = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, 0, cx, cy, R);
  ocean.addColorStop(0,   '#1a6ea8');
  ocean.addColorStop(0.5, '#0e4e82');
  ocean.addColorStop(1,   '#062840');
  ctx.fillStyle = ocean;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Continent blobs
  ctx.save();
  ctx.fillStyle = '#2d9e5f';
  const continents = [
    { dx: -18, dy: -10, rx: 18, ry: 12 },
    { dx:  12, dy:  -8, rx: 14, ry: 10 },
    { dx: -10, dy:  16, rx: 10, ry:  7 },
    { dx:  18, dy:  14, rx:  9, ry:  6 },
    { dx: -28, dy:   4, rx:  6, ry:  4 },
  ];
  ctx.beginPath();
  continents.forEach(({ dx, dy, rx, ry }) => {
    ctx.moveTo(cx + dx + rx, cy + dy);
    ctx.ellipse(cx + dx, cy + dy, rx, ry, dx * 0.02, 0, Math.PI * 2);
  });
  ctx.clip();
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fillStyle = '#2d9e5f';
  ctx.fill();
  ctx.restore();

  // Poles
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, cy - R + 8, 16, 8, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(220,235,255,0.7)';
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx, cy + R - 6, 12, 6, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(220,235,255,0.6)';
  ctx.fill();
  ctx.restore();

  // Shine
  ctx.save();
  const shine = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.35, 0, cx, cy, R);
  shine.addColorStop(0,   'rgba(255,255,255,0.22)');
  shine.addColorStop(0.5, 'transparent');
  ctx.fillStyle = shine;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawOrbitPath(cx, cy, r, color) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = color.replace(')', ', 0.35)').replace('rgb(', 'rgba(').replace('#', '');

  // Simple dashed orbit ring
  ctx.setLineDash([6, 6]);
  ctx.lineWidth   = 1;
  

  ctx.strokeStyle = color + '55';
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function drawTrail(cx, cy, trail, color) {
  if (trail.length < 2) return;
  ctx.save();
  for (let i = 1; i < trail.length; i++) {
    const alpha = (i / trail.length) * 0.6;
    ctx.beginPath();
    ctx.moveTo(cx + trail[i-1].x, cy + trail[i-1].y);
    ctx.lineTo(cx + trail[i].x,   cy + trail[i].y);
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha;
    ctx.lineWidth   = 1.5;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawSatellite(cx, cy, sat) {
  const x = cx + Math.cos(sat.angle) * sat.orbitR;
  const y = cy + Math.sin(sat.angle) * sat.orbitR;

  // Glow halo
  ctx.save();
  const halo = ctx.createRadialGradient(x, y, 0, x, y, 18);
  halo.addColorStop(0,   sat.glowColor);
  halo.addColorStop(1,   'transparent');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(x, y, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Body (small rectangle rotated toward orbit direction)
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(sat.angle + Math.PI / 2);
  ctx.fillStyle = sat.color;
  ctx.shadowColor = sat.color;
  ctx.shadowBlur  = 12;
  ctx.fillRect(-4, -3, 8, 6);

  // Solar panels
  ctx.fillStyle = sat.id === 1 ? '#004455' : '#442200';
  ctx.fillRect(-12, -1.5, 7, 3);
  ctx.fillRect(5,   -1.5, 7, 3);
  ctx.strokeStyle = sat.color;
  ctx.lineWidth   = 0.5;
  ctx.strokeRect(-12, -1.5, 7, 3);
  ctx.strokeRect(5,   -1.5, 7, 3);
  ctx.restore();
}

// ── Render Loop ────────────────────────────────────────────
function render(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05); // seconds, capped
  lastTime = timestamp;

  // FPS
  frameCount++;
  fpsTimer += dt;
  if (fpsTimer >= 0.5) {
    document.getElementById('fps-counter').textContent =
      `${Math.round(frameCount / fpsTimer)} FPS`;
    frameCount = 0;
    fpsTimer   = 0;
  }

  if (!paused) {
    missionSec += dt;

    satellites.forEach(sat => {
      const altKm  = sliderToKm(sat.orbitR);
      const omega  = angularVelocity(altKm, sat.speed);
      sat.angle   += omega * dt;

      // Trail
      const cx = canvas.width / 2, cy = canvas.height / 2;
      sat.trail.push({ x: Math.cos(sat.angle) * sat.orbitR,
                       y: Math.sin(sat.angle) * sat.orbitR });
      if (sat.trail.length > sat.trailMax) sat.trail.shift();

      updatePanel(sat, altKm);
    });

    // Mission clock
    const s = Math.floor(missionSec);
    const hh = String(Math.floor(s / 3600)).padStart(2, '0');
    const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    document.getElementById('mission-time').textContent = `T+ ${hh}:${mm}:${ss}`;
  }

  // ── Draw frame ────────────────────────────────────────────
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  drawStars();
  drawGridRings(cx, cy);

  // Orbit paths
  satellites.forEach(sat => {
    drawOrbitPath(cx, cy, sat.orbitR, sat.color);
    drawTrail(cx, cy, sat.trail, sat.color);
  });

  drawEarth(cx, cy);

  // Satellites on top
  satellites.forEach(sat => drawSatellite(cx, cy, sat));

  requestAnimationFrame(render);
}

// ── Controls ───────────────────────────────────────────────
function bindSlider(id, satIdx, prop, displayId, formatter) {
  const el = document.getElementById(id);
  el.addEventListener('input', () => {
    satellites[satIdx][prop] = +el.value;
    document.getElementById(displayId).textContent = formatter(+el.value);
    satellites[satIdx].trail = []; // clear trail on change
  });
}

bindSlider('radius1', 0, 'orbitR', 'val-radius-1', v => `${v} km`);
bindSlider('speed1',  0, 'speed',  'val-speed-1',  v => `${(v/5).toFixed(1)}×`);
bindSlider('radius2', 1, 'orbitR', 'val-radius-2', v => `${v} km`);
bindSlider('speed2',  1, 'speed',  'val-speed-2',  v => `${(v/5).toFixed(1)}×`);

document.getElementById('pauseBtn').addEventListener('click', () => {
  paused = !paused;
  document.getElementById('pauseBtn').textContent = paused ? '▶ RESUME' : '⏸ PAUSE';
});

document.getElementById('resetBtn').addEventListener('click', () => {
  missionSec      = 0;
  satellites[0].angle = 0;
  satellites[1].angle = Math.PI;
  satellites.forEach(s => s.trail = []);
  lastTime = null;
});

// ── Boot ───────────────────────────────────────────────────
requestAnimationFrame(render);