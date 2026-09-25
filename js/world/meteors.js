import * as THREE from "three";

export function createMeteors({ rng, count = 30 } = {}) {
  const object3D = new THREE.Group();
  const geometry = new THREE.IcosahedronGeometry(1, 0);
  const materials = [
    new THREE.MeshStandardMaterial({ color: 0x59616d, roughness: 1, flatShading: true }),
    new THREE.MeshStandardMaterial({ color: 0x7b5b45, roughness: 1, flatShading: true }),
    new THREE.MeshStandardMaterial({ color: 0x343b46, roughness: 1, flatShading: true })
  ];
  const meteors = [];
  const velocity = new THREE.Vector3();

  const clear = () => {
    while (object3D.children.length) object3D.remove(object3D.children[0]);
    meteors.length = 0;
  };

  const reset = (origin = new THREE.Vector3()) => {
    clear();
    for (let index = 0; index < count; index += 1) {
      const mesh = new THREE.Mesh(geometry, rng.pick(materials));
      const scale = rng.float(1.6, 7.5);
      mesh.scale.set(scale, scale * rng.float(0.65, 1.45), scale * rng.float(0.7, 1.35));
      mesh.position.set(
        origin.x + rng.float(-780, 780),
        origin.y + rng.float(-520, 520),
        origin.z + rng.float(-780, 780)
      );
      mesh.rotation.set(rng.float(0, Math.PI), rng.float(0, Math.PI), rng.float(0, Math.PI));
      object3D.add(mesh);
      meteors.push({
        id: `meteor-${index}`,
        mesh,
        velocity: new THREE.Vector3(rng.float(-5, 5), rng.float(-3, 3), rng.float(-7, 7)),
        spin: new THREE.Vector3(rng.float(-0.5, 0.5), rng.float(-0.5, 0.5), rng.float(-0.5, 0.5))
      });
    }
  };

  reset();

  return {
    object3D,
    reset,
    update(dt) {
      meteors.forEach((meteor) => {
        meteor.mesh.position.addScaledVector(meteor.velocity, dt);
        meteor.mesh.rotation.x += meteor.spin.x * dt;
        meteor.mesh.rotation.y += meteor.spin.y * dt;
        meteor.mesh.rotation.z += meteor.spin.z * dt;
        if (meteor.mesh.position.length() > 2400) meteor.mesh.position.multiplyScalar(0.15);
      });
    },
    getColliders() {
      return meteors.map((meteor) => ({
        id: meteor.id,
        kind: "meteor",
        center: meteor.mesh.getWorldPosition(new THREE.Vector3()),
        radius: meteor.mesh.scale.length() * 0.62
      }));
    },
    dispose() {
      clear();
      geometry.dispose();
      materials.forEach((material) => material.dispose());
    }
  };
}
