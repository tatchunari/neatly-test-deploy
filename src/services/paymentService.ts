import { supabase } from "@/lib/supabaseClient";
import {
  PaymentApiResponse,
  PaymentMethod,
  PaymentStatus,
  Payment,
} from "@/types/booking";
import {
  BOOKING_ERROR_CODES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  BOOKING_STATUSES,
} from "@/constants/booking";

export class PaymentService {
  // ===== CREATE PAYMENT =====
  static async createPayment(
    bookingId: string,
    amount: number,
    paymentMethod: PaymentMethod,
    cardDetails?: {
      cardNumber: string;
      cardOwner: string;
      expiryDate: string;
      cvc: string;
    }
  ): Promise<PaymentApiResponse> {
    try {
      // 1. Validate payment data
      const validation = this.validatePaymentData(
        amount,
        paymentMethod,
        cardDetails
      );
      if (!validation.isValid) {
        return {
          success: false,
          message: "Payment validation failed",
          error: validation.errors.map((e) => e.message).join(", "),
        };
      }

      // 2. Prepare payment data
      const paymentData: Partial<Payment> = {
        booking_id: bookingId,
        amount: amount,
        payment_method: paymentMethod,
        status: PAYMENT_STATUSES.PENDING,
        created_at: new Date().toISOString(),
      };

      // 3. Add card details if credit card
      if (paymentMethod === PAYMENT_METHODS.CREDIT_CARD && cardDetails) {
        paymentData.card_last_four = cardDetails.cardNumber.slice(-4);
        paymentData.meta = {
          card_owner: cardDetails.cardOwner,
          expiry_date: cardDetails.expiryDate,
        };
      }

      // 4. Create payment record
      const { data: payment, error } = await supabase
        .from("payments")
        .insert(paymentData)
        .select()
        .single();

      if (error) {
        console.error("Payment creation error:", error);
        return {
          success: false,
          message: "Failed to create payment",
          error: error.message,
        };
      }

      return {
        success: true,
        message: "Payment created successfully",
        data: payment,
      };
    } catch (error) {
      console.error("Payment service error:", error);
      return {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // ===== PROCESS STRIPE PAYMENT =====
  static async processStripePayment(
    paymentId: string,
    stripePaymentIntentId: string
  ): Promise<PaymentApiResponse> {
    try {
      // 1. Update payment with Stripe payment intent ID
      const { data: payment, error } = await supabase
        .from("payments")
        .update({
          stripe_payment_id: stripePaymentIntentId,
          status: PAYMENT_STATUSES.COMPLETED,
        })
        .eq("id", paymentId)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          message: "Failed to update payment",
          error: error.message,
        };
      }

      // 2. Update booking status to confirmed
      const { error: bookingError } = await supabase
        .from("bookings")
        .update({ status: BOOKING_STATUSES.CONFIRMED })
        .eq("id", payment.booking_id);

      if (bookingError) {
        console.error("Failed to update booking status:", bookingError);
        // Don't fail the payment, just log the error
      }

      return {
        success: true,
        message: "Payment processed successfully",
        data: payment,
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to process payment",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // ===== PROCESS CASH PAYMENT =====
  static async processCashPayment(
    paymentId: string
  ): Promise<PaymentApiResponse> {
    try {
      // For cash payments, we just mark as pending
      // Payment will be completed when guest checks in
      const { data: payment, error } = await supabase
        .from("payments")
        .update({
          status: PAYMENT_STATUSES.PENDING,
        })
        .eq("id", paymentId)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          message: "Failed to update payment",
          error: error.message,
        };
      }

      // Update booking status to confirmed (cash payment)
      const { error: bookingError } = await supabase
        .from("bookings")
        .update({ status: BOOKING_STATUSES.CONFIRMED })
        .eq("id", payment.booking_id);

      if (bookingError) {
        console.error("Failed to update booking status:", bookingError);
      }

      return {
        success: true,
        message: "Cash payment recorded successfully",
        data: payment,
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to process cash payment",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // ===== GET PAYMENT =====
  static async getPayment(paymentId: string): Promise<PaymentApiResponse> {
    try {
      const { data: payment, error } = await supabase
        .from("payments")
        .select(
          `
          *,
          bookings (
            id,
            room_id,
            check_in,
            check_out,
            total,
            status
          )
        `
        )
        .eq("id", paymentId)
        .single();

      if (error) {
        return {
          success: false,
          message: "Payment not found",
          error: error.message,
        };
      }

      return {
        success: true,
        message: "Payment retrieved successfully",
        data: payment,
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to retrieve payment",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // ===== GET PAYMENTS BY BOOKING =====
  static async getPaymentsByBooking(
    bookingId: string
  ): Promise<PaymentApiResponse> {
    try {
      const { data: payments, error } = await supabase
        .from("payments")
        .select("*")
        .eq("booking_id", bookingId)
        .order("created_at", { ascending: false });

      if (error) {
        return {
          success: false,
          message: "Failed to retrieve payments",
          error: error.message,
        };
      }

      return {
        success: true,
        message: "Payments retrieved successfully",
        data: payments,
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to retrieve payments",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // ===== UPDATE PAYMENT STATUS =====
  static async updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus
  ): Promise<PaymentApiResponse> {
    try {
      const { data: payment, error } = await supabase
        .from("payments")
        .update({ status })
        .eq("id", paymentId)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          message: "Failed to update payment status",
          error: error.message,
        };
      }

      return {
        success: true,
        message: "Payment status updated successfully",
        data: payment,
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to update payment status",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // ===== REFUND PAYMENT =====
  static async refundPayment(paymentId: string): Promise<PaymentApiResponse> {
    try {
      // 1. Get payment details
      const paymentResponse = await this.getPayment(paymentId);
      if (!paymentResponse.success || !paymentResponse.data) {
        return paymentResponse;
      }

      const payment = Array.isArray(paymentResponse.data)
        ? paymentResponse.data[0]
        : paymentResponse.data;

      if (!payment) {
        return {
          success: false,
          message: "Payment not found",
          error: "PAYMENT_NOT_FOUND",
        };
      }

      // 2. Check if payment can be refunded
      if (payment.status !== PAYMENT_STATUSES.COMPLETED) {
        return {
          success: false,
          message: "Only completed payments can be refunded",
          error: BOOKING_ERROR_CODES.PAYMENT_FAILED,
        };
      }

      // 3. Update payment status to refunded
      const { data: updatedPayment, error } = await supabase
        .from("payments")
        .update({ status: PAYMENT_STATUSES.REFUNDED })
        .eq("id", paymentId)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          message: "Failed to refund payment",
          error: error.message,
        };
      }

      // 4. Update booking status to cancelled
      const { error: bookingError } = await supabase
        .from("bookings")
        .update({ status: BOOKING_STATUSES.CANCELLED })
        .eq("id", payment.booking_id);

      if (bookingError) {
        console.error("Failed to update booking status:", bookingError);
      }

      return {
        success: true,
        message: "Payment refunded successfully",
        data: updatedPayment,
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to refund payment",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // ===== VALIDATE PAYMENT DATA =====
  private static validatePaymentData(
    amount: number,
    paymentMethod: PaymentMethod,
    cardDetails?: {
      cardNumber: string;
      cardOwner: string;
      expiryDate: string;
      cvc: string;
    }
  ): { isValid: boolean; errors: Array<{ field: string; message: string }> } {
    const errors: Array<{ field: string; message: string }> = [];

    // Validate amount
    if (amount <= 0) {
      errors.push({
        field: "amount",
        message: "Amount must be greater than 0",
      });
    }

    // Validate credit card details if payment method is credit card
    if (paymentMethod === PAYMENT_METHODS.CREDIT_CARD) {
      if (!cardDetails) {
        errors.push({
          field: "cardDetails",
          message: "Card details are required for credit card payment",
        });
        return { isValid: false, errors };
      }

      // Validate card number (basic validation)
      if (!cardDetails.cardNumber || cardDetails.cardNumber.length < 13) {
        errors.push({
          field: "cardNumber",
          message: "Invalid card number",
        });
      }

      // Validate card owner
      if (!cardDetails.cardOwner || cardDetails.cardOwner.trim().length < 2) {
        errors.push({
          field: "cardOwner",
          message: "Card owner name is required",
        });
      }

      // Validate expiry date (basic format check)
      if (
        !cardDetails.expiryDate ||
        !/^\d{2}\/\d{2}$/.test(cardDetails.expiryDate)
      ) {
        errors.push({
          field: "expiryDate",
          message: "Invalid expiry date format (MM/YY)",
        });
      }

      // Validate CVC
      if (!cardDetails.cvc || !/^\d{3,4}$/.test(cardDetails.cvc)) {
        errors.push({
          field: "cvc",
          message: "Invalid CVC",
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // ===== MASK CARD NUMBER =====
  static maskCardNumber(cardNumber: string): string {
    if (!cardNumber || cardNumber.length < 4) return "****";
    return "*".repeat(cardNumber.length - 4) + cardNumber.slice(-4);
  }

  // ===== FORMAT PAYMENT METHOD =====
  static formatPaymentMethod(paymentMethod: PaymentMethod): string {
    switch (paymentMethod) {
      case PAYMENT_METHODS.CREDIT_CARD:
        return "Credit Card";
      case PAYMENT_METHODS.CASH:
        return "Cash";
      default:
        return "Unknown";
    }
  }
}
