import "dotenv/config";
import { readFileSync } from "fs";
import { resolve } from "path";

const INDEXING_TOKEN = process.env.GLEAN_INDEXING_TOKEN!;
const INSTANCE = process.env.GLEAN_INSTANCE ?? "support-lab";
const BASE_URL = `https://${INSTANCE}-be.glean.com/api/index/v1`;

interface DatasourceRecord {
  name: string;
  displayName: string;
  urlRegex: string;
  category: string;
}

async function syncDatasource(ds: DatasourceRecord) {
  console.log(`Syncing "${ds.name}" with urlRegex: ${ds.urlRegex}`);

  const res = await fetch(`${BASE_URL}/adddatasource`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${INDEXING_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: ds.name,
      displayName: ds.displayName,
      datasourceCategory: ds.category,
      urlRegex: ds.urlRegex,
      isUserReferencedByEmail: true,
      objectDefinitions: [{ name: "Article", docCategory: "PUBLISHED_CONTENT" }],
    }),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(`[${res.status}] ${text}`);
  console.log(`  ✓ "${ds.name}" synced`);
}

async function main() {
  const list: DatasourceRecord[] = JSON.parse(
    readFileSync(resolve("data/datasources.json"), "utf-8")
  );

  for (const ds of list) {
    await syncDatasource(ds);
  }

  console.log("\nAll datasources synced!");
}

main().catch((err) => { console.error("Error:", err.message); process.exit(1); });
