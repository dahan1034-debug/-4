import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import { Engine } from './core/engine.js';
import { SaveManager } from './core/save.js';
import { createTerrain, terrainHeightAt } from './world/terrain.js';
import { createWeatherSystem } from './world/weather.js';
import { createLighting } from './world/lighting.js';
import { PlayerAircraft } from './aircraft/player.js';
import { MissileManager } from './weapons/missiles.js';
import { SAMSite, EnemyInterceptor } from './defense/aiDefenses.js';
import { HUD } from './ui/hud.js';
import { createBase } from './mission/mission.js';

const root = document.getElementById('game-root');
const statusEl = document.getElementById('status');
const messageEl = document.getElementById('message');

const engine = new Engine(root);
const save = new SaveManager();
const weather = createWeatherSystem();
const scene = engine.scene;
const camera = engine.camera;
const hud = new HUD(statusEl);

scene.background = new THREE.Color(0x9cb8d1);
scene.fog = new THREE.Fog(0x9cb8d1, 500, 20000);

const terrain = createTerrain();
scene.add(terrain);
createLighting(scene);

const base = createBase();
base.position.y = terrainHeightAt(0, 1400) + 2;
scene.add(base);

const player = new PlayerAircraft();
scene.add(player.group);

const sam = new SAMSite(new THREE.Vector3(2000, terrainHeightAt(2000, 1200), 1200));
scene.add(sam.group);

const enemyInterceptors = [
  new EnemyInterceptor(new THREE.Vector3(-1500, 1100, 800), 0),
  new EnemyInterceptor(new THREE.Vector3(-2200, 1300, 2000), 1)
];
for (const enemy of enemyInterceptors) scene.add(enemy.group);

const playerMissiles = new MissileManager(scene, 0xffc97a);
const enemyMissiles = new MissileManager(scene, 0xff4d5d);

const saveData = save.load();
const state = {
  mission: 'DESTROY SAM SITE',
  targetStatus: 'ACTIVE',
  score: 0,
  health: 100,
  playerFlare: 3,
  bestScore: saveData.bestScore,
  lastMessageTimer: 0,
  missionCleared: false,
  gameOver: false
};

function showMessage(text, color = 'rgba(17, 31, 44, 0.8)') {
  messageEl.textContent = text;
  messageEl.style.background = color;
  messageEl.style.display = 'block';
  clearTimeout(showMessage.timer);
  showMessage.timer = setTimeout(() => {
    messageEl.style.display = 'none';
  }, 1800);
}

function resetPlayer() {
  player.group.position.set(0, 850, -900);
  player.group.rotation.set(0, 0, 0);
  player.flight.speed = 220;
  player.flight.throttle = 0.62;
  state.health = player.health = 100;
  state.score = 0;
  state.mission = 'DESTROY SAM SITE';
  state.targetStatus = 'ACTIVE';
  state.missionCleared = false;
  state.gameOver = false;
  sam.alive = true;
  sam.health = 100;
  showMessage('AIRCRAFT RESET', 'rgba(23, 61, 72, 0.8)');
}

function updateCamera(dt) {
  const offset = new THREE.Vector3(0, 120, 260).applyQuaternion(player.group.quaternion);
  const targetPos = player.group.position.clone().add(offset);
  camera.position.lerp(targetPos, 1 - Math.exp(-4.5 * dt));
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
    targetStatus: sam.alive ? 'SAM ACTIVE' : 'SAM DESTROYED',
    score: state.score,
    mission: state.mission
  });
}

function tryFireMissile() {
  if (state.gameOver) return;
  const origin = player.group.position.clone().add(new THREE.Vector3(0, 0, -18).applyQuaternion(player.group.quaternion));
  const target = sam.position.clone().add(new THREE.Vector3(0, 12, 0));
  playerMissiles.spawn(origin, target, 360, 8);
  showMessage('MISSILE LAUNCHED', 'rgba(100, 82, 17, 0.8)');
}

