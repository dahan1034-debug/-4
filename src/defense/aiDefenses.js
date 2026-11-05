import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

export class SAMSite {
  constructor(position) {
    this.position = position.clone();
    this.group = new THREE.Group();
    this.group.position.copy(position);

    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(25, 32, 20, 12),
      new THREE.MeshStandardMaterial({ color: 0x5b6774, metalness: 0.7, roughness: 0.4 })
    );
    base.position.y = 8;
    this.group.add(base);

    const radar = new THREE.Mesh(
      new THREE.CylinderGeometry(9, 9, 7, 20),
      new THREE.MeshStandardMaterial({ color: 0xcbd7df, emissive: 0x2e7190, emissiveIntensity: 0.6 })
    );
    radar.rotation.x = Math.PI / 2;
    radar.position.y = 22;
    this.group.add(radar);

    this.health = 100;
    this.alive = true;
    this.cooldown = 0;
    this.radarHead = radar;
  }

  update(dt, playerPos) {
    if (!this.alive) return;
    const toPlayer = playerPos.clone().sub(this.position);
    const distance = toPlayer.length();
    if (distance < 1900) {
      this.radarHead.lookAt(playerPos.x, playerPos.y + 25, playerPos.z);
    }
  }

  fire(playerPos) {
    if (!this.alive) return null;
    const dir = playerPos.clone().sub(this.position).normalize();
    const origin = this.position.clone().add(dir.clone().multiplyScalar(25)).add(new THREE.Vector3(0, 26, 0));
    return {
      origin,
      target: playerPos.clone(),
      velocity: 180,
      life: 9
    };
  }
}

export class EnemyInterceptor {
  constructor(position, index) {
    this.position = position.clone();
    this.group = new THREE.Group();
    this.group.position.copy(position);

    const body = new THREE.Mesh(
      new THREE.ConeGeometry(6, 26, 12),
      new THREE.MeshStandardMaterial({ color: 0xa74342, emissive: 0x4f1f1f, metalness: 0.7, roughness: 0.3 })
    );
    body.rotation.z = -Math.PI / 2;
    this.group.add(body);

    const wing = new THREE.Mesh(
      new THREE.BoxGeometry(24, 2, 8),
      new THREE.MeshStandardMaterial({ color: 0x52262a, metalness: 0.55, roughness: 0.4 })
    );
    wing.position.set(0, 0, 0);
    this.group.add(wing);

    this.index = index;
    this.health = 60;
    this.alive = true;
    this.cooldown = 0;
    this.attackBias = Math.random() * Math.PI * 2;
  }

  update(dt, playerPos) {
    if (!this.alive) return;

    const offset = playerPos.clone().sub(this.group.position);
    const targetPoint = playerPos.clone().add(new THREE.Vector3(
      Math.sin(this.attackBias + performance.now() * 0.001) * 180,
      80,
      Math.cos(this.attackBias + performance.now() * 0.001) * 180
    ));

    const toTarget = targetPoint.clone().sub(this.group.position);
    const dir = toTarget.normalize();
    this.group.position.addScaledVector(dir, 130 * dt);
    this.group.lookAt(targetPoint);
    this.group.rotateY(Math.PI);

    this.cooldown -= dt;
  }

  fire(playerPos) {
    if (!this.alive) return null;
    const origin = this.group.position.clone();
    const target = playerPos.clone();
    return { origin, target, velocity: 170, life: 8 };
  }
}
