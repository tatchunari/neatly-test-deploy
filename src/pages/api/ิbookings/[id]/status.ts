import { NextApiRequest, NextApiResponse } from "next";
import { BookingService } from "@/services/bookingService";
import { BOOKING_STATUSES } from "@/constants/booking";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PUT") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
      error: "Only PUT method is allowed",
    });
  }

  try {
    const { id } = req.query;
    const { status } = req.body;

    if (!id || typeof id !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
        error: "Booking ID is required",
      });
    }

    if (!status || !Object.values(BOOKING_STATUSES).includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
        error:
          "Status must be one of: pending, confirmed, cancelled, completed",
      });
    }

    const result = await BookingService.updateBookingStatus(id, status);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("Update booking status API error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
