const JSON_HEADERS = { "Content-Type": "application/json" };

type NormalizedSale = {
  location_code: string;
  product_name: string;
  product_upc: string;
  quantity: number;
  sold_at: string;
};

export async function fetchAnalytics() {
  const res = await fetch("/api/analytics", { headers: JSON_HEADERS });
  const json = await res.json();

  if (!res.ok) throw new Error(json.message || "Failed to fetch analytics");
  return json;
}

export async function fetchUpload(normalized: NormalizedSale[]) {
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ sales: normalized }),
  });
  const json = await res.json();
  return { ...json, ok: res.ok };
}

export async function fetchLocations() {
  const res = await fetch("/api/locations", { headers: JSON_HEADERS });

  if (!res.ok) throw new Error("Failed to fetch locations");
  return res.json();
}
