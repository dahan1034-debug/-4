import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import { Engine } from './core/engine.js';
import { SaveManager } from './core/save.js';
import { createTerrain, terrainHeightAt } from './world/terrain.js';
import { createWeatherSystem } from './world/weather.js';
import { createLighting } from './world/lighting.js';
import { PlayerAircraft } from './aircraft/player.js';
import { MissileManager } from './weapons/missiles.js';
import { CountermeasureSystem } from './weapons/countermeasures.js';
import { WeaponSystem } from './weapons/weaponSystem.js';
import { AudioManager } from './audio/audioManager.js';
import { SAMSite, EnemyInterceptor } from './defense/aiDefenses.js';
import { RadarWarningReceiver } from './defense/rwr.js';
import { HUD } from './ui/hud.js';
import { RadarScope } from './ui/radar.js';
import { UpgradeSystem } from './upgrades/upgradeSystem.js';
import { createBase } from './mission/mission.js';

const root = document.getElementById('game-root');
const statusEl = document.getElementById('status');
const messageEl = document.getElementById('message');
const radarCanvas = document.getElementById('radar');
const upgradePanel = document.getElementById('upgrade-panel');

const engine = new Engine(root);
const save = new SaveManager();
const weather = createWeatherSystem();
const rwr = new RadarWarningReceiver();
const radar = new RadarScope(radarCanvas);
const audio = new AudioManager();
const scene = engine.scene;
const camera = engine.camera;
const hud = new HUD(statusEl);

scene.background = new THREE.Color(0x9cb8d1);
scene.fog = new THREE.Fog(0x9cb8d1, 500, 20000);
scene.add(createTerrain());
createLighting(scene);

const base = createBase();
base.position.y = terrainHeightAt(0, 1400) + 2;
scene.add(base);
const runwayPosition = new THREE.Vector3(0, base.position.y + 6, 1400);

const player = new PlayerAircraft();
scene.add(player.group);
const sam = new SAMSite(new THREE.Vector3(2000, terrainHeightAt(2000, 1200), 1200));
scene.add(sam.group);
const enemies = [
  new EnemyInterceptor(new THREE.Vector3(-1500, 1100, 800), 0),
  new EnemyInterceptor(new THREE.Vector3(-2200, 1300, 2000), 1)
];
for (const enemy of enemies) scene.add(enemy.group);

const playerMissiles = new MissileManager(scene, 0xffc97a);
const enemyMissiles = new MissileManager(scene, 0xff4d5d);
const countermeasures = new CountermeasureSystem(scene, 3);
const weapons = new WeaponSystem(scene, playerMissiles);
const saveData = save.load();
const state = {
  mission: 'DESTROY SAM SITE',
  score: saveData.bestScore || 0,
  health: 100,
  missiles: 8,
  missionCleared: false,
  missionComplete: false,
  gameOver: false,
  elapsed: 0,
  credits: Number(saveData.credits || Math.max(0, Math.round((saveData.bestScore || 0) / 10))),
  rwr: { contacts: [], alert: false, primary: null },
  upgrades: { engine: saveData.upgrades?.engine || 0, armor: saveData.upgrades?.armor || 0, missiles: saveData.upgrades?.missiles || 0 },
  weaponMode: 'MISSILE'
};

const upgrades = new UpgradeSystem(save, state, upgradePanel);

function showMessage(text, color = 'rgba(17, 31, 44, 0.82)') {
  messageEl.textContent = text;
  messageEl.style.background = color;
  messageEl.style.display = 'block';
  clearTimeout(showMessage.timer);
  showMessage.timer = setTimeout(() => { messageEl.style.display = 'none'; }, 1800);
}

function resetPlayer() {
  player.group.position.set(0, 850, -900);
  player.group.rotation.set(0, 0, 0);
  player.flight.speed = 200 + state.upgrades.engine * 14;
  player.flight.throttle = 0.62;
  player.health = state.health = 100 + state.upgrades.armor * 12;
  state.score = 0;
  state.missiles = 8 + state.upgrades.missiles * 2;
  state.mission = 'DESTROY SAM SITE';
  state.missionCleared = false;
  state.missionComplete = false;
  state.gameOver = false;
  state.weaponMode = weapons.getCurrent();
  sam.alive = true;
  sam.health = 100;
  sam.group.visible = true;
  for (const enemy of enemies) {
    enemy.alive = true;
    enemy.health = 60;
    enemy.group.visible = true;
  }
  showMessage('MISSION ACTIVE — DESTROY THE SAM SITE');
}

