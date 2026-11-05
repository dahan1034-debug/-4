# Mountain Thunder — Eagles of the Peaks

A browser-based Three.js flight-combat prototype. This branch's next implementation phase adds tactical warning and countermeasure systems, improves target selection and combat AI, and fixes missile tracking and mission-return handling.

## Run locally

ES modules require an HTTP server; opening `index.html` directly as `file://` is not supported.

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
- `F`: fire a guided missile at the current target (8 rounds)
- `G`: release a flare (3 countermeasures)
- `R`: restart the mission
- `H`: toggle HUD

## Current playable loop

Destroy the SAM installation, then return to the marked forward runway. Interceptors pursue and launch missiles; the radar warning receiver reports active SAM radar and nearby inbound missiles. Flares can divert seeker missiles when released near their path. Mission results are persisted in localStorage.

## Sources and licenses

- Three.js documentation and examples: https://threejs.org/docs/ and https://threejs.org/examples/
- Official procedural terrain example: https://github.com/mrdoob/three.js/blob/dev/examples/webgl_geometry_terrain.html
- The project generates its terrain, aircraft, weapons, and effects procedurally. No third-party image, model, or sound asset is included.
- Three.js is loaded from its CDN and retains its own MIT license.

## Known scope

This is a prototype, not a fully realistic combat simulator. Radar visibility is a game mechanic, flight physics are arcade-style, and co-op, full campaign, upgrades, replay, and comprehensive accessibility/language settings remain future work.
