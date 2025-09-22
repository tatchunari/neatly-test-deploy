import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from '@supabase/supabase-js';

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
  if (req.method === "GET") {
    // ✅ Fetch all rooms
    try {
      const { data, error } = await supabase.from("rooms").select("*");

      if (error) {
        console.error("❌ Error:", error.message);
        return res.status(400).json({
          success: false,
          message: "Failed to fetch rooms",
          error: error.message,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Rooms fetched successfully",
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
    // ✅ Create a new room
    try {
      const { room_type, price, guests, room_size, description, amenities, bed_type, promotion_price, main_image_url, gallery_images} = req.body;

      if (!room_type || !price || !guests || !room_size || !description || !amenities || !bed_type || !main_image_url || !gallery_images) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
        });
      }

      const { data, error } = await supabase
        .from("rooms")
        .insert([{ room_type, price, guests, room_size, description, amenities, bed_type, promotion_price, main_image_url, gallery_images }])
        .select(); // return the created room

      if (error) {
        console.error("❌ Insert Error:", error.message);
        return res.status(400).json({
          success: false,
          message: "Failed to create room",
          error: error.message,
        });
      }

      return res.status(201).json({
        success: true,
        message: "Room created successfully",
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
