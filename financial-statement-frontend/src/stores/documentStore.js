// src/store/documentStore.js

import { useAuthStore } from "./authStore";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { create } from "zustand";

// use your api helper

const useDocumentStore = create((set, get) => ({
  // State
  file: null,
  uploading: false,
  parsing: false,
  calculating: false,
  exporting: false,
  pages: [],
  fields: null,
  results: null,
  error: null,

  // Setters
  setFile: (file) => set({ file }),
  clear: () =>
    set({
      file: null,
      uploading: false,
      parsing: false,
      calculating: false,
      exporting: false,
      pages: [],
      fields: null,
      results: null,
      error: null,
    }),

  // Actions
  uploadAndParse: async (file) => {
    set({
      uploading: true,
      parsing: false,
      error: null,
      pages: [],
      fields: null,
      results: null,
    });
    try {
      if (!file) throw new Error("No file selected");

      const formData = new FormData();
      formData.append("file", file);

      // Use fetch directly for FormData (api helper sets JSON headers automatically, which breaks FormData)
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000"
        }/api/v1/upload/validate`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(
          (data.reasons || [data.message || "Upload failed"]).join(", ")
        );

      set({ pages: data.pages || [] });

      // Parse pages using api helper (JSON body)
      set({ parsing: true });
      const parseData = await api("/parse", {
        method: "POST",
        body: { pages: data.pages },
      });

      if (!parseData.ok)
        throw new Error((parseData.reasons || ["Parse failed"]).join(", "));

      set({ fields: parseData.fields || [] });
    } catch (err) {
      const msg = err?.message || "Unknown error during upload/parse";
      set({ error: [msg] });
      toast.error(msg);
    } finally {
      set({ uploading: false, parsing: false });
    }
  },
  // Add inside create() store
  addField: (field) => {
    const { fields } = get();
    set({ fields: [...(fields || []), { ...field, included: true }] });
  },

  toggleFieldIncluded: (index) => {
    const { fields } = get();
    if (!fields) return;
    const newFields = fields.map((f, i) =>
      i === index ? { ...f, included: !f.included } : f
    );
    set({ fields: newFields });
  },

  removeField: (index) => {
    const { fields } = get();
    if (!fields) return;
    const newFields = fields.filter((_, i) => i !== index);
    set({ fields: newFields });
  },

  calculate: async (ruleVersion) => {
    const { fields } = get();
    if (!fields || fields.length === 0) {
      const msg = "No fields to calculate";
      set({ error: [msg] });
      toast.error(msg);
      return;
    }

    set({ calculating: true, error: null, results: null });
    try {
      const data = await api("/calc", {
        method: "POST",
        body: { fields, ruleVersion },
      });

      if (!data.ok)
        throw new Error((data.reasons || ["Calculation failed"]).join(", "));

      console.log(data.results)
      set({ results: data.results });
    } catch (err) {
      const msg = err?.message || "Unknown error during calculation";
      set({ error: [msg] });
      toast.error(msg);
    } finally {
      set({ calculating: false });
    }
  },

  exportResults: async ({
    format = "pdf",
    fileName = "financial-statement",
  }) => {
    const { fields, results } = get();
    const token = useAuthStore.getState().accessToken; // get the current user token
    if (!fields || !results) {
      const msg = "No results to export";
      set({ error: [msg] });
      toast.error(msg);
      return;
    }

    set({ exporting: true, error: null });
    try {
      const idempotencyKey = `${Date.now()}_${Math.random()
        .toString(36)
        .slice(2)}`;

      // POST JSON with token for authentication
      const blobRes = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000"
        }/api/v1/export`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fields,
            results: JSON.stringify(results),
            format,
            fileName,
            idempotencyKey,
          }),
        }
      );

      if (!blobRes.ok) {
        const data = await blobRes.json().catch(() => ({}));
        throw new Error(
          (data.reasons || [data.message || "Export failed"]).join(", ")
        );
      }

      const blob = await blobRes.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success("File exported successfully!");
    } catch (err) {
      const msg = err?.message || "Unknown error during export";
      set({ error: [msg] });
      toast.error(msg);
    } finally {
      set({ exporting: false });
    }
  },
}));

export default useDocumentStore;
