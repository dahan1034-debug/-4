import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

export class MissileManager {
  constructor(scene, color = 0xffd08a) {
    this.scene = scene;
    this.color = color;
    this.missiles = [];
  }

  spawn(origin, target, speed = 260, life = 6) {
    const mesh = new THREE.Mesh(
      new THREE.ConeGeometry(1.8, 16, 10),
      new THREE.MeshStandardMaterial({
        color: this.color,
        emissive: this.color,
        emissiveIntensity: 0.4,
        metalness: 0.7,
        roughness: 0.4
      })
    );

    mesh.position.copy(origin);
    mesh.quaternion.copy(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0)));

    const forward = new THREE.Vector3();
    origin.clone().add(new THREE.Vector3(0, 0, -1));

    const dir = target.clone().sub(origin).normalize();
    mesh.lookAt(target);
    mesh.rotateX(Math.PI / 2);

    mesh.userData = {
      velocity: speed,
      direction: dir,
      target: target.clone(),
      life: life,
      homing: true
    };

    this.scene.add(mesh);
    this.missiles.push(mesh);
    return mesh;
  }

  update(dt) {
    for (let i = this.missiles.length - 1; i >= 0; i--) {
      const missile = this.missiles[i];
      const data = missile.userData;
      const dir = data.target.clone().sub(missile.position).normalize();
      if (data.homing) {
        const current = new THREE.Vector3();
        missile.getWorldDirection(current);
        current.lerp(dir, 0.06).normalize();
        missile.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), current);
      }

      missile.position.add(dir.clone().multiplyScalar(data.velocity * dt));
      data.life -= dt;

      if (data.life <= 0) {
        this.scene.remove(missile);
        this.missiles.splice(i, 1);
      }
    }
  }
}
