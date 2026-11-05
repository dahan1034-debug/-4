import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

export class MissileManager {
  constructor(scene, color = 0xffd08a) {
    this.scene = scene;
    this.color = color;
    this.missiles = [];
  }

  spawn(origin, target, speed = 260, life = 6, options = {}) {
    const mesh = new THREE.Mesh(
      new THREE.ConeGeometry(1.8, 16, 10),
      new THREE.MeshStandardMaterial({ color: this.color, emissive: this.color, emissiveIntensity: 0.4, metalness: 0.7, roughness: 0.4 })
    );
    mesh.position.copy(origin);

    const targetRef = typeof target === 'function' ? target : () => target.clone();
    const initialTarget = targetRef();
    const direction = initialTarget.clone().sub(origin).normalize();
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
    mesh.userData = {
      velocity: speed,
      direction,
      targetRef,
      life,
      seeker: Boolean(options.seeker),
      owner: options.owner ?? 'unknown',
      targetKind: options.targetKind ?? null,
      targetId: options.targetId ?? null,
      decoyTarget: null
    };

    this.scene.add(mesh);
    this.missiles.push(mesh);
    return mesh;
  }

  update(dt, decoys = []) {
    for (let i = this.missiles.length - 1; i >= 0; i--) {
      const missile = this.missiles[i];
      const data = missile.userData;
      data.life -= dt;

      if (data.seeker && !data.decoyTarget) {
        const candidate = decoys.find(decoy => decoy.life > 0 && decoy.position.distanceTo(missile.position) < 280);
        if (candidate && Math.random() < 0.22) data.decoyTarget = candidate.position;
      }

      if (data.seeker) {
        const target = data.decoyTarget ?? data.targetRef();
        const desired = target.clone().sub(missile.position).normalize();
        data.direction.lerp(desired, Math.min(1, dt * 2.4)).normalize();
      }
      missile.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), data.direction);
      missile.position.addScaledVector(data.direction, data.velocity * dt);

      if (data.life <= 0 || !Number.isFinite(missile.position.x)) this.remove(missile);
    }
  }

  remove(missile) {
    const index = this.missiles.indexOf(missile);
    if (index < 0) return;
    this.scene.remove(missile);
    missile.geometry.dispose();
    missile.material.dispose();
    this.missiles.splice(index, 1);
  }
}
