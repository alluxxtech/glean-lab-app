import { s } from "../styles";

interface Result {
  title?: string;
  url?: string;
  snippets?: { text?: string }[];
}

interface Props {
  results: Result[];
  query: string;
  loading: boolean;
  placeholder: boolean;
  noDatasource: boolean;
}

export default function SearchResults({ results, query, loading, placeholder, noDatasource }: Props) {
  if (noDatasource) return (
    <div style={s.emptyState}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📂</div>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>No datasource selected</div>
      <div style={{ color: "#999", fontSize: 14 }}>Create or switch to a datasource to get started</div>
    </div>
  );

  if (!query) return (
    <div style={s.emptyState}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
      <div style={{ color: "#999" }}>Enter a search query above</div>
    </div>
  );

  if (loading) return (
    <div style={s.emptyState}>
      <div style={s.spinner}>
        <div style={s.spinnerCircle} />
      </div>
      <div style={{ color: "#999", marginTop: 16 }}>Searching...</div>
    </div>
  );

  if (placeholder) return (
    <div style={s.emptyState}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔑</div>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Client API token not configured</div>
      <div style={{ color: "#999", fontSize: 14 }}>Add GLEAN_CLIENT_TOKEN to .env to enable search</div>
    </div>
  );

  if (results.length === 0) return (
    <div style={s.emptyState}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>😶</div>
      <div style={{ color: "#999" }}>No results for "{query}"</div>
    </div>
  );

  return (
    <div>
      <div style={s.resultsCount}>{results.length} result(s) for "{query}"</div>
      {results.map((r, i) => (
        <div key={r.url ?? `${r.title}-${i}`} style={s.resultCard}>
          <a href={r.url ?? "#"} target="_blank" rel="noreferrer" style={s.resultTitle}>
            {r.title ?? "Untitled"}
          </a>
          {r.url && <div style={s.resultUrl}>{r.url}</div>}
          {r.snippets?.[0]?.text && (
            <div style={s.resultSnippet}>{r.snippets[0].text}</div>
          )}
        </div>
      ))}
    </div>
  );
}