function updateCamera(dt) {
  const offset = new THREE.Vector3(0, 120, 260).applyQuaternion(player.group.quaternion);
  camera.position.lerp(player.group.position.clone().add(offset), 1 - Math.exp(-4.5 * dt));
  const look = player.group.position.clone().add(new THREE.Vector3(0, 30, -250).applyQuaternion(player.group.quaternion));
  camera.lookAt(look);
}

function updateHud() {
  hud.update({
    speed: player.flight.speed * 1.94,
    altitude: Math.max(0, player.group.position.y),
    heading: (THREE.MathUtils.radToDeg(player.group.rotation.y) + 360) % 360,
    throttle: player.flight.throttle,
    afterburner: player.flight.afterburner,
    health: state.health,
    missiles: state.missiles,
    flares: countermeasures.remaining,
    rwr: state.rwr,
    targetStatus: sam.alive ? 'SAM ACTIVE' : 'SAM DESTROYED',
    score: state.score,
    mission: `${state.mission} | ${state.weaponMode}`
  });
}

function damagePlayer(amount) {
  if (state.gameOver) return;
  state.health = Math.max(0, state.health - amount * (1 - state.upgrades.armor * 0.06));
  player.health = state.health;
  if (state.health <= 0) {
    state.gameOver = true;
    state.mission = 'AIRCRAFT LOST';
    showMessage('AIRCRAFT LOST — PRESS R TO RESTART', 'rgba(142, 34, 62, 0.88)');
  }
}

function acquireTarget() {
  if (sam.alive) return { kind: 'sam', id: 'sam', position: sam.position };
  const live = enemies.filter(enemy => enemy.alive);
  if (!live.length) return null;
  live.sort((a, b) => a.group.position.distanceTo(player.group.position) - b.group.position.distanceTo(player.group.position));
  return { kind: 'interceptor', id: live[0].index, position: live[0].group.position };
}

function firePlayerWeapon() {
  if (state.gameOver) return;
  const target = acquireTarget();
  if (!target) {
    showMessage('NO HOSTILE TARGET');
    return;
  }

  const fired = weapons.fire(player, () => target.position, state, audio);
  if (!fired) {
    showMessage(`${state.weaponMode} EMPTY — RELOAD`, 'rgba(120, 80, 26, 0.8)');
    return;
  }

  state.weaponMode = weapons.getCurrent();
  showMessage(`${state.weaponMode} FIRED`, 'rgba(100, 82, 17, 0.86)');
}

function fireEnemyMissile(enemy) {
  const shot = enemy.fire(player.group.position.clone());
  if (!shot) return;
  enemyMissiles.spawn(shot.origin, () => player.group.position.clone(), shot.velocity, shot.life, { owner: 'enemy', seeker: true });
  audio.playLaunch('missile');
}

function removeHitPlayerMissile(missile) {
  const data = missile.userData;
  if (data.targetKind === 'sam' && sam.alive && missile.position.distanceTo(sam.position) < 46) {
    sam.health -= 35;
    if (sam.health <= 0) {
      sam.alive = false;
      sam.group.visible = false;
      state.score += 500;
      state.credits += 25;
      state.mission = 'RETURN TO FORWARD BASE';
      state.missionCleared = true;
      showMessage('SAM SITE DESTROYED — RETURN TO BASE', 'rgba(25, 84, 56, 0.88)');
      audio.playExplosion();
    }
    playerMissiles.remove(missile);
    return true;
  }

  if (data.targetKind === 'interceptor') {
    const enemy = enemies[data.targetId];
    if (enemy?.alive && missile.position.distanceTo(enemy.group.position) < 38) {
      enemy.health -= 35;
      if (enemy.health <= 0) {
        enemy.alive = false;
        enemy.group.visible = false;
        state.score += 200;
        state.credits += 10;
        showMessage(`INTERCEPTOR ${enemy.index + 1} DESTROYED`, 'rgba(25, 84, 56, 0.86)');
        audio.playExplosion();
      }
      playerMissiles.remove(missile);
      return true;
    }
  }
  return false;
}

