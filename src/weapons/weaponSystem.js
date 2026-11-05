import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

export class WeaponSystem {
  constructor(scene, missileManager) {
    this.scene = scene;
    this.missileManager = missileManager;
    this.modes = ['MISSILE', 'CANNON', 'ROCKET'];
    this.modeIndex = 0;
  }

  cycle() {
    this.modeIndex = (this.modeIndex + 1) % this.modes.length;
    return this.getCurrent();
  }

  getCurrent() {
    return this.modes[this.modeIndex];
  }

  fire(player, target, state, sound) {
    if (!target?.position) return false;
    const mode = this.getCurrent();
    const position = typeof target.position === 'function' ? target.position() : target.position.clone();
    const origin = player.group.position.clone().add(new THREE.Vector3(0, 0, -18).applyQuaternion(player.group.quaternion));
    const track = () => typeof target.position === 'function' ? target.position() : target.position.clone();
    const options = { owner: 'player', targetKind: target.kind, targetId: target.id, seeker: mode !== 'CANNON' };

    if (mode === 'MISSILE') {
      if (state.missiles <= 0) return false;
      this.missileManager.spawn(origin, track, 430, 9, options);
      state.missiles -= 1;
      sound?.playLaunch('missile');
      return true;
    }

    if (mode === 'CANNON') {
      const direction = position.sub(origin).normalize();
      const maxRangeTarget = origin.clone().addScaledVector(direction, 1300);
      this.missileManager.spawn(origin, maxRangeTarget, 760, 1.8, options);
      this.missileManager.spawn(origin.clone().add(new THREE.Vector3(2, 0, 0)), maxRangeTarget.clone(), 740, 1.85, options);
      sound?.playLaunch('cannon');
      return true;
    }

    if (mode === 'ROCKET') {
      if (state.rockets <= 0) return false;
      for (let i = 0; i < 3; i++) {
        const offset = new THREE.Vector3((i - 1) * 7, (i % 2) * 4, 0);
        this.missileManager.spawn(origin.clone().add(offset), () => track().add(new THREE.Vector3((i - 1) * 18, 0, 0)), 520, 6, options);
      }
      state.rockets -= 1;
      sound?.playLaunch('rocket');
      return true;
    }
    return false;
  }
}
