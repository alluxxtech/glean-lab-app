import { useEffect, useRef, useState } from "react";
import { s } from "../styles";

interface Props {
  docIds: string[];
  datasource: string | null;
  onUploadClick: () => void;
  disabled: boolean;
}

export default function DocumentStatus({ docIds, datasource, onUploadClick, disabled }: Props) {
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [refreshing, setRefreshing] = useState(false);
  const cancelRef = useRef<() => void>();

  async function runRefresh(ds: string, ids: string[]) {
    let cancelled = false;
    cancelRef.current = () => { cancelled = true; };

    setRefreshing(true);
    setStatuses(ids.reduce<Record<string, string>>((acc, id) => ({ ...acc, [id]: "UPDATING" }), {}));

    for (const id of ids) {
      if (cancelled) break;
      try {
        const res = await fetch(`/api/status/one?id=${encodeURIComponent(id)}&datasource=${encodeURIComponent(ds)}`);
        const data: { id: string; status: string } = await res.json();
        if (!cancelled) setStatuses((prev) => ({ ...prev, [data.id]: data.status }));
        if (!cancelled) await new Promise((r) => setTimeout(r, 1100));
      } catch {
        if (!cancelled) setStatuses((prev) => ({ ...prev, [id]: "ERROR" }));
      }
    }

    if (!cancelled) setRefreshing(false);
  }

  function refresh() {
    if (refreshing || !datasource || docIds.length === 0) return;
    cancelRef.current?.();
    runRefresh(datasource, docIds);
  }

  useEffect(() => {
    cancelRef.current?.();
    setStatuses({});
    if (datasource && docIds.length > 0) runRefresh(datasource, docIds);
    return () => cancelRef.current?.();
  }, [datasource, docIds.join(",")]);

  return (
    <aside style={s.sidebar}>
      <button
        style={{ ...s.uploadBtnSidebar, ...(disabled ? s.uploadBtnDisabled : {}) }}
        onClick={onUploadClick}
        disabled={disabled}
      >
        📤 Upload File
      </button>

      <div style={s.sidebarHeader}>
        <span style={{ fontWeight: 700, fontSize: 15 }}>Documents</span>
        <button
          style={{ ...s.refreshBtn, ...(!datasource || docIds.length === 0 ? { opacity: 0.3, cursor: "not-allowed" } : {}) }}
          onClick={refresh}
          title="Refresh"
          disabled={refreshing || !datasource || docIds.length === 0}
        >⟳</button>
      </div>

      <div style={s.docList}>
        {!datasource ? (
          <div style={{ color: "#9ca3af", fontSize: 13, paddingTop: 8 }}>Select a datasource</div>
        ) : docIds.length === 0 ? (
          <div style={{ color: "#9ca3af", fontSize: 13, paddingTop: 8 }}>No documents yet</div>
        ) : (
          docIds.map((id) => (
            <div key={id} style={s.docItem}>
              <span style={{ fontSize: 12, color: "#666", flex: 1 }}>{id}</span>
              <StatusBadge status={statuses[id]} />
            </div>
          ))
        )}
      </div>
    </aside>
  );
}

function StatusBadge({ status }: { status?: string }) {
  if (!status) return <span style={s.badgeUnknown}>—</span>;
  if (status === "INDEXED") return <span style={s.badgeIndexed}>✓ Indexed</span>;
  if (status === "NOT_INDEXED") return <span style={s.badgePending}>⏳ Pending</span>;
  if (status === "UPDATING") return <span style={s.badgeUpdating}>⟳ Updating</span>;
  if (status === "ERROR") return <span style={s.badgeUnknown}>Error</span>;
  return <span style={s.badgeUnknown}>{status}</span>;
}
