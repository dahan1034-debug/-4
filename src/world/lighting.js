import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

export function createLighting(scene) {
  const hemi = new THREE.HemisphereLight(0xbfe8ff, 0x30291f, 1.6);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xffedd4, 1.8);
  sun.position.set(5000, 12000, 3000);
  scene.add(sun);

  const ambient = new THREE.AmbientLight(0x7eaad4, 0.35);
  scene.add(ambient);

  return { hemi, sun, ambient };
}
