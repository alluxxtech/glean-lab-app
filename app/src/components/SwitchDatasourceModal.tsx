import { s } from "../styles";

interface Datasource {
  name: string;
  displayName: string;
  category: string;
  createdAt: string;
}

interface Props {
  datasources: Datasource[];
  active: string | null;
  onSelect: (name: string) => void;
  onClose: () => void;
}

export default function SwitchDatasourceModal({ datasources, active, onSelect, onClose }: Props) {
  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={{ ...s.modal, width: 420 }} onClick={(e) => e.stopPropagation()}>
        <div style={s.modalHeader}>
          <span style={{ fontWeight: 700, fontSize: 18 }}>Switch Datasource</span>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        {datasources.length === 0 ? (
          <div style={{ color: "#999", textAlign: "center", padding: "24px 0" }}>
            No datasources yet. Create one first.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {datasources.map((ds) => (
              <button
                key={ds.name}
                style={{ ...s.dsItem, ...(ds.name === active ? s.dsItemActive : {}) }}
                onClick={() => { onSelect(ds.name); onClose(); }}
              >
                <div style={{ fontWeight: 600, fontSize: 15 }}>{ds.displayName}</div>
                <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                  {ds.name} · {ds.category}
                </div>
                {ds.name === active && (
                  <span style={s.activeTag}>Active</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
