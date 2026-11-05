import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

export function terrainHeightAt(x, z) {
  const nx = x * 0.0024;
  const nz = z * 0.0022;

  const ridge = Math.sin(nx * 2.2 + 1.3) * 1100;
  const ridge2 = Math.cos(nz * 3.1 - 0.9) * 850;
  const s = Math.sin((x + z) * 0.0018) * 350;
  const detail = Math.sin(x * 0.005 + z * 0.003) * 180;

  return Math.max(0, 120 + ridge + ridge2 + s + detail);
}

export function createTerrain() {
  const size = 64000;
  const segments = 220;
  const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
  geometry.rotateX(-Math.PI / 2);

  const pos = geometry.attributes.position;
  const colors = [];
  const color = new THREE.Color();

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const h = terrainHeightAt(x, z);
    pos.setY(i, h);

    if (h > 1800) color.set(0xe6edf4);
    else if (h > 950) color.set(0x7c796f);
    else if (h > 350) color.set(0x53694f);
    else color.set(0x334d4b);

    colors.push(color.r, color.g, color.b);
  }

  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 1,
    metalness: 0.04
  });

  const terrain = new THREE.Mesh(geometry, material);
  terrain.name = 'mountain-terrain';
  terrain.receiveShadow = true;
  return terrain;
}
