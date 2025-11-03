// Very small in-memory idempotency cache with TTL
const cache = new Map(); // key -> { createdAt, ttlMs }

const TTL_MS = 10 * 60 * 1000; // 10 minutes

function seen(key) {
  if (!key) return false;
  const hit = cache.get(key);
  if (!hit) return false;
  const fresh = Date.now() - hit.createdAt < (hit.ttlMs || TTL_MS);
  if (!fresh) {
    cache.delete(key);
    return false;
  }
  return true;
}

function remember(key, ttlMs = TTL_MS) {
  if (!key) return;
  cache.set(key, { createdAt: Date.now(), ttlMs });
  // lazy cleanup
  setTimeout(() => cache.delete(key), ttlMs + 1000).unref?.();
}

module.exports = { seen, remember };
