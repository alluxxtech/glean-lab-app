# Glean Lab App

A React + TypeScript UI for managing custom Glean datasources — upload documents, monitor indexing status, and search via the Glean API.

## Prerequisites

- Node.js 18+
- A Glean instance with API access

---

## Step 1 — Get your API tokens

You need an **Indexing API token** to upload documents and manage datasources.

1. Go to your Glean **Admin Console**
2. Navigate to `Administration → Developer → API Tokens → Indexing tokens`
3. Create a new token and copy it

> **Note:** Creating API tokens requires at minimum the **Setup Admin** role.
> For search functionality, a separate **Client API token** is needed (`Administration → Developer → API Tokens → Client API tokens`, scope: `SEARCH`).

---

## Step 2 — Configure environment

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
GLEAN_INSTANCE=your-instance-name     # e.g. "acme" for acme-be.glean.com
GLEAN_INDEXING_TOKEN=your-token-here
GLEAN_CLIENT_TOKEN=                   # optional, needed for search
```

---

## Step 3 — Install dependencies and start the app

```bash
npm install
cd app && npm install && cd ..
npm run dev
```

This starts:

- **API server** on `http://localhost:3001`
- **UI** on `http://localhost:3006`

Open `http://localhost:3006` in your browser.

---

## Step 4 — Create a datasource

In the UI header click **+ Create Datasource** and fill in the form:

- **Name** — alphanumeric only, no dashes or spaces (e.g. `myDatasource`)
- **Display Name** — human-readable label
- **URL Regex** — pattern that document URLs must match (e.g. `^https://my-domain\.internal/.*`)
- **Category** — usually `PUBLISHED_CONTENT`

Alternatively, use the CLI script:

```bash
npm run 1:setup
```

---

## Step 5 — Publish the datasource in Glean Admin Console

After creating a datasource, it must be published before upload and search become available:

1. Go to **Admin Console → Platform → Data sources**
2. Find your datasource
3. Click **Publish**

> The UI shows a **"Not published"** badge and disables upload and search until the datasource is published.

---

## Step 6 — Upload documents

Once the datasource shows a **"Published"** badge, click **📤 Upload File** in the sidebar and select your file. Supported formats: JSON, CSV, TXT, MD.

**JSON format example:**

```json
[
  {
    "id": "doc-001",
    "title": "Document Title",
    "body": "Document content...",
    "author": "user@company.com",
    "url": "https://your-domain.internal/docs/doc-001"
  }
]
```

> **Note:** The document `url` must match the datasource's URL regex pattern.

---

## Step 7 — Check indexing status

After uploading, the sidebar shows per-document indexing status. Click **⟳** to refresh. Documents typically appear as `Indexed` within 2–5 minutes.

Status values:

- **Indexed** — document is indexed and searchable
- **Pending** — document uploaded, indexing in progress
- **Updating** — status check in progress
- **Error** — something went wrong

Welcome! :)
