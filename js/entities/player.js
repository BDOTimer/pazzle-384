import * as THREE from "three";
import { APP_CONFIG } from "../config.js";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const localBack = new THREE.Vector3();
const localUp = new THREE.Vector3();
const forward = new THREE.Vector3();
const target = new THREE.Vector3();

export function createPlayer({ ship, upgrades = {}, onFire = () => {} } = {}) {
  const object3D = new THREE.Group();
  const velocity = new THREE.Vector3();
  const cameraProxy = new THREE.Object3D();
  let shipState = { ...ship };
  let hull = shipState.hull;
  let shield = shipState.shield;
  let speed = 0;
  let throttle = 0.18;
  let fireCooldown = 0;
  let boundaryHit = false;
  let rollVisual = 0;

  const bodyMaterial = new THREE.MeshStandardMaterial({ color: ship.typeId === "starlight" ? 0xed2f91 : 0x00d5df, emissive: ship.typeId === "starlight" ? 0x3d0a2c : 0x003a45, emissiveIntensity: 0.55, roughness: 0.42, metalness: 0.68, flatShading: true });
  const darkMaterial = new THREE.MeshStandardMaterial({ color: 0x121722, roughness: 0.68, metalness: 0.72, flatShading: true });
  const glowMaterial = new THREE.MeshBasicMaterial({ color: 0xffe14a });
  const body = new THREE.Mesh(new THREE.ConeGeometry(1.5, 5.2, 5), bodyMaterial);
  body.rotation.x = -Math.PI * 0.5;
  object3D.add(body);
  const wing = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.36, 2.5), darkMaterial);
  wing.position.z = 0.4;
  object3D.add(wing);
  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.4, 2.2, 2), darkMaterial);
  fin.position.set(0, 0.9, 1.35);
  object3D.add(fin);
  const engineLeft = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.25), glowMaterial);
  const engineRight = engineLeft.clone();
  engineLeft.position.set(-1.7, -0.35, 1.7);
  engineRight.position.set(1.7, -0.35, 1.7);
  object3D.add(engineLeft, engineRight);
  object3D.rotation.order = "YXZ";

  const getForward = (targetVector = new THREE.Vector3()) => targetVector.set(0, 0, -1).applyQuaternion(object3D.quaternion).normalize();

  const update = (dt, input) => {
    const pitch = clamp(input.pitch || 0, -1, 1);
    const yaw = clamp(input.yaw || 0, -1, 1);
    const roll = clamp(input.roll || 0, -1, 1);
    const boost = input.boost ? APP_CONFIG.flight.boostMultiplier : 1;
    throttle = clamp(throttle + (input.throttle || 0) * 0.62 * dt, -0.22, 1);
    if (!input.throttle && Math.abs(throttle) < 0.02) throttle = 0;
    const targetSpeed = throttle * shipState.maxSpeed * boost * (throttle < 0 ? 0.38 : 1);
    const acceleration = targetSpeed > speed ? APP_CONFIG.flight.acceleration : APP_CONFIG.flight.braking;
    speed += clamp(targetSpeed - speed, -acceleration * dt, acceleration * dt);
    object3D.rotation.y += yaw * APP_CONFIG.flight.turnRate * dt;
    object3D.rotation.x = clamp(object3D.rotation.x + pitch * APP_CONFIG.flight.pitchRate * dt, -1.35, 1.35);
    object3D.rotation.z = clamp(object3D.rotation.z + roll * APP_CONFIG.flight.rollRate * dt, -Math.PI, Math.PI);
    rollVisual += (roll * 0.4 - rollVisual) * Math.min(1, dt * 8);
    getForward(forward);
    velocity.copy(forward).multiplyScalar(speed);
    object3D.position.addScaledVector(velocity, dt);
    boundaryHit = false;
    if (object3D.position.length() > APP_CONFIG.world.boundary) {
      object3D.position.setLength(APP_CONFIG.world.boundary);
      speed *= -0.24;
      boundaryHit = true;
    }
    const engineScale = 0.75 + Math.abs(speed) / Math.max(1, shipState.maxSpeed) * 1.8;
    engineLeft.scale.z = engineScale;
    engineRight.scale.z = engineScale;
    fireCooldown -= dt;
    if (input.fire && fireCooldown <= 0) {
      fireCooldown = shipState.laserCooldown;
      onFire({
        team: "player",
        origin: object3D.position.clone().addScaledVector(forward, 2.8).add(new THREE.Vector3(0, -0.35, 0)),
        direction: forward.clone(),
        speed: APP_CONFIG.flight.laserSpeed,
        damage: shipState.laserPower,
        ttl: 1.6
      });
    }
    return { boundaryHit, speed };
  };

  const getViewPose = () => {
    getForward(forward);
    localBack.set(0, 1.85, 8.8).applyQuaternion(object3D.quaternion);
    localUp.set(0, 1, 0).applyQuaternion(object3D.quaternion);
    cameraProxy.position.copy(object3D.position).add(localBack);
    cameraProxy.up.copy(localUp);
    cameraProxy.quaternion.copy(object3D.quaternion);
    target.copy(object3D.position).addScaledVector(forward, 34);
    target.y += 1.1;
    cameraProxy.lookAt(target);
    return { position: cameraProxy.position, quaternion: cameraProxy.quaternion };
  };

  return {
    object3D,
    update,
    getViewPose,
    getSnapshot() {
      return {
        position: object3D.position,
        quaternion: object3D.quaternion,
        velocity,
        speed,
        throttle,
        rollVisual
      };
    },
    getForward,
    getCollider() {
      return { id: "player", kind: "player", center: object3D.position, radius: 2.8 };
    },
    setStatus(nextShip) {
      hull = nextShip.hull;
      shield = nextShip.shield;
    },
    getStatus: () => ({ hull, shield }),
    reset(position, nextShip = shipState) {
      shipState = { ...nextShip };
      hull = shipState.hull;
      shield = shipState.shield;
      object3D.position.copy(position);
      object3D.rotation.set(0, 0, 0);
      speed = 0;
      throttle = 0.18;
      fireCooldown = 0;
      boundaryHit = false;
    },
    dispose() {
      object3D.traverse((node) => {
        if (node.geometry) node.geometry.dispose();
        if (node.material) {
          const materials = Array.isArray(node.material) ? node.material : [node.material];
          materials.forEach((material) => material.dispose());
        }
      });
    }
  };
}
