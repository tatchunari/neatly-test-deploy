import { NextApiRequest, NextApiResponse } from "next";
import { PaymentService } from "@/services/paymentService";
import { PaymentStatus } from "@/types/ิbooking";
import { validatePaymentStatus } from "@/utils/validation/paymentValidation";

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
        message: "Invalid payment ID",
        error: "Payment ID is required",
      });
    }

    const validation = validatePaymentStatus(status);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
        error: validation.error,
      });
    }

    const result = await PaymentService.updatePaymentStatus(
      id,
      status as PaymentStatus
    );

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("Update payment status API error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