engine.setUpdate((dt, input) => {
  state.elapsed += dt;
  weather.tick(dt);
  countermeasures.update(dt);

  if (input.isPressed('KeyR')) resetPlayer();
  if (input.isPressed('KeyH')) hud.toggle();
  if (input.isPressed('KeyU')) upgrades.toggle();
  if (input.isPressed('KeyF')) firePlayerWeapon();
  if (input.isPressed('KeyV')) {
    state.weaponMode = weapons.cycle();
    showMessage(`WEAPON MODE ${state.weaponMode}`);
  }
  if (input.isPressed('KeyG')) {
    const velocity = new THREE.Vector3();
    player.group.getWorldDirection(velocity).multiplyScalar(player.flight.speed);
    if (countermeasures.release(player.group.position, velocity)) showMessage('FLARE RELEASED');
    else showMessage(countermeasures.remaining ? 'FLARE DISPENSER RELOADING' : 'NO FLARES');
  }

  if (!state.gameOver) player.update(dt, input);

  const groundHeight = terrainHeightAt(player.group.position.x, player.group.position.z);
  if (player.group.position.y < groundHeight + 28) {
    damagePlayer(12);
    player.group.position.y = groundHeight + 32;
  }

  sam.update(dt, player.group.position);
  for (const enemy of enemies) {
    enemy.update(dt, player.group.position, state.elapsed);
    const distance = enemy.group.position.distanceTo(player.group.position);
    if (distance < 2200 && enemy.cooldown <= 0) fireEnemyMissile(enemy);
  }

  const samDistance = sam.position.distanceTo(player.group.position);
  if (sam.alive && samDistance < sam.range && sam.cooldown <= 0) {
    const shot = sam.fire(player.group.position);
    if (shot) {
      enemyMissiles.spawn(shot.origin, () => player.group.position.clone(), shot.velocity, shot.life, { owner: 'sam', seeker: true });
      sam.cooldown = 4.2;
      audio.playLaunch('missile');
    }
  }

  const decoys = countermeasures.getTargets();
  playerMissiles.update(dt);
  enemyMissiles.update(dt, decoys);

  for (const missile of [...playerMissiles.missiles]) removeHitPlayerMissile(missile);
  for (const missile of [...enemyMissiles.missiles]) {
    if (missile.position.distanceTo(player.group.position) < 28) {
      damagePlayer(18);
      enemyMissiles.remove(missile);
      audio.playExplosion();
    }
  }

  state.rwr = rwr.update(
    player.group,
    [{ type: 'SAM', position: sam.position, active: sam.alive, range: sam.range }],
    enemyMissiles.missiles
  );
  if (state.rwr.alert && !engine._rwrWasAlert) showMessage('RWR — INBOUND MISSILE', 'rgba(142, 34, 62, 0.88)');
  engine._rwrWasAlert = state.rwr.alert;

  if (state.missionCleared && !state.missionComplete && player.group.position.distanceTo(runwayPosition) < 230) {
    state.score += 250;
    const latest = save.load();
    latest.bestScore = Math.max(latest.bestScore, Math.round(state.score));
    latest.missionsCleared = (latest.missionsCleared || 0) + 1;
    latest.credits = (latest.credits || 0) + 30 + state.upgrades.engine * 5;
    save.save(latest);
    state.credits = latest.credits;
    state.mission = 'MISSION COMPLETE';
    state.missionComplete = true;
    state.gameOver = true;
    showMessage(`MISSION COMPLETE — ${Math.round(state.score)} POINTS`, 'rgba(18, 62, 77, 0.9)');
  }

  if (state.missionCleared && !state.gameOver) state.score += dt * 2;

  radar.draw({
    x: player.group.position.x,
    y: player.group.position.z,
    heading: player.group.rotation.y
  }, {
    sam: sam.alive ? { x: sam.position.x, y: sam.position.z } : null,
    enemies: enemies.filter(e => e.alive).map(e => ({ x: e.group.position.x, y: e.group.position.z })),
    missiles: enemyMissiles.missiles.map(m => ({ x: m.position.x, y: m.position.z })),
    contacts: state.rwr.contacts
  });

  updateCamera(dt);
  updateHud();
});

engine.start();
upgrades.syncPanel();
resetPlayer();
