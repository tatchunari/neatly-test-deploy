// src/pages/api/sync-ga4-stats.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getPageViews } from "../../lib/ga4";
import { createClient } from "@supabase/supabase-js";

// Define the page view data type based on your GA4 response
interface PageViewData {
  page: string | null | undefined;
  views: string | null | undefined;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper function to get first and last day of current month
function getCurrentMonthRange() {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    periodStart: firstDay.toISOString().split("T")[0], // YYYY-MM-DD format
    periodEnd: lastDay.toISOString().split("T")[0],
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Optional: Protect this endpoint
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Fetch page views from GA4
    const pageViewsData = await getPageViews();

    // Check if data was returned
    if (!pageViewsData || !Array.isArray(pageViewsData)) {
      return res.status(500).json({
        error: "Invalid data from GA4",
        data: pageViewsData,
      });
    }

    // Sum up total visitors from all pages
    const totalVisitors = pageViewsData.reduce(
      (sum: number, page: PageViewData) => {
        // Convert string views to number (GA4 often returns strings)
        const views = page.views ? parseInt(page.views, 10) : 0;
        return sum + views;
      },
      0
    );

    console.log(`Total visitors calculated: ${totalVisitors}`);

    // Get current month's date range
    const { periodStart, periodEnd } = getCurrentMonthRange();

    // Check if a row exists for current month
    const { data: existingRow, error: fetchError } = await supabase
      .from("statistics")
      .select("*")
      .eq("period_start", periodStart)
      .eq("period_end", periodEnd)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 = no rows found
      console.error("Error checking existing row:", fetchError);
      return res.status(500).json({
        error: "Failed to check existing data",
        details: fetchError,
      });
    }

    let result;

    if (existingRow) {
      // Update existing row
      const { data, error } = await supabase
        .from("statistics")
        .update({
          total_visitors: totalVisitors,
          updated_at: new Date().toISOString(),
        })
        .eq("period_start", periodStart)
        .eq("period_end", periodEnd)
        .select();

      if (error) {
        console.error("Supabase update error:", error);
        return res.status(500).json({
          error: "Failed to update Supabase",
          details: error,
        });
      }

      result = data;
      console.log("Updated existing row");
    } else {
      // Insert new row
      const { data, error } = await supabase
        .from("statistics")
        .insert({
          period_start: periodStart,
          period_end: periodEnd,
          total_visitors: totalVisitors,
          updated_at: new Date().toISOString(),
        })
        .select();

      if (error) {
        console.error("Supabase insert error:", error);
        return res.status(500).json({
          error: "Failed to insert into Supabase",
          details: error,
        });
      }

      result = data;
      console.log("Inserted new row");
    }

    res.status(200).json({
      success: true,
      totalVisitors,
      pageCount: pageViewsData.length,
      periodStart,
      periodEnd,
      data: result,
      message: "Statistics updated successfully",
    });
  } catch (err) {
    console.error("Sync error:", err);
    res.status(500).json({ error: "Failed to sync GA4 data", details: err });
  }
}

// ==================================================
// ALTERNATIVE: If you want to update a specific row
// ==================================================
// Replace the upsert section with:
/*
const { data, error } = await supabase
  .from("statistics")
  .update({ total_visitors: totalVisitors })
  .eq("id", 1) // Or whatever your row identifier is
  .select();
*/

// ==================================================
// CLIENT-SIDE HOOK TO FETCH STATISTICS
// ==================================================
// src/hooks/useStatistics.ts
/*
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function useStatistics() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const { data, error } = await supabase
        .from("statistics")
        .select("*")
        .single();

      if (!error) {
        setStats(data);
      }
      setLoading(false);
    }

    fetchStats();
  }, []);

  return { stats, loading };
}
*/

// ==================================================
// CRON JOB SETUP (Optional)
// ==================================================
// If you want to run this automatically, use Vercel Cron Jobs
// Create: vercel.json
/*
{
  "crons": [
    {
      "path": "/api/sync-ga4-stats",
      "schedule": "0 0 * * *"
    }
  ]
}
*/
