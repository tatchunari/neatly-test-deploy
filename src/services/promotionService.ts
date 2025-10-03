import { supabase } from "@/lib/supabaseClient";
import { PromotionCode, BookingApiResponse } from "@/types/booking";
import { BOOKING_ERROR_CODES, DISCOUNT_TYPES } from "@/constants/booking";

export class PromotionService {
  // ===== VALIDATE PROMOTION CODE =====
  static async validatePromotionCode(
    code: string,
    _roomId: string,
    _checkIn: string,
    _checkOut: string
  ): Promise<{
    isValid: boolean;
    promotionCode?: PromotionCode;
    error?: string;
  }> {
    try {
      // 1. Check if promotion code exists
      const { data: promotion, error } = await supabase
        .from("promo_codes")
        .select("*")
        .eq("code", code.toUpperCase())
        .single();

      if (error || !promotion) {
        return {
          isValid: false,
          error: BOOKING_ERROR_CODES.INVALID_PROMO_CODE,
        };
      }

      // 2. Check if promotion is within valid date range
      const now = new Date();
      const expiresAt = new Date(promotion.expires_at);

      if (now > expiresAt) {
        return {
          isValid: false,
          error: BOOKING_ERROR_CODES.PROMO_CODE_EXPIRED,
        };
      }

      // 3. Check if promotion has remaining uses
      if (promotion.max_uses && promotion.max_uses > 0) {
        const { count } = await supabase
          .from("bookings")
          .select("*", { count: "exact" })
          .eq("promo_code", code.toUpperCase());

        if (count && count >= promotion.max_uses) {
          return {
            isValid: false,
            error: BOOKING_ERROR_CODES.PROMO_CODE_USAGE_LIMIT_REACHED,
          };
        }
      }

      // 4. Return valid promotion code
      const promotionCode: PromotionCode = {
        code: promotion.code,
        discount: promotion.discount_percent,
        discountType: DISCOUNT_TYPES.PERCENTAGE,
        validFrom: new Date().toISOString(),
        validTo: promotion.expires_at,
        applicableRooms: [],
        isValid: true,
      };

      return {
        isValid: true,
        promotionCode,
      };
    } catch (error) {
      console.error("Promotion validation error:", error);
      return {
        isValid: false,
        error: BOOKING_ERROR_CODES.NETWORK_ERROR,
      };
    }
  }

  // ===== CALCULATE DISCOUNT =====
  static calculateDiscount(
    baseAmount: number,
    promotionCode: PromotionCode
  ): number {
    if (!promotionCode.isValid) return 0;

    if (promotionCode.discountType === DISCOUNT_TYPES.PERCENTAGE) {
      return (baseAmount * promotionCode.discount) / 100;
    } else {
      return Math.min(promotionCode.discount, baseAmount);
    }
  }

  // ===== APPLY PROMOTION CODE =====
  static async applyPromotionCode(
    bookingId: string,
    promotionCode: string
  ): Promise<BookingApiResponse> {
    try {
      // 1. Get booking details
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", bookingId)
        .single();

      if (bookingError || !booking) {
        return {
          success: false,
          message: "Booking not found",
          error: bookingError?.message || "Booking not found",
        };
      }

      // 2. Validate promotion code
      const validation = await this.validatePromotionCode(
        promotionCode,
        booking.room_id,
        booking.check_in,
        booking.check_out
      );

      if (!validation.isValid) {
        return {
          success: false,
          message: "Invalid promotion code",
          error: validation.error || "Invalid promotion code",
        };
      }

      // 3. Calculate new total with discount
      const discount = this.calculateDiscount(
        booking.total,
        validation.promotionCode!
      );
      const newTotal = booking.total - discount;

      // 4. Update booking with promotion code and new total
      const { data: updatedBooking, error: updateError } = await supabase
        .from("bookings")
        .update({
          promo_code: promotionCode.toUpperCase(),
          total: newTotal,
          updated_at: new Date().toISOString(),
        })
        .eq("id", bookingId)
        .select()
        .single();

      if (updateError) {
        return {
          success: false,
          message: "Failed to apply promotion code",
          error: updateError.message,
        };
      }

      return {
        success: true,
        message: "Promotion code applied successfully",
        data: updatedBooking,
      };
    } catch (error) {
      console.error("Apply promotion code error:", error);
      return {
        success: false,
        message: "Failed to apply promotion code",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // ===== REMOVE PROMOTION CODE =====
  static async removePromotionCode(
    bookingId: string
  ): Promise<BookingApiResponse> {
    try {
      // 1. Get booking details
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", bookingId)
        .single();

      if (bookingError || !booking) {
        return {
          success: false,
          message: "Booking not found",
          error: bookingError?.message || "Booking not found",
        };
      }

      // 2. Calculate original total (without discount)
      const originalTotal = await this.calculateOriginalTotal(booking);

      // 3. Update booking to remove promotion code
      const { data: updatedBooking, error: updateError } = await supabase
        .from("bookings")
        .update({
          promo_code: null,
          total: originalTotal,
          updated_at: new Date().toISOString(),
        })
        .eq("id", bookingId)
        .select()
        .single();

      if (updateError) {
        return {
          success: false,
          message: "Failed to remove promotion code",
          error: updateError.message,
        };
      }

      return {
        success: true,
        message: "Promotion code removed successfully",
        data: updatedBooking,
      };
    } catch (error) {
      console.error("Remove promotion code error:", error);
      return {
        success: false,
        message: "Failed to remove promotion code",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // ===== GET PROMOTION CODES =====
  static async getPromotionCodes(): Promise<BookingApiResponse> {
    try {
      const { data: promotions, error } = await supabase
        .from("promo_codes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        return {
          success: false,
          message: "Failed to retrieve promotion codes",
          error: error.message,
        };
      }

      return {
        success: true,
        message: "Promotion codes retrieved successfully",
        data: promotions,
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to retrieve promotion codes",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // ===== CALCULATE ORIGINAL TOTAL =====
  private static async calculateOriginalTotal(booking: any): Promise<number> {
    try {
      // Get room price
      const { data: room, error } = await supabase
        .from("rooms")
        .select("price")
        .eq("id", booking.room_id)
        .single();

      if (error || !room) {
        return booking.total;
      }

      // Calculate nights
      const checkIn = new Date(booking.check_in);
      const checkOut = new Date(booking.check_out);
      const nights = Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Calculate special requests total
      const specialRequestsTotal =
        booking.special_requests
          ?.filter((req: any) => req.selected && req.price)
          .reduce((sum: number, req: any) => sum + (req.price || 0), 0) || 0;

      return room.price * nights + specialRequestsTotal;
    } catch (error) {
      console.error("Failed to calculate original total:", error);
      return booking.total;
    }
  }

  // ===== FORMAT PROMOTION CODE =====
  static formatPromotionCode(code: string): string {
    return code.toUpperCase().trim();
  }

  // ===== CHECK PROMOTION ELIGIBILITY =====
  static async checkPromotionEligibility(
    userId: string,
    promotionCode: string
  ): Promise<boolean> {
    try {
      const { data: usage, error } = await supabase
        .from("bookings")
        .select("id")
        .eq("promo_code", promotionCode.toUpperCase())
        .eq("customer_id", userId)
        .single();

      return error !== null; // Return true if no usage found (eligible)
    } catch (error) {
      return false;
    }
  }
}
