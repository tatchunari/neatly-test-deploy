import { NextApiRequest, NextApiResponse } from "next";
import { PaymentService } from "@/services/paymentService";

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
    const { bookingId } = req.query;

    if (!bookingId || typeof bookingId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
        error: "Booking ID is required",
      });
    }

    const result = await PaymentService.getPaymentsByBooking(bookingId);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }

  } catch (error) {
    console.error("Get payments by booking API error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}