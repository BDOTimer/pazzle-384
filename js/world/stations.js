import * as THREE from "three";

export function createStations() {
  const object3D = new THREE.Group();
  const stations = [];

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
    stations.length = 0;
  };

  const build = (record) => {
    const group = new THREE.Group();
    group.position.set(record.position.x, record.position.y, record.position.z);
    const coreMaterial = new THREE.MeshStandardMaterial({ color: 0x263342, roughness: 0.55, metalness: 0.72, flatShading: true });
    const accentMaterial = new THREE.MeshStandardMaterial({ color: record.color, emissive: record.color, emissiveIntensity: 0.55, roughness: 0.35, metalness: 0.5, flatShading: true });
    const darkMaterial = new THREE.MeshStandardMaterial({ color: 0x111722, roughness: 0.8, metalness: 0.45, flatShading: true });
    const core = new THREE.Mesh(new THREE.CylinderGeometry(7, 9, 18, 10), coreMaterial);
    core.rotation.z = Math.PI * 0.5;
    group.add(core);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(13, 1.7, 6, 20), accentMaterial);
    ring.rotation.y = Math.PI * 0.5;
    group.add(ring);
    const dock = new THREE.Mesh(new THREE.BoxGeometry(7, 2, 20), darkMaterial);
    dock.position.z = 8;
    group.add(dock);
    const dockLight = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.6, 0.7), accentMaterial);
    dockLight.position.set(0, 1.3, 18.2);
    group.add(dockLight);
    for (let index = 0; index < 4; index += 1) {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 20), darkMaterial);
      const angle = index * Math.PI * 0.5;
      arm.position.set(Math.cos(angle) * 9, Math.sin(angle) * 9, 0);
      arm.rotation.y = angle;
      group.add(arm);
    }
    object3D.add(group);
    return { record, group, dockLight };
  };

  const load = (records) => {
    clear();
    stations.push(...records.map(build));
  };

  return {
    object3D,
    load,
    clear,
    update(dt, elapsed) {
      stations.forEach(({ dockLight }, index) => {
        const pulse = 0.65 + Math.sin(elapsed * 4 + index) * 0.35;
        dockLight.material.emissiveIntensity = 0.35 + pulse * 0.7;
      });
    },
    getDockTarget() {
      const station = stations[0];
      if (!station) return null;
      return {
        id: station.record.id,
        name: station.record.name,
        position: station.group.getWorldPosition(new THREE.Vector3()),
        radius: 72
      };
    },
    getColliders() {
      return stations.map(({ record, group }) => ({
        id: `station:${record.id}`,
        kind: "station",
        center: group.getWorldPosition(new THREE.Vector3()),
        radius: 15
      }));
    },
    dispose() {
      clear();
    }
  };
}
