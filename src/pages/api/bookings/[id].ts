import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Data = {
  success: boolean;
  message: string;
  data?: unknown;
  error?: string;
};

type Profile = {
  id: string
  first_name?: string | null
  last_name?: string | null
  username?: string | null
  full_name?: string | null
}

type BookingRow = {
  id: string
  customer_name?: string | null
  customer_id?: string | null
  user_id?: string | null
  profile_id?: string | null
  guests?: number | null
  room_type?: string | null
  bed_type?: string | null
  rooms?: { guests?: number | null; room_type?: string | null; bed_type?: string | null } | null
  profiles?: Profile | null
  [key: string]: unknown
}

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
      let data: BookingRow | null = null
      let baseError: unknown = null
      try {
        const result = await supabase
          .from("bookings")
          .select("*, rooms(guests, room_type, bed_type), profiles(first_name, last_name, username, full_name)")
          .eq("id", id)
          .single();
        data = (result.data as unknown as BookingRow) ?? null
        baseError = result.error ?? null
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
        data = (fallback.data as unknown as BookingRow) ?? null
      }

      // Enrich and synthesize name. If profiles join isn't present and customer_name is null, fetch profile by customer_id.
      let enriched = data
        ? (() => {
            const profile = data?.profiles ?? null
            const synthesizedName =
              data?.customer_name
              || profile?.full_name
              || [profile?.first_name, profile?.last_name].filter(Boolean).join(" ")
              || profile?.username
              || null
            return {
              ...data,
              customer_name: synthesizedName,
              guests: data?.rooms?.guests ?? data?.guests ?? null,
              room_type: data?.rooms?.room_type ?? data?.room_type ?? null,
              bed_type: data?.rooms?.bed_type ?? data?.bed_type ?? null,
            }
          })()
        : null

      if (enriched && !enriched.customer_name && (enriched.customer_id || enriched.user_id || enriched.profile_id)) {
        const key = String(enriched.customer_id || enriched.user_id || enriched.profile_id)
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


