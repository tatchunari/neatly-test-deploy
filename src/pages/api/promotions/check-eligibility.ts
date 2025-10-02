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
    const { userId, promotionCode } = req.body;

    // Validate required fields
    if (!userId || !promotionCode) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        error: "userId and promotionCode are required",
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

    const isEligible = await PromotionService.checkPromotionEligibility(
      userId,
      promotionCode
    );

    return res.status(200).json({
      success: true,
      message: "Eligibility checked successfully",
      data: { isEligible },
    });
  } catch (error) {
    console.error("Check promotion eligibility API error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
