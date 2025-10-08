import { useAuthStore } from '@/stores/authStore';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000';

async function rawFetch(path, opts = {}) {
  const res = await fetch(`${API_BASE}/api/v1${path}`, opts);
  return res;
}

export async function api(path, { method = 'GET', token, body, headers } = {}) {
  const res = await rawFetch(path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && token) {
    // try refresh transparently
    const store = useAuthStore.getState();
    const refreshed = await store.tryRefresh();
    if (refreshed) {
      const retry = await rawFetch(path, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${useAuthStore.getState().accessToken}`,
          ...(headers || {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!retry.ok) throw await toError(retry);
      return retry.status === 204 ? null : retry.json();
    }
  }
  if (!res.ok) throw await toError(res);
  return res.status === 204 ? null : res.json();
}

async function toError(res) {
  const text = await res.text().catch(() => '');
  let json;
  try { json = JSON.parse(text); } catch { json = { message: text || res.statusText }; }
  const err = new Error(json.message || 'Request failed');
  err.status = res.status; err.data = json;
  return err;
}
