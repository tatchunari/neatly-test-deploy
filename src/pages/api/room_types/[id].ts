import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { RoomType } from "@/types/roomTypes";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Data = {
  success: boolean;
  message: string;
  data?: RoomType;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({
      success: false,
      message: "Missing or invalid room_type_id",
    });
  }

  if (req.method === "GET") {
    try {
      const { data, error } = await supabase
        .from("room_types")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("❌ Fetch Error:", error.message);
        return res.status(404).json({
          success: false,
          message: "Room type not found",
          error: error.message,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Room type fetched successfully",
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
    message: "Method not allowed. Use GET.",
  });
}
