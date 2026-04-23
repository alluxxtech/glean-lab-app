import { readFileSync } from "fs";
import { randomUUID } from "crypto";
import { gleanPost } from "./client.js";

const DATASOURCE_NAME = "capgeminiSerhiiDevLab";
const UPLOAD_ID = randomUUID();

interface RawDoc {
  id: string;
  title: string;
  body: string;
  author: string;
  url: string;
}

function toGleanDocument(doc: RawDoc) {
  return {
    datasource: DATASOURCE_NAME,
    objectType: "Article",
    id: doc.id,
    title: doc.title,
    body: {
      mimeType: "text/plain",
      textContent: doc.body,
    },
    viewURL: doc.url,
    author: {
      email: doc.author,
    },
    permissions: {
      allowAnonymousAccess: true,
    },
  };
}

async function main() {
  const raw = readFileSync("data/test-docs.json", "utf-8");
  const docs: RawDoc[] = JSON.parse(raw);

  console.log(`Loaded ${docs.length} documents from data/test-docs.json`);
  console.log(`Upload ID: ${UPLOAD_ID}`);
  console.log(`Indexing into datasource "${DATASOURCE_NAME}"...\n`);

  const gleanDocs = docs.map(toGleanDocument);

  await gleanPost("/bulkindexdocuments", {
    uploadId: UPLOAD_ID,
    isFirstPage: true,
    isLastPage: true,
    forceRestartUpload: true,
    datasource: DATASOURCE_NAME,
    documents: gleanDocs,
  });

  console.log(`✓ Successfully indexed ${docs.length} documents!`);
  console.log("\nDocuments indexed:");
  docs.forEach((d) => console.log(`  - [${d.id}] ${d.title}`));
  console.log("\nWait ~2-5 minutes, then run:");
  console.log("  npm run 3:check");
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
