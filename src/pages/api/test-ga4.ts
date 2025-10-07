// src/pages/api/test-ga4.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getPageViews } from "../../lib/ga4";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const data = await getPageViews();
    res.status(200).json({ data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch GA4 data" });
  }
}
