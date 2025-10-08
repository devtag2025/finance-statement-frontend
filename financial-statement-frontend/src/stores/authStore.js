import { create } from 'zustand';
import { api } from '@/lib/api';

const STORAGE_KEY = 'fs_auth_v1';

function save(partial) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(partial)); } catch {} }
function load() { try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : null; } catch { return null; } }

export const useAuthStore = create((set, get) => ({
  hydrated: false,
  loading: false,
  accessToken: null,
  refreshToken: null,
  user: null, // {_id, name, email, subscriptionStatus, planKey, ...}
  sub: { status: null, planKey: null, remainingExports: null, cap: null },

  hydrate() {
    const s = load();
    if (s) set({ ...s, hydrated: true }); else set({ hydrated: true });
  },

  async register({ name, email, password }) {
    set({ loading: true });
    try {
      const data = await api('/auth/register', { method: 'POST', body: { name, email, password } });
      const access = data.tokens?.access?.token;
      const refresh = data.tokens?.refresh?.token;
      if (access && refresh) {
        const next = { accessToken: access, refreshToken: refresh, user: data.user, sub: get().sub };
        set(next); save(next);
        await get().refreshSubscription().catch(() => {});
      }
      return data;
    } finally { set({ loading: false }); }
  },

  async login({ email, password }) {
    set({ loading: true });
    try {
      const data = await api('/auth/login', { method: 'POST', body: { email, password } });
      const access = data.tokens?.access?.token;
      const refresh = data.tokens?.refresh?.token;
      const next = { accessToken: access, refreshToken: refresh, user: data.user, sub: get().sub };
      set(next); save(next);
      await get().refreshSubscription().catch(() => {});
      return data;
    } finally { set({ loading: false }); }
  },

  async tryRefresh() {
    const { refreshToken } = get();
    if (!refreshToken) return false;
    try {
      const data = await api('/auth/refresh-tokens', { method: 'POST', body: { refreshToken } });
      const access = data.access?.token || data.tokens?.access?.token;
      const refresh = data.refresh?.token || data.tokens?.refresh?.token || refreshToken;
      const next = { ...get(), accessToken: access, refreshToken: refresh };
      set(next); save(next);
      return true;
    } catch { return false; }
  },

  logout() {
    const { refreshToken } = get();
    // best-effort server logout
    if (refreshToken) api('/auth/logout', { method: 'POST', body: { refreshToken } }).catch(() => {});
    const cleared = { accessToken: null, refreshToken: null, user: null, sub: { status: null, planKey: null, remainingExports: null, cap: null } };
    set(cleared); save(cleared);
  },

  async me() {
    const { accessToken } = get();
    if (!accessToken) return null;
    const data = await api('/users/me', { token: accessToken }); // or /auth/me if you add it
    const user = data.user || data;
    set({ user }); save({ ...get(), user });
    return user;
  },

  async refreshSubscription() {
    const { accessToken } = get();
    if (!accessToken) return null;
    // implement this endpoint in backend; until then set from user fields if present
    try {
      const data = await api('/subscription', { token: accessToken });
      set({ sub: data }); save({ ...get(), sub: data });
      return data;
    } catch {
      // fallback from user doc if it includes subscriptionStatus/planKey
      const u = get().user || {};
      const fallback = { status: u.subscriptionStatus ?? null, planKey: u.planKey ?? null, remainingExports: null, cap: null };
      set({ sub: fallback }); save({ ...get(), sub: fallback });
      return fallback;
    }
  },

  markExportUsed() {
    const s = get().sub || {};
    if (typeof s.remainingExports === 'number') {
      const next = { ...s, remainingExports: Math.max(0, s.remainingExports - 1) };
      set({ sub: next }); save({ ...get(), sub: next });
    }
  },

  canExport() {
    const { user, sub } = get();
    const status = sub?.status ?? user?.subscriptionStatus;
    const active = status === 'active' || status === 'trialing';
    const within = sub?.remainingExports == null ? true : sub.remainingExports > 0;
    return Boolean(active && within);
  },
}));
