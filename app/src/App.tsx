import { useEffect, useRef, useState } from "react";
import SearchResults from "./components/SearchResults";
import DocumentStatus from "./components/DocumentStatus";
import UploadModal from "./components/UploadModal";
import CreateDatasourceModal from "./components/CreateDatasourceModal";
import SwitchDatasourceModal from "./components/SwitchDatasourceModal";
import { s } from "./styles";

interface SearchResult {
  title?: string;
  url?: string;
  snippets?: { text?: string }[];
}

interface Datasource {
  name: string;
  displayName: string;
  category: string;
  createdAt: string;
}

function VisibilityBadge({ visibility }: { visibility: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    ENABLED_FOR_ALL:        { label: "Published", color: "#16a34a", bg: "#dcfce7" },
    ENABLED_FOR_TEST_GROUP: { label: "Test only",  color: "#d97706", bg: "#fef9c3" },
    NOT_ENABLED:            { label: "Not published", color: "#dc2626", bg: "#fee2e2" },
  };
  const style = map[visibility] ?? { label: visibility, color: "#6b7280", bg: "#f3f4f6" };
  return (
    <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: style.bg, color: style.color }}>
      {style.label}
    </span>
  );
}

export default function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [placeholder, setPlaceholder] = useState(false);

  const [datasources, setDatasources] = useState<Datasource[]>([]);
  const [activeDatasource, setActiveDatasource] = useState<string | null>(() =>
    localStorage.getItem("activeDatasource"),
  );

  const [dsVisibility, setDsVisibility] = useState<string | null>(null);

  const [showUpload, setShowUpload] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showSwitch, setShowSwitch] = useState(false);
  const [docIds, setDocIds] = useState<Record<string, string[]>>({});

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const abortRef = useRef<AbortController>();

  useEffect(() => {
    fetch("/api/datasources")
      .then((r) => r.json())
      .then((list: Datasource[]) => {
        setDatasources(list);
        const saved = localStorage.getItem("activeDatasource");
        if (saved && list.find((d) => d.name === saved)) {
          // valid saved selection — keep it
        } else if (list.length > 0) {
          selectDatasource(list[0].name);
        } else {
          setActiveDatasource(null);
          localStorage.removeItem("activeDatasource");
        }
      });
  }, []);

  useEffect(() => {
    if (!activeDatasource) return;
    fetch(`/api/documents?datasource=${activeDatasource}`)
      .then((r) => r.json())
      .then((ids: string[]) => setDocIds((prev) => ({ ...prev, [activeDatasource]: ids })));

    setDsVisibility(null);
    fetch(`/api/datasources/${activeDatasource}/status`)
      .then((r) => r.json())
      .then((data: { visibility: string }) => setDsVisibility(data.visibility));
  }, [activeDatasource]);

  useEffect(() => {
    if (!query.trim() || !activeDatasource) {
      setResults([]);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 500);
    return () => {
      clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, [query, activeDatasource]);

  async function search(q: string) {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setSearching(true);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, datasource: activeDatasource }),
        signal: controller.signal,
      });
      const data = await res.json();
      setPlaceholder(!!data.placeholder);
      setResults(data.results ?? []);
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setResults([]);
      }
    } finally {
      if (!controller.signal.aborted) setSearching(false);
    }
  }

  function selectDatasource(name: string) {
    setActiveDatasource(name);
    localStorage.setItem("activeDatasource", name);
  }

  function handleCreated(name: string, displayName: string) {
    const newDs: Datasource = { name, displayName, category: "PUBLISHED_CONTENT", createdAt: new Date().toISOString() };
    setDatasources((prev) => [...prev.filter((d) => d.name !== name), newDs]);
    selectDatasource(name);
  }

  function handleSelect(name: string) {
    selectDatasource(name);
    setQuery("");
    setResults([]);
  }

  function handleUploaded(ids: string[]) {
    if (!activeDatasource) return;
    setDocIds((prev) => ({
      ...prev,
      [activeDatasource]: [...new Set([...(prev[activeDatasource] ?? []), ...ids])],
    }));
  }

  const activeDisplayName = datasources.find((d) => d.name === activeDatasource)?.displayName ?? activeDatasource;
  const isPublished = dsVisibility === "ENABLED_FOR_ALL" || dsVisibility === "ENABLED_FOR_TEST_GROUP";

  return (
    <div style={s.app}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <header style={s.header}>
        <div>
          <div style={s.logo}>Capgemini Serhii Glean Lab</div>
          <div style={s.logoSub}>Powered by Glean</div>
        </div>
        <div style={s.headerRight}>
          {activeDatasource && (
            <span style={{ ...s.activeDsBadge, marginRight: 24 }}>
              📂 {activeDisplayName}
              {dsVisibility && <VisibilityBadge visibility={dsVisibility} />}
            </span>
          )}
          <button
            style={{ ...s.headerBtn, ...(!activeDatasource ? { opacity: 0.4, cursor: "not-allowed" } : {}) }}
            onClick={() => activeDatasource && setShowSwitch(true)}
            disabled={!activeDatasource}
          >
            ⇄ Switch
          </button>
          <button style={s.headerBtnPrimary} onClick={() => setShowCreate(true)}>
            + Create Datasource
          </button>
        </div>
      </header>

      <div style={s.body}>
        <div style={s.leftPanel}>
          <div style={s.searchRow}>
            <div style={s.searchBar}>
              <span style={s.searchIcon}>🔍</span>
              <input
                style={{ ...s.searchInput, ...(!activeDatasource || !isPublished ? s.searchInputDisabled : {}) }}
                type="text"
                placeholder={!activeDatasource ? "Select a datasource to search" : !isPublished ? "Datasource is not published" : "Search documents..."}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={!activeDatasource || !isPublished}
                autoFocus
              />
            </div>
          </div>
          <main style={s.main}>
            <SearchResults
              results={results}
              query={query}
              loading={searching}
              placeholder={placeholder}
              noDatasource={!activeDatasource}
            />
          </main>
        </div>

        <DocumentStatus
          docIds={activeDatasource ? docIds[activeDatasource] ?? [] : []}
          datasource={activeDatasource}
          onUploadClick={() => activeDatasource && isPublished && setShowUpload(true)}
          disabled={!activeDatasource || !isPublished}
        />
      </div>

      {showUpload && activeDatasource && (
        <UploadModal datasource={activeDatasource} onClose={() => setShowUpload(false)} onUploaded={handleUploaded} />
      )}

      {showCreate && <CreateDatasourceModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />}

      {showSwitch && (
        <SwitchDatasourceModal
          datasources={datasources}
          active={activeDatasource}
          onSelect={handleSelect}
          onClose={() => setShowSwitch(false)}
        />
      )}
    </div>
  );
}
