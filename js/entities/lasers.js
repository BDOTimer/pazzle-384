import * as THREE from "three";

const FORWARD = new THREE.Vector3(0, 0, -1);
const direction = new THREE.Vector3();
const distance = new THREE.Vector3();

export function createLaserSystem({ poolSize = 96 } = {}) {
  const object3D = new THREE.Group();
  const geometry = new THREE.BoxGeometry(0.16, 0.16, 2.4);
  const materials = {
    player: new THREE.MeshBasicMaterial({ color: 0x00d5df, transparent: true, opacity: 0.95 }),
    enemy: new THREE.MeshBasicMaterial({ color: 0xff3b30, transparent: true, opacity: 0.95 })
  };
  const projectiles = Array.from({ length: poolSize }, (_, index) => {
    const mesh = new THREE.Mesh(geometry, materials.player);
    mesh.visible = false;
    mesh.userData.index = index;
    object3D.add(mesh);
    return {
      id: `laser-${index}`,
      mesh,
      active: false,
      team: "player",
      velocity: new THREE.Vector3(),
      damage: 0,
      ttl: 0,
      age: 0
    };
  });

  const fire = (spec) => {
    const projectile = projectiles.find((item) => !item.active) || projectiles.reduce((oldest, item) => item.age > oldest.age ? item : oldest, projectiles[0]);
    projectile.active = true;
    projectile.team = spec.team || "player";
    projectile.mesh.material = materials[projectile.team] || materials.player;
    projectile.mesh.visible = true;
    projectile.mesh.position.copy(spec.origin);
    direction.copy(spec.direction).normalize();
    projectile.mesh.quaternion.setFromUnitVectors(FORWARD, direction);
    projectile.velocity.copy(direction).multiplyScalar(spec.speed || 500);
    projectile.damage = Number(spec.damage) || 1;
    projectile.ttl = Number(spec.ttl) || 1.5;
    projectile.age = 0;
    return projectile;
  };

  const reset = () => {
    projectiles.forEach((projectile) => {
      projectile.active = false;
      projectile.mesh.visible = false;
      projectile.age = 0;
    });
  };

  const update = (dt, colliders, onHit = () => {}) => {
    projectiles.forEach((projectile) => {
      if (!projectile.active) return;
      projectile.age += dt;
      projectile.ttl -= dt;
      projectile.mesh.position.addScaledVector(projectile.velocity, dt);
      const hit = colliders.find((collider) => {
        distance.copy(collider.center).sub(projectile.mesh.position);
        return distance.lengthSq() <= (collider.radius + 0.7) ** 2;
      });
      if (hit) {
        const position = projectile.mesh.position.clone();
        projectile.active = false;
        projectile.mesh.visible = false;
        onHit({ laser: projectile, collider: hit, position });
        return;
      }
      if (projectile.ttl <= 0 || projectile.mesh.position.lengthSq() > 6400 * 6400) {
        projectile.active = false;
        projectile.mesh.visible = false;
      }
    });
  };

  return {
    object3D,
    fire,
    reset,
    update,
    getActiveCount: () => projectiles.reduce((count, item) => count + Number(item.active), 0),
    dispose() {
      reset();
      geometry.dispose();
      Object.values(materials).forEach((material) => material.dispose());
    }
  };
}
