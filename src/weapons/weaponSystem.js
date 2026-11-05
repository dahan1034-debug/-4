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
    return this.modes[this.modeIndex];
  }

  getCurrent() {
    return this.modes[this.modeIndex];
  }

  fire(player, targetGetter, state, sound) {
    const mode = this.getCurrent();
    const origin = player.group.position.clone().add(new THREE.Vector3(0, 0, -18).applyQuaternion(player.group.quaternion));
    const target = targetGetter();

    if (!target) return false;

    if (mode === 'MISSILE') {
      if (state.missiles <= 0) return false;
      this.missileManager.spawn(origin, () => target.clone(), 430, 9, { owner: 'player', targetKind: target.kind || 'sam', targetId: target.id || null, seeker: true });
      state.missiles -= 1;
      sound?.playLaunch('missile');
      return true;
    }

    if (mode === 'CANNON') {
      const burstTarget = target.clone();
      const dir = burstTarget.clone().sub(origin).normalize();
      this.missileManager.spawn(origin, () => burstTarget.clone(), 720, 2.3, { owner: 'player', targetKind: target.kind || 'sam', targetId: target.id || null, seeker: false });
      this.missileManager.spawn(origin.clone().add(new THREE.Vector3(2, 0, 0)), () => burstTarget.clone().add(new THREE.Vector3(12, 0, 10)), 690, 2.4, { owner: 'player', targetKind: target.kind || 'sam', targetId: target.id || null, seeker: false });
      sound?.playLaunch('cannon');
      return true;
    }

    if (mode === 'ROCKET') {
      const clusterTarget = target.clone();
      for (let i = 0; i < 3; i++) {
        const offset = new THREE.Vector3((i - 1) * 8, (i % 2) * 5, 0);
        this.missileManager.spawn(origin.clone().add(offset), () => clusterTarget.clone().add(new THREE.Vector3((i - 1) * 30, 10, 0)), 520, 5.5, { owner: 'player', targetKind: target.kind || 'sam', targetId: target.id || null, seeker: true });
      }
      sound?.playLaunch('rocket');
      return true;
    }

    return false;
  }
}
