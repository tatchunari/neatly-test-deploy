// src/lib/ga4.ts
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { readFileSync } from "fs";
import path from "path";

const keyPath = path.join(process.cwd(), "ga4-access-key.json"); // points to project root
const credentials = JSON.parse(readFileSync(keyPath, "utf8"));

const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials,
});

export async function getPageViews() {
  const [response] = await analyticsDataClient.runReport({
    property: "properties/507618812",
    dateRanges: [{ startDate: "2025-01-01", endDate: "today" }],
    dimensions: [{ name: "pagePath" }],
    metrics: [{ name: "screenPageViews" }],
  });

  return response.rows?.map((row) => ({
    page: row.dimensionValues?.[0].value,
    views: row.metricValues?.[0].value,
  }));
}
