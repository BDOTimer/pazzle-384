export function createScreenManager({ screens, initialId = "menu", onError = console.error } = {}) {
  const screenList = new Map(Object.entries(screens));
  const mounted = new Set();
  let active = null;
  let activeId = null;
  let paused = false;
  let elapsed = 0;
  let started = false;
  let disposed = false;

  const mount = (screen) => {
    if (!mounted.has(screen.id)) {
      screen.mount?.();
      mounted.add(screen.id);
    }
  };

  const goTo = (id, params = {}) => {
    if (disposed) return false;
    const next = screenList.get(id);
    if (!next) {
      onError(new Error(`Unknown screen: ${id}`));
      return false;
    }
    try {
      active?.exit?.(params);
      mount(next);
      next.enter?.(params);
      active = next;
      activeId = id;
      paused = false;
      return true;
    } catch (error) {
      active = null;
      activeId = null;
      onError(error);
      return false;
    }
  };

  return {
    start(id = initialId, params = {}) {
      if (started || disposed) return activeId;
      started = true;
      goTo(id, params);
      return activeId;
    },
    goTo,
    update(dt) {
      if (!active || paused || disposed) return;
      elapsed += dt;
      active.update?.(dt, elapsed);
    },
    render(alpha) {
      active?.render?.(alpha);
    },
    setPaused(value) {
      if (!active || paused === Boolean(value)) return;
      paused = Boolean(value);
      if (paused) active.pause?.();
      else active.resume?.();
    },
    isPaused: () => paused,
    getActiveId: () => activeId,
    getActiveScreen: () => active,
    dispose() {
      if (disposed) return;
      disposed = true;
      active?.exit?.();
      screenList.forEach((screen) => screen.dispose?.());
      mounted.clear();
      active = null;
      activeId = null;
    }
  };
}
