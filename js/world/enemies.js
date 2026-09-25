import * as THREE from "three";

const directionToEnemy = new THREE.Vector3();
const sideToEnemy = new THREE.Vector3();
const worldUp = new THREE.Vector3(0, 1, 0);

export function createEnemies({ rng, onFire = () => {}, onDestroyed = () => {} } = {}) {
  const object3D = new THREE.Group();
  let enemySequence = 0;
  const enemies = [];
  const toPlayer = new THREE.Vector3();
  const obstacleCenter = new THREE.Vector3();

  const disposeEnemy = (enemy) => {
    const index = enemies.indexOf(enemy);
    if (index >= 0) enemies.splice(index, 1);
    object3D.remove(enemy.mesh);
    enemy.mesh.traverse((node) => {
      if (node.geometry) node.geometry.dispose();
      if (node.material) {
        const materials = Array.isArray(node.material) ? node.material : [node.material];
        materials.forEach((material) => material.dispose());
      }
    });
  };

  const createModel = (level) => {
    const group = new THREE.Group();
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: level > 2 ? 0xed2f91 : 0xff3b30, emissive: level > 2 ? 0x44102f : 0x4b0806, emissiveIntensity: 0.7, roughness: 0.45, metalness: 0.55, flatShading: true });
    const darkMaterial = new THREE.MeshStandardMaterial({ color: 0x171b25, roughness: 0.72, metalness: 0.65, flatShading: true });
    const body = new THREE.Mesh(new THREE.ConeGeometry(1.7, 5.8, 5), bodyMaterial);
    body.rotation.x = -Math.PI * 0.5;
    group.add(body);
    const wing = new THREE.Mesh(new THREE.BoxGeometry(7.5, 0.45, 2.6), darkMaterial);
    wing.position.z = 0.5;
    group.add(wing);
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.45, 2.5, 2.2), darkMaterial);
    fin.position.set(0, 1, 1.3);
    group.add(fin);
    return group;
  };

  const spawn = (count = 1, origin = new THREE.Vector3(), level = 1) => {
    for (let index = 0; index < count; index += 1) {
      const angle = rng.float(0, Math.PI * 2);
      const distance = rng.float(420, 760);
      const mesh = createModel(level);
      mesh.position.set(
        origin.x + Math.cos(angle) * distance,
        origin.y + rng.float(-180, 180),
        origin.z + Math.sin(angle) * distance
      );
      object3D.add(mesh);
      enemies.push({
        id: `pirate-${enemySequence += 1}`,
        mesh,
        hull: 16 + level * 8,
        maxHull: 16 + level * 8,
        level,
        cooldown: rng.float(0.8, 2.8),
        speed: 42 + level * 5 + rng.float(0, 12)
      });
    }
  };

  const reset = () => {
    enemies.slice().forEach(disposeEnemy);
  };

  const hit = (id, damage) => {
    const enemy = enemies.find((item) => item.id === id);
    if (!enemy) return false;
    enemy.hull -= Math.max(0, damage);
    enemy.mesh.scale.setScalar(1 + Math.min(0.35, Math.max(0, damage) * 0.012));
    if (enemy.hull > 0) return false;
    const position = enemy.mesh.getWorldPosition(new THREE.Vector3());
    disposeEnemy(enemy);
    onDestroyed(position, enemy.level);
    return true;
  };

  const update = (dt, frame, obstacles = []) => {
    const playerPosition = frame.playerPosition;
    enemies.slice().forEach((enemy) => {
      toPlayer.copy(playerPosition).sub(enemy.mesh.position);
      const distance = toPlayer.length();
      if (distance > 0.001) toPlayer.multiplyScalar(1 / distance);
      enemy.mesh.position.addScaledVector(toPlayer, enemy.speed * dt);
      sideToEnemy.crossVectors(toPlayer, worldUp).normalize();
      enemy.mesh.position.addScaledVector(sideToEnemy, Math.sin(frame.elapsed * 0.7 + enemy.level) * 7 * dt);
      enemy.mesh.rotation.y = Math.atan2(-toPlayer.x, -toPlayer.z);
      enemy.mesh.rotation.x = Math.asin(Math.max(-1, Math.min(1, toPlayer.y))) * 0.45;
      enemy.mesh.rotation.z = Math.sin(frame.elapsed * 1.2 + enemy.level) * 0.16;
      enemy.mesh.scale.lerp(new THREE.Vector3(1, 1, 1), Math.min(1, dt * 9));
      enemy.cooldown -= dt;
      if (enemy.cooldown <= 0 && distance < 920 && distance > 55) {
        onFire({
          team: "enemy",
          origin: enemy.mesh.getWorldPosition(new THREE.Vector3()).addScaledVector(toPlayer, 3),
          direction: toPlayer.clone(),
          speed: 300 + enemy.level * 18,
          damage: 5 + enemy.level * 2,
          ttl: 3
        });
        enemy.cooldown = rng.float(1.5, 3.4) / (1 + enemy.level * 0.12);
      }
      const crashed = obstacles.some((collider) => {
        obstacleCenter.copy(collider.center).sub(enemy.mesh.position);
        return obstacleCenter.lengthSq() < (collider.radius + 4) ** 2;
      });
      if (crashed) {
        const position = enemy.mesh.getWorldPosition(new THREE.Vector3());
        disposeEnemy(enemy);
        onDestroyed(position, enemy.level);
      }
    });
  };

  return {
    object3D,
    spawn,
    reset,
    hit,
    update,
    getCount: () => enemies.length,
    getColliders() {
      return enemies.map((enemy) => ({
        id: enemy.id,
        kind: "enemy",
        center: enemy.mesh.getWorldPosition(new THREE.Vector3()),
        radius: 3.6,
        level: enemy.level
      }));
    },
    getClosest(position, maxDistance = Infinity) {
      let result = null;
      let best = maxDistance;
      enemies.forEach((enemy) => {
        const center = enemy.mesh.getWorldPosition(new THREE.Vector3());
        const distance = center.distanceTo(position);
        if (distance < best) {
          best = distance;
          result = { id: enemy.id, position: center, distance };
        }
      });
      return result;
    },
    dispose() {
      reset();
    }
  };
}
