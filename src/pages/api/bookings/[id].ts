import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Data = {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { id } = req.query as { id?: string };

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Booking id is required",
      error: "Missing id",
    });
  }

  if (req.method === "GET") {
    try {
      // Attempt with profiles; if it fails, retry without to avoid breaking the UI
      let data: any | null = null
      let baseError: any = null
      try {
        const result = await supabase
          .from("bookings")
          .select("*, rooms(guests, room_type, bed_type), profiles(first_name, last_name, username, full_name)")
          .eq("id", id)
          .single();
        data = result.data as any | null
        baseError = result.error
      } catch (e) {
        baseError = e
      }

      if (baseError) {
        const fallback = await supabase
          .from("bookings")
          .select("*, rooms(guests, room_type, bed_type)")
          .eq("id", id)
          .single();
        if (fallback.error) {
          return res.status(400).json({
            success: false,
            message: "Failed to fetch booking",
            error: fallback.error.message,
          });
        }
        data = fallback.data as any | null
      }

      // Enrich and synthesize name. If profiles join isn't present and customer_name is null, fetch profile by customer_id.
      let enriched = data
        ? (() => {
            const profile = (data as any)?.profiles ?? null
            const synthesizedName =
              (data as any)?.customer_name
              || profile?.full_name
              || [profile?.first_name, profile?.last_name].filter(Boolean).join(" ")
              || profile?.username
              || null
            return {
              ...data,
              customer_name: synthesizedName,
              guests: (data as any)?.rooms?.guests ?? (data as any)?.guests ?? null,
              room_type: (data as any)?.rooms?.room_type ?? (data as any)?.room_type ?? null,
              bed_type: (data as any)?.rooms?.bed_type ?? (data as any)?.bed_type ?? null,
            }
          })()
        : null

      if (enriched && !enriched.customer_name && ((enriched as any).customer_id || (enriched as any).user_id || (enriched as any).profile_id)) {
        const key = ((enriched as any).customer_id || (enriched as any).user_id || (enriched as any).profile_id) as string
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, username, full_name")
          .eq("id", key)
          .single()
        if (!profileError && profile) {
          const synthesized = profile.full_name || [profile.first_name, profile.last_name].filter(Boolean).join(" ") || profile.username || null
          enriched = { ...enriched, customer_name: synthesized }
        }
      }

      return res.status(200).json({
        success: true,
        message: "Booking fetched successfully",
        data: enriched,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: "Method not allowed. Use GET.",
  });
}


