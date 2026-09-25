import * as THREE from "three";
import { APP_CONFIG } from "../config.js";

export function createRenderContext(canvas, options = {}) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: false,
    powerPreference: "high-performance"
  });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    options.fieldOfView || APP_CONFIG.renderer.fieldOfView,
    1,
    options.near || APP_CONFIG.renderer.near,
    options.far || APP_CONFIG.renderer.far
  );
  const projection = new THREE.Vector3();
  const resizeScale = options.resolutionScale || APP_CONFIG.renderer.resolutionScale;
  let visible = true;
  let disposed = false;

  scene.background = new THREE.Color(options.background ?? APP_CONFIG.renderer.background);
  scene.fog = new THREE.Fog(options.background ?? APP_CONFIG.renderer.background, APP_CONFIG.renderer.fogNear, APP_CONFIG.renderer.fogFar);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = false;

  const resize = () => {
    if (disposed) return;
    const bounds = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.floor(bounds.width * resizeScale));
    const height = Math.max(1, Math.floor(bounds.height * resizeScale));
    camera.aspect = Math.max(1, bounds.width / Math.max(1, bounds.height));
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  };

  const observer = typeof ResizeObserver === "function" ? new ResizeObserver(resize) : null;
  observer?.observe(canvas);
  window.addEventListener("resize", resize);
  resize();
  setVisible(false);

  function setCameraPose(position, quaternion, fieldOfView) {
    camera.position.copy(position);
    camera.quaternion.copy(quaternion);
    camera.updateMatrixWorld();
    if (fieldOfView && fieldOfView !== camera.fov) {
      camera.fov = fieldOfView;
      camera.updateProjectionMatrix();
    }
  }

  function setVisible(nextVisible) {
    visible = Boolean(nextVisible);
    canvas.classList.toggle("is-hidden", !visible);
    canvas.setAttribute("aria-hidden", String(!visible));
  }

  function project(position) {
    projection.copy(position).project(camera);
    if (projection.z < -1 || projection.z > 1) return null;
    return {
      x: (projection.x * 0.5 + 0.5) * 100,
      y: (-projection.y * 0.5 + 0.5) * 100
    };
  }

  return {
    scene,
    render: () => {
      if (visible && !disposed) renderer.render(scene, camera);
    },
    setCameraPose,
    setVisible,
    project,
    resize,
    dispose() {
      if (disposed) return;
      disposed = true;
      observer?.disconnect();
      window.removeEventListener("resize", resize);
      renderer.dispose();
    }
  };
}
