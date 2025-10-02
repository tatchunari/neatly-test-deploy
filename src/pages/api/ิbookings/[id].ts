import { NextApiRequest, NextApiResponse } from "next";
import { BookingService } from "@/services/bookingService";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
      error: "Only GET method is allowed",
    });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
        error: "Booking ID is required",
      });
    }

    const result = await BookingService.getBooking(id);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json(result);
    }

  } catch (error) {
    console.error("Get booking API error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}