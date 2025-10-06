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
  data?: RoomType[];
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === "GET") {
    // ✅ Fetch all room types
    try {
      const { data, error } = await supabase.from("room_types").select("*");

      if (error) {
        console.error("❌ Error:", error.message);
        return res.status(400).json({
          success: false,
          message: "Failed to fetch room types",
          error: error.message,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Room types fetched successfully",
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
    // ✅ Create a new room type
    try {
      const {
        id,
        name,
        description,
        base_price,
        promo_price,
        guests,
        room_size,
        bed_type,
        amenities,
        main_image,
        gallery_images,
      } = req.body;

      if (
        !id ||
        !name ||
        !description ||
        !base_price ||
        !guests ||
        !room_size ||
        !bed_type ||
        !amenities ||
        !main_image ||
        !gallery_images
      ) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
        });
      }

      const { data, error } = await supabase
        .from("room_types")
        .insert([
          {
            id,
            name,
            description,
            base_price,
            promo_price,
            guests,
            room_size,
            bed_type,
            amenities,
            main_image,
            gallery_images,
          },
        ])
        .select(); // return the created room type

      if (error) {
        console.error("❌ Insert Error:", error.message);
        return res.status(400).json({
          success: false,
          message: "Failed to create room type",
          error: error.message,
        });
      }

      return res.status(201).json({
        success: true,
        message: "Room type created successfully",
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
