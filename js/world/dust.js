import * as THREE from "three";

const DUST_COLORS = [0x0084ff, 0x00d5df, 0xf4f4ed, 0xed2f91];

export function createDust({ rng, count = 900, radius = 1100 } = {}) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const speeds = new Float32Array(count);
  for (let index = 0; index < count; index += 1) {
    const offset = index * 3;
    positions[offset] = rng.float(-radius, radius);
    positions[offset + 1] = rng.float(-radius, radius);
    positions[offset + 2] = rng.float(-radius, radius);
    speeds[index] = rng.float(0.35, 1.4);
    const color = new THREE.Color(rng.pick(DUST_COLORS));
    colors[offset] = color.r;
    colors[offset + 1] = color.g;
    colors[offset + 2] = color.b;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({
    size: 1.35,
    vertexColors: true,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  const object3D = new THREE.Points(geometry, material);

  return {
    object3D,
    update(dt, origin, playerSpeed = 0) {
      object3D.position.copy(origin);
      const attribute = geometry.getAttribute("position");
      for (let index = 0; index < count; index += 1) {
        const zIndex = index * 3 + 2;
        positions[zIndex] += (18 + playerSpeed * 0.85) * speeds[index] * dt;
        if (positions[zIndex] > radius) {
          positions[zIndex] = -radius;
          positions[index * 3] = rng.float(-radius, radius);
          positions[index * 3 + 1] = rng.float(-radius, radius);
        }
      }
      attribute.needsUpdate = true;
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    }
  };
}
