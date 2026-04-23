import { gleanPost } from "./client.js";

const DATASOURCE_NAME = "capgeminiSerhiiDevLab";
const DOC_IDS = ["cgdl-001", "cgdl-002", "cgdl-003", "cgdl-004", "cgdl-005", "cgdl-006", "cgdl-007"];

interface DebugResponse {
  status?: {
    uploadStatus?: string;
    indexingStatus?: string;
    lastIndexedAt?: string;
    permissionIdentityStatus?: string;
  };
}

async function checkDocument(docId: string): Promise<void> {
  const response = (await gleanPost(
    `/debug/${DATASOURCE_NAME}/document`,
    { objectType: "Article", docId }
  )) as DebugResponse;

  const uploadStatus = response?.status?.uploadStatus ?? "UNKNOWN";
  const indexStatus = response?.status?.indexingStatus ?? "UNKNOWN";
  const indexTime = response?.status?.lastIndexedAt
    ? new Date(response.status.lastIndexedAt).toLocaleString()
    : "—";

  const icon = indexStatus === "INDEXED" ? "✓" : "⏳";
  console.log(`  ${icon} ${docId}: upload=${uploadStatus} index=${indexStatus} (at: ${indexTime})`);
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  console.log(`Checking status of ${DOC_IDS.length} documents in "${DATASOURCE_NAME}"...\n`);

  for (const docId of DOC_IDS) {
    await checkDocument(docId);
    await sleep(1100);
  }
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
