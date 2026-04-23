import "dotenv/config";
import express from "express";
import multer from "multer";
import { parse } from "csv-parse/sync";
import { randomUUID } from "crypto";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const app = express();
app.use(express.json());
app.use((_, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3006");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  next();
});

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const INDEXING_TOKEN = process.env.GLEAN_INDEXING_TOKEN;
if (!INDEXING_TOKEN) throw new Error("GLEAN_INDEXING_TOKEN is not set in .env");
const CLIENT_TOKEN = process.env.GLEAN_CLIENT_TOKEN ?? "";
const INSTANCE = process.env.GLEAN_INSTANCE ?? "support-lab";

const INDEX_BASE = `https://${INSTANCE}-be.glean.com/api/index/v1`;
const CLIENT_BASE = `https://${INSTANCE}-be.glean.com/rest/api/v1`;

const DS_FILE = resolve("data/datasources.json");
const DOCS_FILE = resolve("data/documents.json");

// Initialize empty data files if they don't exist
if (!existsSync(DS_FILE)) writeFileSync(DS_FILE, "[]");
if (!existsSync(DOCS_FILE)) writeFileSync(DOCS_FILE, "{}");

interface DatasourceRecord {
  name: string;
  displayName: string;
  urlRegex: string;
  category: string;
  createdAt: string;
}

function readDatasources(): DatasourceRecord[] {
  try { return JSON.parse(readFileSync(DS_FILE, "utf-8")); }
  catch { return []; }
}

function writeDatasources(list: DatasourceRecord[]) {
  writeFileSync(DS_FILE, JSON.stringify(list, null, 2));
}

function readDocuments(): Record<string, string[]> {
  try { return JSON.parse(readFileSync(DOCS_FILE, "utf-8")); }
  catch { return {}; }
}

function addDocumentIds(datasource: string, ids: string[]) {
  const all = readDocuments();
  const existing = new Set(all[datasource] ?? []);
  ids.forEach((id) => existing.add(id));
  all[datasource] = [...existing];
  writeFileSync(DOCS_FILE, JSON.stringify(all, null, 2));
}

async function gleanIndexPost(path: string, body: unknown) {
  const res = await fetch(`${INDEX_BASE}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${INDEXING_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`[${res.status}] ${path}: ${text}`);
  return text ? JSON.parse(text) : null;
}

// ── Datasources ───────────────────────────────────────────────────────────────

app.get("/api/datasources", (_req, res) => {
  res.json(readDatasources());
});

app.post("/api/datasources", async (req, res) => {
  const { name, displayName, urlRegex, category } = req.body as DatasourceRecord;

  if (!name || !displayName || !urlRegex || !category) {
    res.status(400).json({ error: "name, displayName, urlRegex and category are required" });
    return;
  }

  try {
    await gleanIndexPost("/adddatasource", {
      name,
      displayName,
      datasourceCategory: category,
      urlRegex,
      isUserReferencedByEmail: true,
      objectDefinitions: [{ name: "Article", docCategory: "PUBLISHED_CONTENT" }],
    });

    const list = readDatasources();
    if (!list.find((d) => d.name === name)) {
      list.push({ name, displayName, urlRegex, category, createdAt: new Date().toISOString() });
      writeDatasources(list);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ── Documents list ────────────────────────────────────────────────────────────

app.get("/api/documents", (req, res) => {
  const datasource = req.query.datasource as string;
  if (!datasource) { res.status(400).json({ error: "datasource required" }); return; }
  const all = readDocuments();
  res.json(all[datasource] ?? []);
});

// ── Search ────────────────────────────────────────────────────────────────────

app.post("/api/search", async (req, res) => {
  const { query, datasource } = req.body as { query: string; datasource: string };

  if (!CLIENT_TOKEN) { res.json({ results: [], placeholder: true }); return; }

  try {
    const response = await fetch(`${CLIENT_BASE}/search`, {
      method: "POST",
      headers: { Authorization: `Bearer ${CLIENT_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query, pageSize: 10, datasourceFilter: datasource }),
    });
    res.json(await response.json());
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ── Datasource status ─────────────────────────────────────────────────────────

