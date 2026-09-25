export function createSaveGame({ storage, key, version = 1, validate = () => true, migrate = (payload) => payload } = {}) {
  const getStorage = () => {
    if (storage !== undefined) return storage;
    try {
      return window.localStorage;
    } catch {
      return null;
    }
  };

  const load = () => {
    const activeStorage = getStorage();
    if (!activeStorage) return null;
    try {
      const raw = activeStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || Number(parsed.version) > Number(version)) return null;
      const migrated = migrate(parsed);
      if (!validate(migrated)) return null;
      return migrated;
    } catch {
      return null;
    }
  };

  return {
    load,
    hasSave() {
      return Boolean(load());
    },
    save(state, resume) {
      const activeStorage = getStorage();
      const envelope = {
        version,
        savedAt: Date.now(),
        resume,
        state
      };
      if (!activeStorage) return false;
      try {
        activeStorage.setItem(key, JSON.stringify(envelope));
        return true;
      } catch {
        return false;
      }
    },
    clear() {
      const activeStorage = getStorage();
      if (!activeStorage) return false;
      try {
        activeStorage.removeItem(key);
        return true;
      } catch {
        return false;
      }
    }
  };
}
