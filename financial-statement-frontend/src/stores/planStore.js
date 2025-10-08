// src/stores/usePlansStore.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'


function headers(token) {
  const h= { 'Content-Type': 'application/json' }
  if (token) h.Authorization = `Bearer ${token}`
  return h
}

export const usePlansStore = create()(
  devtools((set, get) => ({
    plans: [],
    status: 'idle',
    apiBaseUrl: '/api/v1/plans', // <-- adjust if your mount path differs
    setAuthToken: (authToken) => set({ authToken }),
    setApiBaseUrl: (apiBaseUrl) => set({ apiBaseUrl }),
    selectPlan: (selectedPlanId) => set({ selectedPlanId }),

    fetchPlans: async () => {
      const { apiBaseUrl, authToken } = get()
      set({ status: 'loading', error: undefined })
      try {
        const res = await fetch(`${apiBaseUrl}`, {
          method: 'GET',
          headers: headers(authToken),
        })
        if (!res.ok) throw new Error(`Failed to fetch plans (${res.status})`)
        const data = await res.json()
        // backend returns { ok: true, data: plans }
        const plans = data.data ?? data
        console.log ('Fetched plans:', plans);
        set({ plans, status: 'success' })
      } catch (e) {
        set({ status: 'error', error: e?.message || 'Failed to fetch plans' })
      }
    },

    upsertPlan: async (input) => {
      const { apiBaseUrl, authToken, plans } = get()
      set({ status: 'loading', error: undefined })
      try {
        const res = await fetch(`${apiBaseUrl}/post`, {
          method: 'POST',
          headers: headers(authToken),
          body: JSON.stringify(input),
        })
        if (!res.ok) {
          const msg = `Failed to save plan (${res.status})`
          throw new Error(msg)
        }
        const payload = await res.json()
        const saved= payload.data ?? payload

        // merge into state
        const idx = plans.findIndex(p => p._id === saved._id)
        const next = idx >= 0 ? [...plans.slice(0, idx), saved, ...plans.slice(idx + 1)] : [saved, ...plans]
        set({ plans: next, status: 'success' })
        return saved
      } catch (e) {
        set({ status: 'error', error: e?.message || 'Failed to save plan' })
        throw e
      }
    },
  }))
)
