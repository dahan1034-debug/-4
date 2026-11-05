import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

export class CountermeasureSystem {
  constructor(scene, capacity = 3) {
    this.scene = scene;
    this.capacity = capacity;
    this.remaining = capacity;
    this.cooldown = 0;
    this.decoys = [];
  }

  release(position, velocity) {
    if (this.remaining <= 0 || this.cooldown > 0) return false;

    this.remaining -= 1;
    this.cooldown = 1.1;
    const material = new THREE.MeshBasicMaterial({ color: 0xff9b54 });
    const flare = new THREE.Mesh(new THREE.SphereGeometry(3.2, 8, 8), material);
    flare.position.copy(position);
    this.scene.add(flare);

    const drift = velocity.clone().multiplyScalar(-0.2);
    drift.add(new THREE.Vector3((Math.random() - 0.5) * 55, 24 + Math.random() * 20, (Math.random() - 0.5) * 55));
    this.decoys.push({ mesh: flare, position: flare.position, velocity: drift, life: 3.2 });
    return true;
  }

  update(dt) {
    this.cooldown = Math.max(0, this.cooldown - dt);
    for (let i = this.decoys.length - 1; i >= 0; i--) {
      const decoy = this.decoys[i];
      decoy.life -= dt;
      decoy.velocity.y -= 9 * dt;
      decoy.mesh.position.addScaledVector(decoy.velocity, dt);
      decoy.mesh.material.opacity = Math.min(1, decoy.life / 0.7);
      decoy.mesh.material.transparent = true;
      decoy.mesh.scale.setScalar(0.7 + Math.max(0, decoy.life) * 0.25);
      if (decoy.life <= 0) {
        this.scene.remove(decoy.mesh);
        decoy.mesh.geometry.dispose();
        decoy.mesh.material.dispose();
        this.decoys.splice(i, 1);
      }
    }
  }

  getTargets() {
    return this.decoys.map(decoy => ({ position: decoy.position, life: decoy.life }));
  }
}
