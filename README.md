# Mountain Thunder — Eagles of the Peaks

A browser-based Three.js flight-combat prototype. This phase adds tactical mission tooling and a persistent upgrade economy to heighten replayability and system depth.

## Run locally

ES modules require an HTTP server instead of direct file opening.

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000/`.

## Controls

- `W / S`: pitch
- `A / D`: roll
- `Q / E`: yaw
- `Shift / Ctrl`: throttle
- `Space`: afterburner
- `F`: fire missile
- `G`: release flare
- `U`: open upgrades panel
- `R`: reset mission
- `H`: hide HUD

## Systems added in this phase

- Radar scope with bearings and inbound radar/weapon warnings
- Upgrade panel with persistent localStorage tracking
- Credits economy from successful mission payouts
- Improved missile adjustments and target selection
- Replay-friendly combat loop with better mission flow

## Remarks

This remains an arcade-style prototype. The simulation is optimized for browser performance and quick iteration rather than military realism.
