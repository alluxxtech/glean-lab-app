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

export default function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [placeholder, setPlaceholder] = useState(false);

  const [datasources, setDatasources] = useState<Datasource[]>([]);
  const [activeDatasource, setActiveDatasource] = useState<string | null>(() =>
    localStorage.getItem("activeDatasource"),
  );

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
        if (list.length === 1 && !localStorage.getItem("activeDatasource")) {
          selectDatasource(list[0].name);
        }
      });
  }, []);

  useEffect(() => {
    if (!activeDatasource) return;
    fetch(`/api/documents?datasource=${activeDatasource}`)
      .then((r) => r.json())
      .then((ids: string[]) => setDocIds((prev) => ({ ...prev, [activeDatasource]: ids })));
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

  return (
    <div style={s.app}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <header style={s.header}>
        <div>
          <div style={s.logo}>Capgemini Serhii Glean Lab</div>
          <div style={s.logoSub}>Powered by Glean</div>
        </div>
        <div style={s.headerRight}>
          {activeDatasource && <span style={s.activeDsBadge}>📂 {activeDisplayName}</span>}
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
                style={{ ...s.searchInput, ...(!activeDatasource ? s.searchInputDisabled : {}) }}
                type="text"
                placeholder={activeDatasource ? "Search documents..." : "Select a datasource to search"}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={!activeDatasource}
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
          onUploadClick={() => activeDatasource && setShowUpload(true)}
          disabled={!activeDatasource}
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
