// API for getting all bookings data
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Booking {
  id: string;
  room_id: string;
  customer_id: string;
  check_in_date: string;
  check_out_date: string;
  total_amount: number;
  status: "pending" | "confirmed" | "cancelled" | "refunded";
  promo_code?: string;
  created_at: string;
  updated_at: string;
  additional_request?: string;
  booking_date: string;
  payment_method: "cash" | "credit card";
  customer_name: string;
  special_request?: string[];
  standard_request?: string[];
}

type Data = {
  success: boolean;
  message: string;
  data?: Booking[];
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === "GET") {
    // ✅ Fetch all bookings
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Error:", error.message);
        return res.status(400).json({
          success: false,
          message: "Failed to fetch bookings",
          error: error.message,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Bookings fetched successfully",
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
