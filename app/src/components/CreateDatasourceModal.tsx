import { useState } from "react";
import { s } from "../styles";

interface Props {
  onClose: () => void;
  onCreated: (name: string, displayName: string) => void;
}

const CATEGORIES = [
  "PUBLISHED_CONTENT",
  "KNOWLEDGE_BASE",
  "TICKET",
  "PULL_REQUEST",
  "CODE",
];

export default function CreateDatasourceModal({ onClose, onCreated }: Props) {
  const [form, setForm] = useState({ name: "", displayName: "", urlRegex: "", category: "PUBLISHED_CONTENT" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function submit() {
    if (!form.name || !form.displayName || !form.urlRegex) {
      setError("All fields are required");
      return;
    }
    if (!/^[a-zA-Z0-9]+$/.test(form.name)) {
      setError("Name must be alphanumeric only (no spaces, dashes or underscores)");
      return;
    }

    setStatus("loading");
    setError("");

    try {
      const res = await fetch("/api/datasources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create datasource");
      setStatus("success");
      onCreated(form.name, form.displayName);
    } catch (err) {
      setStatus("error");
      setError((err as Error).message);
    }
  }

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={(e) => e.stopPropagation()}>
        <div style={s.modalHeader}>
          <span style={{ fontWeight: 700, fontSize: 18 }}>Create Datasource</span>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        {status === "success" ? (
          <div>
            <div style={{ ...s.message, ...s.messageSuccess, marginBottom: 20 }}>
              ✓ Datasource <strong>{form.displayName}</strong> created! Don't forget to Publish it in Glean Admin Console.
            </div>
            <button style={s.btnPrimary} onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <div style={s.formGroup}>
              <label style={s.label}>Name <span style={{ color: "#999", fontWeight: 400 }}>(alphanumeric only)</span></label>
              <input style={s.formInput} placeholder="myDatasource" value={form.name}
                onChange={(e) => set("name", e.target.value.replace(/[^a-zA-Z0-9]/g, ""))} />
            </div>

            <div style={s.formGroup}>
              <label style={s.label}>Display Name</label>
              <input style={s.formInput} placeholder="My Datasource" value={form.displayName}
                onChange={(e) => set("displayName", e.target.value)} />
            </div>

            <div style={s.formGroup}>
              <label style={s.label}>URL Regex</label>
              <input style={s.formInput} placeholder="^https://my-domain\.internal/.*" value={form.urlRegex}
                onChange={(e) => set("urlRegex", e.target.value)} />
            </div>

            <div style={s.formGroup}>
              <label style={s.label}>Category</label>
              <select style={s.formInput} value={form.category} onChange={(e) => set("category", e.target.value)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {error && <div style={{ ...s.message, ...s.messageError }}>{error}</div>}

            <div style={{ display: "flex", gap: 10 }}>
              <button style={s.btnSecondary} onClick={onClose}>Cancel</button>
              <button style={s.btnPrimary} onClick={submit} disabled={status === "loading"}>
                {status === "loading" ? "Creating..." : "Create"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
