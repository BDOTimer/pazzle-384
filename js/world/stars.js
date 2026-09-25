import * as THREE from "three";

const STAR_COLORS = [0xffffff, 0x00d5df, 0xffe14a, 0xed2f91, 0x0084ff, 0xff8a65];

export function createStars({ rng, count = 1300, radius = 2400 } = {}) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  for (let index = 0; index < count; index += 1) {
    const radiusValue = radius * Math.cbrt(rng.next());
    const theta = rng.float(0, Math.PI * 2);
    const phi = Math.acos(rng.float(-1, 1));
    const offset = index * 3;
    positions[offset] = radiusValue * Math.sin(phi) * Math.cos(theta);
    positions[offset + 1] = radiusValue * Math.sin(phi) * Math.sin(theta);
    positions[offset + 2] = radiusValue * Math.cos(phi);
    const color = new THREE.Color(rng.pick(STAR_COLORS));
    colors[offset] = color.r;
    colors[offset + 1] = color.g;
    colors[offset + 2] = color.b;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({
    size: 2.4,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.92,
    depthWrite: false
  });
  const object3D = new THREE.Points(geometry, material);

  return {
    object3D,
    setOrigin(position) {
      object3D.position.copy(position);
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    }
  };
}
