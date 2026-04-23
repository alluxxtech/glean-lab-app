import "dotenv/config";

const token = process.env.GLEAN_INDEXING_TOKEN;
const instance = process.env.GLEAN_INSTANCE ?? "support-lab";

if (!token) {
  throw new Error("GLEAN_INDEXING_TOKEN is not set in .env");
}

export const BASE_URL = `https://${instance}-be.glean.com/api/index/v1`;

export async function gleanPost(path: string, body: unknown): Promise<unknown> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(`[${res.status}] ${path} failed:\n${text}`);
  }

  return text ? JSON.parse(text) : null;
}
