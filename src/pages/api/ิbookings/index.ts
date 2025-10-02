import { NextApiRequest, NextApiResponse } from "next";
import { BookingService } from "@/services/bookingService";
import { BookingFormData } from "@/types/ิbooking";
import { validateBookingData } from "@/utils/validation/bookingValidation";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
      error: "Only POST method is allowed",
    });
  }

  try {
    const bookingData: BookingFormData = req.body;

    const validation = validateBookingData(bookingData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        error: validation.errors.join(", "),
      });
    }

    const result = await BookingService.createBooking(bookingData);

    if (result.success) {
      return res.status(201).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("Booking API error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