function fireEnemyMissile(enemy) {
  const info = enemy.fire(player.group.position.clone());
  if (!info) return;
  enemyMissiles.spawn(info.origin, info.target, info.velocity, info.life);
}

function handlePlayerDamage(amount) {
  state.health = Math.max(0, state.health - amount);
  player.health = state.health;
  if (state.health <= 0) {
    state.gameOver = true;
    state.mission = 'AIRCRAFT LOST';
    showMessage('AIRCRAFT LOST', 'rgba(142, 34, 62, 0.8)');
  }
}

engine.setUpdate((dt, input) => {
  weather.tick(dt);

  if (input.isPressed('KeyR')) resetPlayer();
  if (input.isPressed('KeyH')) hud.toggle();
  if (input.isPressed('KeyF')) tryFireMissile();
  if (input.isPressed('KeyG')) {
    state.playerFlare = Math.min(5, state.playerFlare + 1);
    showMessage('FLARE DEPLOYED', 'rgba(36, 82, 66, 0.8)');
  }

  if (!state.gameOver) {
    player.update(dt, input);
  }

  const groundHeight = terrainHeightAt(player.group.position.x, player.group.position.z);
  if (player.group.position.y < groundHeight + 28) {
    handlePlayerDamage(24);
    player.group.position.y = Math.max(groundHeight + 28, player.group.position.y + 30);
  }

  sam.update(dt, player.group.position.clone());
  for (const enemy of enemyInterceptors) {
    enemy.update(dt, player.group.position.clone());
    if (enemy.cooldown <= 0 && enemy.group.position.distanceTo(player.group.position) < 1200) {
      fireEnemyMissile(enemy);
      enemy.cooldown = 2.5 + Math.random() * 1.4;
    }
  }

  if (sam.alive && sam.position.distanceTo(player.group.position) < 1500 && Math.random() < 0.01) {
    const shot = sam.fire(player.group.position.clone());
    if (shot) {
      enemyMissiles.spawn(shot.origin, shot.target, shot.velocity, shot.life);
    }
  }

  playerMissiles.update(dt);
  enemyMissiles.update(dt);

  const missileHits = [...playerMissiles.missiles];
  for (const missile of missileHits) {
    if (missile.position.distanceTo(sam.position.clone().add(new THREE.Vector3(0, 8, 0))) < 30) {
      sam.health -= 33;
      if (sam.health <= 0) {
        sam.alive = false;
        state.targetStatus = 'DESTROYED';
        state.score += 500;
        state.mission = 'RETURN TO BASE';
        state.missionCleared = true;
        showMessage('SAM SITE DESTROYED', 'rgba(25, 84, 56, 0.8)');
      }
      playerMissiles.scene.remove(missile);
      playerMissiles.missiles = playerMissiles.missiles.filter((m) => m !== missile);
    }
  }

  for (const missile of [...enemyMissiles.missiles]) {
    if (missile.position.distanceTo(player.group.position) < 24) {
      handlePlayerDamage(18);
      enemyMissiles.scene.remove(missile);
      enemyMissiles.missiles = enemyMissiles.missiles.filter((m) => m !== missile);
    }
  }

  const baseDistance = player.group.position.distanceTo(base.position);
  if (state.missionCleared && baseDistance < 180) {
    state.score += 250;
    state.bestScore = Math.max(state.bestScore, state.score);
    save.save({
      bestScore: state.bestScore,
      missionsCleared: (save.load().missionsCleared || 0) + 1,
      upgrades: save.load().upgrades
    });
    state.mission = 'MISSION COMPLETE';
    showMessage(`MISSION COMPLETE — ${state.score} POINTS`, 'rgba(18, 62, 77, 0.8)');
    state.missionCleared = false;
    state.gameOver = true;
  }

  if (state.score > 0 && state.gameOver === false) {
    state.score += dt * 2;
  }

  updateCamera(dt);
  updateHud();
});

engine.start();
showMessage('MISSION ACTIVE', 'rgba(22, 50, 62, 0.82)');
resetPlayer();
