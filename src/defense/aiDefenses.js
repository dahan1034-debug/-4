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

    this.radarHead = new THREE.Mesh(
      new THREE.CylinderGeometry(9, 9, 7, 20),
      new THREE.MeshStandardMaterial({ color: 0xcbd7df, emissive: 0x2e7190, emissiveIntensity: 0.6 })
    );
    this.radarHead.rotation.x = Math.PI / 2;
    this.radarHead.position.y = 22;
    this.group.add(this.radarHead);

    this.health = 100;
    this.alive = true;
    this.cooldown = 0;
    this.range = 2400;
  }

  update(dt, playerPos) {
    this.cooldown = Math.max(0, this.cooldown - dt);
    if (!this.alive) return;
    const distance = playerPos.distanceTo(this.position);
    if (distance < this.range) this.radarHead.lookAt(playerPos.x, playerPos.y + 25, playerPos.z);
  }

  fire(playerPos) {
    if (!this.alive || this.cooldown > 0) return null;
    const direction = playerPos.clone().sub(this.position).normalize();
    return {
      origin: this.position.clone().add(direction.multiplyScalar(28)).add(new THREE.Vector3(0, 26, 0)),
      target: playerPos.clone(),
      velocity: 250,
      life: 9
    };
  }
}

export class EnemyInterceptor {
  constructor(position, index) {
    this.group = new THREE.Group();
    this.group.position.copy(position);

    const material = new THREE.MeshStandardMaterial({ color: 0xa74342, emissive: 0x4f1f1f, metalness: 0.7, roughness: 0.3 });
    const body = new THREE.Mesh(new THREE.ConeGeometry(6, 26, 12), material);
    body.rotation.z = -Math.PI / 2;
    this.group.add(body);

    const wing = new THREE.Mesh(new THREE.BoxGeometry(24, 2, 8), material);
    this.group.add(wing);

    this.index = index;
    this.health = 60;
    this.alive = true;
    this.cooldown = 1.5 + index * 0.8;
    this.attackBias = index * Math.PI;
    this.state = 'PATROL';
    this.phase = Math.random() * Math.PI * 2;
  }

  update(dt, playerPos, elapsed = 0) {
    if (!this.alive) return;
    this.cooldown = Math.max(0, this.cooldown - dt);
    const delta = playerPos.clone().sub(this.group.position);
    const distance = delta.length();
    this.state = distance > 2600 ? 'INTERCEPT' : distance > 650 ? 'ENGAGE' : 'DISENGAGE';

    const side = Math.sin(elapsed * 0.8 + this.attackBias) * 230;
    const altitude = this.state === 'DISENGAGE' ? 170 : 90;
    const aim = playerPos.clone().add(new THREE.Vector3(side, altitude, Math.cos(elapsed * 0.8 + this.attackBias) * 230));
    const direction = aim.sub(this.group.position).normalize();
    const speed = this.state === 'DISENGAGE' ? 175 : 220;
    this.group.position.addScaledVector(direction, speed * dt);
    this.group.lookAt(this.group.position.clone().add(direction));
    this.group.rotateY(Math.PI);
  }

  fire(playerPos) {
    if (!this.alive || this.cooldown > 0) return null;
    this.cooldown = 3.4 + this.index * 0.7;
    return {
      origin: this.group.position.clone(),
      target: playerPos.clone(),
      velocity: 225,
      life: 8
    };
  }
}
