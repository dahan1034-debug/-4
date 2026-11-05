import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

export function createBase() {
  const group = new THREE.Group();
  const runway = new THREE.Mesh(
    new THREE.BoxGeometry(130, 4, 760),
    new THREE.MeshStandardMaterial({ color: 0x353d46, roughness: 0.9 })
  );
  runway.position.set(0, 6, 1400);
  group.add(runway);

  const bunker = new THREE.Mesh(
    new THREE.BoxGeometry(80, 30, 80),
    new THREE.MeshStandardMaterial({ color: 0x6c7a82, metalness: 0.5, roughness: 0.5 })
  );
  bunker.position.set(0, 18, 980);
  group.add(bunker);

  return group;
}
