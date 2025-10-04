import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Statistics {
  id: string;
  period_start: string;
  period_end: string;
  total_bookings: number;
  total_sales: number;
  total_users: number;
  total_visitors: number;
  created_at: string;
}

type Data = {
  success: boolean;
  message: string;
  data?: Statistics[];
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === "GET") {
    // ✅ Fetch all statistics
    try {
      const { data, error } = await supabase
        .from("statistics")
        .select("*")
        .order("period_start", { ascending: false });

      if (error) {
        console.error("❌ Error:", error.message);
        return res.status(400).json({
          success: false,
          message: "Failed to fetch statistics",
          error: error.message,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Statistics fetched successfully",
        data,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  if (req.method === "POST") {
    // ✅ Create a new statistics record
    try {
      const {
        period_start,
        period_end,
        total_bookings,
        total_sales,
        total_users,
        total_visitors,
      } = req.body;

      // Validate required fields
      if (
        !period_start ||
        !period_end ||
        total_bookings === undefined ||
        total_sales === undefined ||
        total_users === undefined ||
        total_visitors === undefined
      ) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
        });
      }

      const { data, error } = await supabase
        .from("statistics")
        .insert([
          {
            period_start,
            period_end,
            total_bookings,
            total_sales,
            total_users,
            total_visitors,
          },
        ])
        .select(); // return the created statistics record

      if (error) {
        console.error("❌ Insert Error:", error.message);
        return res.status(400).json({
          success: false,
          message: "Failed to create statistics",
          error: error.message,
        });
      }

      return res.status(201).json({
        success: true,
        message: "Statistics created successfully",
        data,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // ❌ Other methods not allowed
  return res.status(405).json({
    success: false,
    message: "Method not allowed. Use GET or POST.",
  });
}
