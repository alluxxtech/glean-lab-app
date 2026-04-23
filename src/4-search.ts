import "dotenv/config";

const clientToken = process.env.GLEAN_CLIENT_TOKEN;
const instance = process.env.GLEAN_INSTANCE ?? "support-lab";

if (!clientToken) {
  throw new Error("GLEAN_CLIENT_TOKEN is not set in .env");
}

const BASE_URL = `https://${instance}-be.glean.com/rest/api/v1`;

const QUERY = process.argv[2] ?? "serhii capgemini";

interface SearchResult {
  title?: string;
  url?: string;
  snippets?: { text?: string }[];
}

interface SearchResponse {
  results?: SearchResult[];
}

async function main() {
  console.log(`Searching for: "${QUERY}"\n`);

  const res = await fetch(`${BASE_URL}/search`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${clientToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: QUERY,
      pageSize: 5,
      datasourceFilter: "capgeminiSerhiiDevLab",
    }),
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(`[${res.status}] Search failed:\n${text}`);
  }

  const data = JSON.parse(text) as SearchResponse;
  const results = data.results ?? [];

  if (results.length === 0) {
    console.log("No results found. Try a different query or wait a few more minutes.");
    return;
  }

  console.log(`Found ${results.length} result(s):\n`);
  for (const r of results) {
    console.log(`  Title:   ${r.title ?? "—"}`);
    console.log(`  URL:     ${r.url ?? "—"}`);
    const snippet = r.snippets?.[0]?.text;
    if (snippet) console.log(`  Snippet: ${snippet.slice(0, 120)}...`);
    console.log();
  }
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
