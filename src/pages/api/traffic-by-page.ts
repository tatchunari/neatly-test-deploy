// src/pages/api/traffic-by-page.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getPageViews } from "../../lib/ga4";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader("Cache-Control", "no-store");

  try {
    const data = await getPageViews();

    // Get unique pages for dropdown
    const pages = [
      "All Pages",
      ...new Set(data?.map((d) => d.page).filter(Boolean)),
    ];

    // Calculate totals
    const totalViews = data?.reduce((sum, page) => {
      return sum + parseInt(page.views || "0", 10);
    }, 0);

    res.status(200).json({
      pages,
      data,
      totalViews,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch traffic data" });
  }
}
