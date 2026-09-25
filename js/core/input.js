import { APP_CONFIG } from "../config.js";

const ACTION_KEYS = {
  ArrowUp: "pitchUp",
  ArrowDown: "pitchDown",
  ArrowLeft: "rollLeft",
  ArrowRight: "rollRight",
  KeyA: "yawLeft",
  KeyD: "yawRight",
  KeyQ: "rollLeft",
  KeyE: "rollRight",
  KeyW: "throttleUp",
  KeyS: "throttleDown",
  ShiftLeft: "boost",
  ShiftRight: "boost",
  KeyF: "fire",
  Space: "dock",
  KeyG: "galaxy"
};

export function createInput({ canvas, onPause = () => {} } = {}) {
  const keys = new Set();
  const pressed = new Set();
  let enabled = false;
  let disposed = false;
  let mouseDeltaX = 0;
  let mouseDeltaY = 0;

  const onKeyDown = (event) => {
    if (event.code === "Escape") {
      event.preventDefault();
      onPause();
      return;
    }
    if (!enabled) return;
    const action = ACTION_KEYS[event.code];
    if (action) {
      event.preventDefault();
      keys.add(action);
      if (!event.repeat) pressed.add(action);
    }
  };
  const onKeyUp = (event) => {
    keys.delete(ACTION_KEYS[event.code]);
  };
  const onMouseMove = (event) => {
    if (!enabled || document.pointerLockElement !== canvas) return;
    mouseDeltaX += event.movementX;
    mouseDeltaY += event.movementY;
  };
  const onMouseDown = (event) => {
    if (!enabled || event.button !== 0) return;
    event.preventDefault();
    if (document.pointerLockElement !== canvas && canvas.requestPointerLock) {
      canvas.requestPointerLock();
    }
    pressed.add("fire");
  };
  const onMouseUp = (event) => {
    if (event.button === 0) keys.delete("fire");
  };
  const onBlur = () => {
    keys.clear();
    pressed.clear();
  };
  const onContextMenu = (event) => {
    if (enabled) event.preventDefault();
  };

  window.addEventListener("keydown", onKeyDown, { passive: false });
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", onBlur);
  document.addEventListener("mousemove", onMouseMove);
  canvas.addEventListener("mousedown", onMouseDown, { passive: false });
  window.addEventListener("mouseup", onMouseUp);
  canvas.addEventListener("contextmenu", onContextMenu);

  const axis = (positive, negative) => Number(keys.has(positive)) - Number(keys.has(negative));

  return {
    setEnabled(nextEnabled) {
      enabled = Boolean(nextEnabled);
      if (!enabled) onBlur();
      if (!enabled && document.pointerLockElement === canvas) document.exitPointerLock();
    },
    isEnabled: () => enabled,
    sample() {
      if (!enabled) return { pitch: 0, yaw: 0, roll: 0, throttle: 0, boost: false, fire: false };
      const result = {
        pitch: axis("pitchDown", "pitchUp") - mouseDeltaY * APP_CONFIG.flight.mouseSensitivity,
        yaw: axis("yawLeft", "yawRight") - mouseDeltaX * APP_CONFIG.flight.mouseSensitivity,
        roll: axis("rollLeft", "rollRight"),
        throttle: axis("throttleUp", "throttleDown"),
        boost: keys.has("boost"),
        fire: keys.has("fire")
      };
      mouseDeltaX = 0;
      mouseDeltaY = 0;
      return result;
    },
    consumePressed(action) {
      const active = pressed.has(action);
      pressed.delete(action);
      return active;
    },
    consumeMouseDelta() {
      const delta = { x: mouseDeltaX, y: mouseDeltaY };
      mouseDeltaX = 0;
      mouseDeltaY = 0;
      return delta;
    },
    releasePointer() {
      if (document.pointerLockElement === canvas) document.exitPointerLock();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("contextmenu", onContextMenu);
      onBlur();
    }
  };
}
