#  Satellite Orbit Simulation

A browser-based interactive simulation of satellites orbiting the Earth, built with pure HTML5, CSS3, and JavaScript (Canvas API). Demonstrates real orbital mechanics using Kepler's Third Law.

---

##  Preview

> Open `index.html` in any modern browser — no installation required.

---

##  Project Description

This project visually simulates how satellites move in orbit around the Earth. It features:

- **Two satellites** (Alpha & Beta) orbiting simultaneously
- **Real-time physics** based on Kepler's Third Law and Earth's gravitational parameter (μ = 398,600 km³/s²)
- **Adjustable orbit radius** — change Low Earth Orbit to Mid Earth Orbit interactively
- **Adjustable orbital speed** — watch faster/slower orbital motion
- **Live orbital data** — period, altitude, and velocity calculated in real-time
- **Satellite trails** — glowing path trails showing recent movement
- **Mission clock** — tracks elapsed simulation time
- **Space-themed UI** — dark space aesthetic with twinkling stars and glowing effects

---

##  Tools & Technologies

| Technology       | Purpose                          |
|-----------------|----------------------------------|
| HTML5            | Page structure                   |
| CSS3             | Space-themed styling & layout & Modern UI   |
| JavaScript (ES6) | Simulation logic & physics       |
| Canvas API       | 2D rendering of orbit & Earth    |
| Google Fonts     | Orbitron & Share Tech Mono fonts |

**No external libraries or frameworks — runs entirely in the browser.**

---

##  File Structure

```
satellite-orbit-simulation/
│
├── index.html       ← Main HTML page
├── style.css        ← Styles (dark space theme)
├── simulation.js    ← Physics engine & Canvas rendering actual orbit simulation
└── README.md        ← Instructions to run this program in any browser. 
```

---

##  Steps to Run

### Option 1 — Open Directly (Quickest)
1. Download or clone this repository
2. Open `index.html` in any modern browser (Chrome, Firefox, Edge, Safari, Brave)
3. The simulation starts immediately!

### Option 2 — VS Code with Live Server
1. Install [Visual Studio Code](https://code.visualstudio.com/)
2. Install the **Live Server** extension (by Ritwick Dey)
3. Open the project folder in VS Code
4. Right-click `index.html` → **"Open with Live Server"**
5. The simulation opens at `http://127.0.0.1:5500`

### Option 3 — Clone from GitHub
```bash
git clone https://github.com/abishek-07d/SatelliteVisualization.git
cd SatelliteVisualization
# Open index.html in your browser
```

---

##  Explanation of the Simulation

### Physics Model

The simulation uses **Kepler's Third Law of Planetary Motion**:

```
T = 2π × √( a³ / μ )
```

Where:
- `T` = Orbital period (seconds)
- `a` = Semi-major axis / orbital radius (km from Earth's center)
- `μ` = Earth's gravitational parameter = **398,600 km³/s²**

**Orbital Velocity** is calculated as:
```
v = √( μ / a )
```

### Controls

| Control              | Effect                                       |
|---------------------|----------------------------------------------|
| Orbit Radius Slider  | Changes orbit size (300 km – 2,000 km alt)  |
| Speed Slider         | Multiplies angular velocity (0.2× – 4.0×)  |
| PAUSE / RESUME       | Freezes / continues the simulation          |
| RESET                | Returns satellites to starting positions    |

### How Orbital Radius Affects Period

According to Kepler's Law, satellites in **higher orbits have longer periods**:
- Low Earth Orbit (~400 km altitude): ~92 minute period
- Medium Earth Orbit (~2000 km altitude): ~127 minute period

This relationship is clearly visible when you adjust the radius sliders.

---

##  Satellites

| Satellite | Color | Default Altitude | Default Speed |
|-----------|-------|-----------------|---------------|
| Alpha     | Cyan  | ~1,130 km       | 1.0×          |
| Beta      | Orange| ~1,585 km       | 0.6×          |

---

##  Uploading to GitHub

```bash
# Initialize repository
git init
git add .
git commit -m "Initial commit: Satellite Orbit Simulation"

# Link to GitHub 
git remote add origin (https://github.com/abishek-07d/SatelliteVisualization.git)
git branch -M main
git push -u origin main
```

---

## AUTHOR

**Abishek Devanand**   
Engineering Student - Computer Science and Engineering(Cyber Security)
Email: [abishek07d@gmail.com]
Contact:[8072356214]


