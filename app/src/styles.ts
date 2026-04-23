import type { CSSProperties } from "react";

const BLUE = "#2563eb";
const GREEN = "#16a34a";
const ORANGE = "#d97706";
const RED = "#dc2626";
const GRAY_BLUE = "#6366f1";

export const s: Record<string, CSSProperties> = {
  // Layout
  app: { display: "flex", flexDirection: "column", minHeight: "100vh", background: "#f4f6f9" },
  header: { background: "#1a1a2e", color: "#fff", padding: "20px 32px", boxShadow: "0 2px 8px rgba(0,0,0,0.2)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" },
  body: { display: "flex", flex: 1 },
  leftPanel: { display: "flex", flexDirection: "column", flex: 1, minWidth: 0 },
  logo: { fontSize: 22, fontWeight: 800, letterSpacing: -0.5, whiteSpace: "nowrap" },
  logoSub: { fontSize: 12, color: "#8888aa", fontWeight: 400 },
  headerRight: { marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 },
  activeDsBadge: { fontSize: 13, color: "#93c5fd", fontWeight: 500 },
  headerBtn: { background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, padding: "8px 14px", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  headerBtnPrimary: { background: "#2563eb", border: "none", borderRadius: 8, padding: "8px 16px", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" },

  // Search row
  searchRow: { display: "flex", alignItems: "center", gap: 12, padding: "14px 32px" },
  searchBar: { position: "relative", width: "33%" },
  searchInput: { width: "100%", padding: "10px 16px 10px 40px", borderRadius: 10, border: "1.5px solid #d1d5db", fontSize: 15, background: "rgba(255,255,255,0.9)", color: "#1a1a2e", outline: "none", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  searchIcon: { position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 15, pointerEvents: "none", color: "#9ca3af" },
  main: { flex: 1, padding: 32, overflowY: "auto" as const },
  sidebar: { width: 270, background: "#fff", borderLeft: "1px solid #e5e7eb", padding: 20, display: "flex", flexDirection: "column", gap: 12, flexShrink: 0 },

  // Sidebar
  sidebarHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  refreshBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 26, color: "#6b7280", padding: "2px 4px", lineHeight: 1 },
  uploadBtnSidebar: { background: "none", border: "1.5px solid #d1d5db", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontWeight: 600, fontSize: 13, color: "#374151", textAlign: "left" as const },
  uploadBtnDisabled: { opacity: 0.4, cursor: "not-allowed" },
  searchInputDisabled: { opacity: 0.5, cursor: "not-allowed", background: "#f3f4f6" },
  docList: { display: "flex", flexDirection: "column", gap: 6, marginTop: 4 },
  docItem: { display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid #f0f0f0" },

  // Badges
  badgeIndexed: { background: "#dcfce7", color: GREEN, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, whiteSpace: "nowrap" as const },
  badgePending: { background: "#fef9c3", color: ORANGE, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, whiteSpace: "nowrap" as const },
  badgeUpdating: { background: "#eff6ff", color: GRAY_BLUE, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, whiteSpace: "nowrap" as const },
  badgeUnknown: { background: "#f3f4f6", color: "#9ca3af", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20 },

  // Results
  emptyState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300, textAlign: "center" as const },
  resultsCount: { color: "#6b7280", fontSize: 14, marginBottom: 20 },
  resultCard: { background: "#fff", borderRadius: 12, padding: "18px 22px", marginBottom: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", borderLeft: `4px solid ${BLUE}` },
  resultTitle: { fontSize: 17, fontWeight: 700, color: BLUE, textDecoration: "none", display: "block", marginBottom: 4 },
  resultUrl: { fontSize: 12, color: "#9ca3af", marginBottom: 8 },
  resultSnippet: { fontSize: 14, color: "#374151", lineHeight: 1.6 },

  // Modal
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal: { background: "#fff", borderRadius: 16, padding: 32, width: 480, maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  closeBtn: { background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#6b7280", padding: "4px 8px" },
  dropzone: { border: "2px dashed #d1d5db", borderRadius: 12, padding: "48px 24px", textAlign: "center" as const, cursor: "pointer", transition: "all 0.2s", marginBottom: 20 },
  dropzoneActive: { borderColor: BLUE, background: "#eff6ff" },
  dropzoneSelected: { borderColor: GREEN, background: "#f0fdf4", cursor: "default" },
  message: { borderRadius: 8, padding: "12px 16px", marginBottom: 16, fontSize: 14, fontWeight: 500 },
  messageSuccess: { background: "#dcfce7", color: GREEN },
  messageError: { background: "#fee2e2", color: RED },
  btnPrimary: { background: BLUE, color: "#fff", border: "none", borderRadius: 8, padding: "12px 24px", cursor: "pointer", fontWeight: 600, fontSize: 15, flex: 1 },
  btnSecondary: { background: "#f3f4f6", color: "#374151", border: "none", borderRadius: 8, padding: "12px 24px", cursor: "pointer", fontWeight: 600, fontSize: 15, flex: 1 },

  // Datasource list
  formGroup: { marginBottom: 16 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 },
  formInput: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #d1d5db", fontSize: 14, outline: "none", background: "#f9fafb" },
  dsItem: { background: "#f9fafb", border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "14px 16px", cursor: "pointer", textAlign: "left" as const, position: "relative" as const, width: "100%" },
  dsItemActive: { border: "1.5px solid #2563eb" },
  activeTag: { position: "absolute" as const, top: 12, right: 12, background: "#2563eb", color: "#fff", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20 },

  // Spinner
  spinner: { display: "flex", flexDirection: "column", alignItems: "center" },
  spinnerCircle: { width: 36, height: 36, border: "3px solid #e5e7eb", borderTop: `3px solid ${BLUE}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" },
};