app.get("/api/datasources/:name/status", async (req, res) => {
  const { name } = req.params;
  try {
    const data = await gleanIndexPost(`/debug/${name}/status`, {}) as { datasourceVisibility?: string };
    res.json({ visibility: data?.datasourceVisibility ?? "UNKNOWN" });
  } catch {
    res.json({ visibility: "UNKNOWN" });
  }
});

// ── Document status ───────────────────────────────────────────────────────────

app.post("/api/status/bulk", async (req, res) => {
  const { ids, datasource } = req.body as { ids: string[]; datasource: string };
  if (!ids?.length || !datasource) { res.status(400).json({ error: "ids and datasource required" }); return; }

  try {
    const data = await gleanIndexPost(`/debug/${datasource}/documents`, {
      debugDocuments: ids.map((id) => ({ objectType: "Article", docId: id })),
    }) as { documentStatuses?: { docId?: string; debugInfo?: { status?: { indexingStatus?: string } } }[] };

    const statuses: Record<string, string> = {};
    for (const item of data?.documentStatuses ?? []) {
      if (item.docId) statuses[item.docId] = item.debugInfo?.status?.indexingStatus ?? "UNKNOWN";
    }
    res.json(statuses);
  } catch {
    const fallback: Record<string, string> = {};
    ids.forEach((id) => { fallback[id] = "ERROR"; });
    res.json(fallback);
  }
});

// ── Upload ────────────────────────────────────────────────────────────────────

interface GleanDoc { id: string; title: string; body: string; author?: string; url?: string; }

function parseFile(filename: string, buffer: Buffer): GleanDoc[] {
  const ext = filename.split(".").pop()?.toLowerCase();
  const content = buffer.toString("utf-8");

  if (ext === "json") {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [parsed];
  }

  if (ext === "csv") {
    const rows = parse(content, { columns: true, skip_empty_lines: true }) as Record<string, string>[];
    return rows.map((row, i) => ({
      id: row.id ?? `csv-${randomUUID()}`,
      title: row.title ?? `Row ${i + 1}`,
      body: row.body ?? row.content ?? Object.values(row).join(" "),
      author: row.author,
      url: row.url,
    }));
  }

  const name = filename.replace(/\.[^/.]+$/, "");
  return [{ id: `file-${randomUUID()}`, title: name, body: content }];
}

app.post("/api/upload", upload.single("file"), async (req, res) => {
  if (!req.file) { res.status(400).json({ error: "No file provided" }); return; }

  const datasource = req.body.datasource as string;
  if (!datasource) { res.status(400).json({ error: "datasource required" }); return; }

  try {
    const docs = parseFile(req.file.originalname, req.file.buffer);
    const ds = readDatasources().find((d) => d.name === datasource);
    const baseUrl = ds?.urlRegex.replace(/\^|\\|\.\*/g, "").replace(/\/\.\*$/, "") ?? "https://uploads.internal";

    const gleanDocs = docs.map((doc) => ({
      datasource,
      objectType: "Article",
      id: doc.id,
      title: doc.title,
      body: { mimeType: "text/plain", textContent: doc.body },
      viewURL: doc.url ?? `${baseUrl}/uploads/${doc.id}`,
      ...(doc.author ? { author: { email: doc.author } } : {}),
      permissions: { allowAnonymousAccess: true },
    }));

    await gleanIndexPost("/bulkindexdocuments", {
      uploadId: randomUUID(),
      isFirstPage: true,
      isLastPage: true,
      forceRestartUpload: false,
      datasource,
      documents: gleanDocs,
    });

    const ids = docs.map((d) => d.id);
    addDocumentIds(datasource, ids);
    res.json({ success: true, count: docs.length, ids });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.listen(3001, () => {
  console.log("\n🚀 App is running!");
  console.log("   Server (API): http://localhost:3001");
  console.log("   UI:           http://localhost:3006\n");
});
