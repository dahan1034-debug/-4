# Mountain Thunder — Eagles of the Peaks

A playable browser-based 3D combat flight prototype built with Three.js and ES modules. It includes a procedural mountain field, fighter controls, missile combat, enemy interceptors, SAM defenses, mission scoring, and local save data.

## Run locally

Because the project uses ES modules, it must be served over HTTP instead of being opened directly as `file://`.

```bash
cd /path/to/project
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

## Controls

- `W / S` — pitch
- `A / D` — roll
- `Q / E` — yaw
- `Shift / Ctrl` — throttle
- `Space` — afterburner
- `F` — fire missile
- `G` — flare / countermeasure
- `R` — reset aircraft
- `H` — toggle HUD

## Game loop

- Take off from the forward base.
- Destroy the enemy SAM site or interceptors.
- Return to base to complete the mission.
- Score is saved to localStorage.

## Project structure

```text
.
├── index.html
├── README.md
├── CHANGELOG.md
├── src/
│   ├── main.js
│   ├── core/
│   │   ├── engine.js
│   │   └── save.js
│   ├── world/
│   │   ├── terrain.js
│   │   ├── weather.js
│   │   └── lighting.js
│   ├── aircraft/
│   │   ├── flightModel.js
│   │   └── player.js
│   ├── weapons/
│   │   └── missiles.js
│   ├── defense/
│   │   └── aiDefenses.js
│   ├── ui/
│   │   └── hud.js
│   └── mission/
│       └── mission.js
├── .gitignore
└── assets/
    └── .keep
```

## Saves

Progress and score are stored in `localStorage` using the key:

```text
mountain_thunder_save
```

## Notes

- The game uses procedural generation and runtime-generated sounds.
- It is intentionally designed as a browser prototype built for speed and portability.
- Additional systems such as advanced AI, full mission catalog, co-op, and richer physics can be layered on top of this base.
