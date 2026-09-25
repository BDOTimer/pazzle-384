import * as THREE from "three";

export function createPlanets() {
  const object3D = new THREE.Group();
  const planets = [];
  const disposables = [];

  const clear = () => {
    while (object3D.children.length) {
      const child = object3D.children[0];
      object3D.remove(child);
      child.traverse((node) => {
        if (node.geometry) node.geometry.dispose();
        if (node.material) {
          const materials = Array.isArray(node.material) ? node.material : [node.material];
          materials.forEach((material) => material.dispose());
        }
      });
    }
    planets.length = 0;
    disposables.length = 0;
  };

  const load = (records) => {
    clear();
    records.forEach((record) => {
      const group = new THREE.Group();
      group.position.set(record.position.x, record.position.y, record.position.z);
      const geometry = new THREE.IcosahedronGeometry(record.radius, 2);
      const material = new THREE.MeshStandardMaterial({
        color: record.color,
        roughness: 0.92,
        metalness: 0.04,
        flatShading: true
      });
      const planet = new THREE.Mesh(geometry, material);
      planet.userData.spin = 0.025 + (record.radius % 9) * 0.002;
      group.add(planet);
      if (record.hasRings) {
        const ringGeometry = new THREE.TorusGeometry(record.radius * 1.55, Math.max(0.7, record.radius * 0.055), 4, 18);
        const ringMaterial = new THREE.MeshBasicMaterial({ color: record.color, transparent: true, opacity: 0.44, side: THREE.DoubleSide });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI * 0.46;
        group.add(ring);
      }
      object3D.add(group);
      planets.push({ record, group, planet });
    });
  };

  return {
    object3D,
    load,
    clear,
    update(dt) {
      planets.forEach(({ planet }) => {
        planet.rotation.y += planet.userData.spin * dt;
      });
    },
    getColliders() {
      return planets.map(({ record, planet }) => ({
        id: `planet:${record.id}`,
        kind: "planet",
        center: planet.getWorldPosition(new THREE.Vector3()),
        radius: record.radius
      }));
    },
    dispose() {
      clear();
      disposables.splice(0);
    }
  };
}
