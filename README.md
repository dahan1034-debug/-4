# Mountain Thunder — Eagles of the Peaks

Browser-based Three.js flight-combat prototype featuring a three-sortie campaign, selectable aircraft, tactical radar/RWR, flares, multi-mode weapons, enemy interceptors, and persistent upgrades.

## Run locally

ES modules require an HTTP server rather than direct `file://` access:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000/`.

## Controls

- `W / S`: pitch; `A / D`: roll; `Q / E`: yaw
- `Shift / Ctrl`: throttle; `Space`: afterburner
- `1 / 2 / 3`: Peak Interceptor / Ridge Striker / Valley Scout
- `V`: cycle missile, cannon, rocket; `F`: fire selected weapon
- `G`: release flare; `U`: upgrade panel
- `N`: advance campaign after mission success; `R`: restart current sortie; `H`: toggle HUD

## Campaign

1. Mountain Shield: destroy the SAM site and return to the forward runway.
2. Falcon Hunt: destroy both interceptors and return.
3. Storm Breaker: destroy the SAM site and both interceptors, then return.

Completing the last sortie finishes the campaign. Progress, credits, airframe selection, and upgrades are stored in browser localStorage.

## Aircraft

- **Peak Interceptor:** highest top speed and payload, lower hull.
- **Ridge Striker:** balanced speed and reinforced hull.
- **Valley Scout:** strongest turn authority, lighter payload.

Airframe attributes affect the flight model and loadout; upgrades modify acceleration, hull capacity, and missile payload.

## Scope

This is an arcade combat prototype, not a realistic military simulator. Terrain, aircraft, weapons, and effects are generated procedurally. Networking/co-op, replay, and full simulation flight dynamics remain future work.
