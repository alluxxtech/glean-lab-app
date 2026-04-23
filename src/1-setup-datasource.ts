import { gleanPost } from "./client.js";

const DATASOURCE_NAME = "capgeminiSerhiiDevLab";

async function main() {
  console.log(`Creating datasource "${DATASOURCE_NAME}"...`);

  await gleanPost("/adddatasource", {
    name: DATASOURCE_NAME,
    displayName: "Capgemini Serhii Dev Lab",
    datasourceCategory: "PUBLISHED_CONTENT",
    urlRegex: "^https://serhii\\.devlab\\.capgemini\\.internal/.*",
    isUserReferencedByEmail: true,
    objectDefinitions: [
      {
        name: "Article",
        docCategory: "PUBLISHED_CONTENT",
      },
    ],
  });

  console.log("✓ Datasource created successfully!");
  console.log(
    "\nNext step: enable the datasource in Glean admin console, then run:"
  );
  console.log("  npm run 2:index");
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
