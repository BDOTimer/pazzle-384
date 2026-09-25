import * as THREE from "three";

const velocity = new THREE.Vector3();

export function createHitEffects({ rng, maxParticles = 220 } = {}) {
  const object3D = new THREE.Group();
  const geometry = new THREE.TetrahedronGeometry(0.45, 0);
  const materials = new Map();
  const particles = [];

  const getMaterial = (color) => {
    if (!materials.has(color)) materials.set(color, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 }));
    return materials.get(color);
  };

  const remove = (particle) => {
    const index = particles.indexOf(particle);
    if (index >= 0) particles.splice(index, 1);
    object3D.remove(particle.mesh);
  };

  const emit = (position, options = {}) => {
    const count = Math.min(34, Math.max(1, options.count || 10));
    const power = options.power || 16;
    const color = options.color ?? 0xffe14a;
    for (let index = 0; index < count && particles.length < maxParticles; index += 1) {
      const mesh = new THREE.Mesh(geometry, getMaterial(color));
      mesh.position.copy(position);
      const scale = rng.float(0.55, 1.65) * (options.size || 1);
      mesh.scale.setScalar(scale);
      object3D.add(mesh);
      const life = rng.float(0.28, 0.82);
      particles.push({
        mesh,
        velocity: new THREE.Vector3(rng.float(-1, 1), rng.float(-1, 1), rng.float(-1, 1)).normalize().multiplyScalar(power * rng.float(0.45, 1.25)),
        life,
        maxLife: life
      });
    }
  };

  const update = (dt) => {
    particles.slice().forEach((particle) => {
      particle.life -= dt;
      if (particle.life <= 0) {
        remove(particle);
        return;
      }
      particle.mesh.position.addScaledVector(particle.velocity, dt);
      particle.velocity.multiplyScalar(Math.max(0, 1 - dt * 2.8));
      velocity.copy(particle.velocity).normalize();
      particle.mesh.lookAt(particle.mesh.position.clone().add(velocity));
      const scale = particle.life / particle.maxLife;
      particle.mesh.scale.multiplyScalar(Math.max(0, 1 - dt * 0.5));
      particle.mesh.material.opacity = scale;
    });
  };

  const reset = () => {
    particles.slice().forEach(remove);
  };

  return {
    object3D,
    emit,
    update,
    reset,
    dispose() {
      reset();
      geometry.dispose();
      materials.forEach((material) => material.dispose());
      materials.clear();
    }
  };
}
