import { PaymentMethod } from "@/types/booking";
import { PAYMENT_STATUSES, PAYMENT_METHODS } from "@/constants/booking";

export const validatePaymentData = (data: {
  bookingId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  cardDetails?: {
    cardNumber: string;
    cardOwner: string;
    expiryDate: string;
    cvc: string;
  };
}) => {
  const errors: string[] = [];

  // Validate required fields
  if (!data.bookingId) errors.push("Booking ID is required");
  if (!data.amount) errors.push("Amount is required");
  if (!data.paymentMethod) errors.push("Payment method is required");

  // Validate amount
  if (data.amount <= 0) errors.push("Amount must be greater than 0");

  // Validate payment method
  const validPaymentMethods: PaymentMethod[] = [
    PAYMENT_METHODS.CREDIT_CARD,
    PAYMENT_METHODS.CASH,
    PAYMENT_METHODS.BANK_TRANSFER,
    PAYMENT_METHODS.PROMPTPAY,
  ];
  if (!validPaymentMethods.includes(data.paymentMethod)) {
    errors.push("Invalid payment method");
  }

  // Validate card details for credit card
  if (data.paymentMethod === PAYMENT_METHODS.CREDIT_CARD) {
    if (!data.cardDetails) {
      errors.push("Card details are required for credit card payment");
    } else {
      const { cardNumber, cardOwner, expiryDate, cvc } = data.cardDetails;
      if (!cardNumber) errors.push("Card number is required");
      if (!cardOwner) errors.push("Card owner is required");
      if (!expiryDate) errors.push("Expiry date is required");
      if (!cvc) errors.push("CVC is required");

      // Additional card validation
      if (cardNumber && cardNumber.length < 13)
        errors.push("Invalid card number");
      if (cardOwner && cardOwner.trim().length < 2)
        errors.push("Invalid card owner name");
      if (expiryDate && !/^\d{2}\/\d{2}$/.test(expiryDate))
        errors.push("Invalid expiry date format (MM/YY)");
      if (cvc && !/^\d{3,4}$/.test(cvc)) errors.push("Invalid CVC");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validatePaymentStatus = (status: string) => {
  const validStatuses: string[] = [
    PAYMENT_STATUSES.PENDING,
    PAYMENT_STATUSES.COMPLETED,
    PAYMENT_STATUSES.FAILED,
    PAYMENT_STATUSES.REFUNDED,
  ];
  return {
    isValid: validStatuses.includes(status),
    error: validStatuses.includes(status) ? null : "Invalid status",
  };
};
