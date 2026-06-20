export function createMemoryCache({ maxEntries = 60, ttlMs = 1000 * 60 * 30 } = {}) {
  const store = new Map();

  return {
    get(key) {
      const cached = store.get(key);

      if (!cached) {
        return undefined;
      }

      if (Date.now() > cached.expiresAt) {
        store.delete(key);
        return undefined;
      }

      return cached.value;
    },

    set(key, value) {
      store.set(key, {
        value,
        expiresAt: Date.now() + ttlMs
      });

      while (store.size > maxEntries) {
        store.delete(store.keys().next().value);
      }

      return value;
    },

    getOrCreate(key, createValue) {
      const cached = this.get(key);

      if (cached !== undefined) {
        return cached;
      }

      return this.set(key, createValue());
    }
  };
}
