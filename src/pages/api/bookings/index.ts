<<<<<<< HEAD
// API for getting all bookings data
=======
>>>>>>> 45cf2d4 (feat: add booking management functionality with detailed booking view and API integration)
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

<<<<<<< HEAD
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
=======
type Data = {
  success: boolean;
  message: string;
  data?: any;
>>>>>>> 45cf2d4 (feat: add booking management functionality with detailed booking view and API integration)
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === "GET") {
<<<<<<< HEAD
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
=======
    try {
      // First attempt: include profiles join; if it fails due to missing relation, retry without profiles
      let data: any[] | null = null
      let baseError: any = null
      try {
        const result = await supabase
          .from("bookings")
          .select("*, rooms(guests, room_type, bed_type), profiles(first_name, last_name, username, full_name)")
          .order("created_at", { ascending: false });
        data = result.data as any[] | null
        baseError = result.error
      } catch (e) {
        baseError = e
      }

      if (baseError) {
        // Retry without the profiles relation to avoid breaking the UI
        const fallback = await supabase
          .from("bookings")
          .select("*, rooms(guests, room_type, bed_type)")
          .order("created_at", { ascending: false });
        if (fallback.error) {
          return res.status(400).json({
            success: false,
            message: "Failed to fetch bookings",
            error: fallback.error.message,
          });
        }
        data = fallback.data as any[] | null
      }

      // Map related rooms fields and enrich names using profiles via customer_id when needed
      let enriched = (data ?? []).map((b: any) => {
        const profile = b?.profiles ?? null
        const synthesizedName =
          b?.customer_name
          || profile?.full_name
          || [profile?.first_name, profile?.last_name].filter(Boolean).join(" ")
          || profile?.username
          || null

        return {
          ...b,
          customer_name: synthesizedName,
          guests: b?.rooms?.guests ?? b?.guests ?? null,
          room_type: b?.rooms?.room_type ?? b?.room_type ?? null,
          bed_type: b?.rooms?.bed_type ?? b?.bed_type ?? null,
        }
      })

      // If some rows still have null customer_name but have any of customer_id/user_id/profile_id, fetch their profiles in one query
      const missingIds = Array.from(new Set(
        enriched
          .filter((b: any) => !b.customer_name && (b.customer_id || b.user_id || b.profile_id))
          .map((b: any) => (b.customer_id || b.user_id || b.profile_id) as string)
      ))

      if (missingIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, username, full_name")
          .in("id", missingIds)

        if (!profilesError && Array.isArray(profilesData)) {
          const idToProfile: Record<string, any> = Object.create(null)
          for (const p of profilesData) {
            idToProfile[p.id] = p
          }
          enriched = enriched.map((b: any) => {
            if (!b.customer_name) {
              const key = (b.customer_id || b.user_id || b.profile_id) as string | undefined
              const p = key ? idToProfile[key] : undefined
              if (p) {
              const synthesized = p.full_name || [p.first_name, p.last_name].filter(Boolean).join(" ") || p.username || null
                return { ...b, customer_name: synthesized }
              }
            }
            return b
          })
        }
>>>>>>> 45cf2d4 (feat: add booking management functionality with detailed booking view and API integration)
      }

      return res.status(200).json({
        success: true,
        message: "Bookings fetched successfully",
<<<<<<< HEAD
        data,
=======
        data: enriched,
>>>>>>> 45cf2d4 (feat: add booking management functionality with detailed booking view and API integration)
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

<<<<<<< HEAD
  // ❌ Other methods not allowed
  return res.status(405).json({
    success: false,
    message: "Method not allowed. Use GET or POST.",
  });
}
=======
  return res.status(405).json({
    success: false,
    message: "Method not allowed. Use GET.",
  });
}


>>>>>>> 45cf2d4 (feat: add booking management functionality with detailed booking view and API integration)
