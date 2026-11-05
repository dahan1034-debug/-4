# Mountain Thunder — Eagles of the Peaks

A browser-based Three.js flight-combat prototype with a multi-mode weapons system, a radar overlay, and an upgrade economy. This phase adds mission depth, weapon diversity, and more responsive combat feel.

## Run locally

Because the project uses ES modules, serve it over HTTP:

```bash
cd /path/to/project
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

## Controls

- `W / S`: pitch
- `A / D`: roll
- `Q / E`: yaw
- `Shift / Ctrl`: throttle
- `Space`: afterburner
- `V`: cycle weapon mode
- `F`: fire selected weapon
- `G`: release flare
- `U`: upgrade panel
- `R`: restart mission
- `H`: toggle HUD

## Weapon modes

- `MISSILE`: guided strike weapon
- `CANNON`: short burst anti-air fire
- `ROCKET`: cluster payload for area pressure

## Gameplay loop

Destroy the forward SAM site, evade enemy missiles, and return to the runway to complete the mission. Credits are awarded for successful engagements and stage completion.

## Notes

This remains an arcade prototype tuned for browser performance, not a military-accurate flight sim. The underlying project is modular and built for future expansion with sound layers, campaign logic, and deeper cockpit detail.
