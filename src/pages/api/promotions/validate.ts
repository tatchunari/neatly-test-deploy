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
    const { code, roomId, checkIn, checkOut } = req.body;

    // Validate required fields
    if (!code || !roomId || !checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        error: "code, roomId, checkIn, and checkOut are required",
      });
    }

    // Validate promotion code format
    const codeValidation = validatePromotionCode(code);
    if (!codeValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid promotion code format",
        error: codeValidation.errors.join(", "),
      });
    }

    const result = await PromotionService.validatePromotionCode(
      code,
      roomId,
      checkIn,
      checkOut
    );

    if (result.isValid) {
      return res.status(200).json({
        success: true,
        message: "Promotion code is valid",
        data: result.promotionCode,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid promotion code",
        error: result.error,
      });
    }

  } catch (error) {
    console.error("Validate promotion code API error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}