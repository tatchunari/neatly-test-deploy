import { NextApiRequest, NextApiResponse } from "next";
import { PromotionService } from "@/services/promotionService";
import { validatePromotionCode } from "@/utils/validation/promotionValidation";

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
    const { bookingId, promotionCode } = req.body;

    // Validate required fields
    if (!bookingId || !promotionCode) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        error: "bookingId and promotionCode are required",
      });
    }

    // Validate promotion code format
    const codeValidation = validatePromotionCode(promotionCode);
    if (!codeValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid promotion code format",
        error: codeValidation.errors.join(", "),
      });
    }

    const result = await PromotionService.applyPromotionCode(bookingId, promotionCode);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }

  } catch (error) {
    console.error("Apply promotion code API error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}