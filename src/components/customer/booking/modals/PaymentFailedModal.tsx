import React from "react";
import { BookingError } from "@/types/booking";

interface PaymentFailedModalProps {
  isOpen: boolean;
  onClose: () => void;
  error: BookingError;
  onRetry?: () => void;
  onTryDifferentMethod?: () => void;
}

export const PaymentFailedModal: React.FC<PaymentFailedModalProps> = ({
  isOpen,
  onClose,
  error,
  onRetry,
  onTryDifferentMethod,
}) => {
  if (!isOpen) return null;

  const getErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case "PAYMENT_FAILED":
        return "Your payment could not be processed. Please check your payment details and try again.";
      case "INVALID_CARD_DETAILS":
        return "The card details you entered are invalid. Please check and try again.";
      case "CARD_DECLINED":
        return "Your card was declined. Please contact your bank or try a different payment method.";
      case "INSUFFICIENT_FUNDS":
        return "Your account has insufficient funds. Please try a different payment method.";
      case "NETWORK_ERROR":
        return "A network error occurred. Please check your internet connection and try again.";
      case "BOOKING_EXPIRED":
        return "Your booking session has expired. Please start a new booking.";
      default:
        return (
          error.message || "An unexpected error occurred. Please try again."
        );
    }
  };

  const getErrorIcon = (errorCode: string) => {
    switch (errorCode) {
      case "PAYMENT_FAILED":
      case "CARD_DECLINED":
        return "💳";
      case "INVALID_CARD_DETAILS":
        return "❌";
      case "INSUFFICIENT_FUNDS":
        return "💰";
      case "NETWORK_ERROR":
        return "🌐";
      case "BOOKING_EXPIRED":
        return "⏰";
      default:
        return "⚠️";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-md bg-white rounded-lg">
        {/* Header */}
        <div className="p-6 text-center bg-[var(--color-red)] text-white rounded-t-lg">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-white bg-opacity-20 rounded-full">
            <span className="text-3xl">{getErrorIcon(error.code)}</span>
          </div>
          <h2 className="text-2xl font-semibold font-[var(--font-inter)]">
            Payment Failed
          </h2>
          <p className="mt-2 text-[var(--color-red-100)] font-[var(--font-inter)]">
            We couldn&apos;t process your payment
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Error Message */}
          <div className="mb-6">
            <div className="p-4 border border-[var(--color-red-200)] rounded-lg bg-[var(--color-red-50)]">
              <h3 className="mb-2 font-medium text-[var(--color-red-800)] font-[var(--font-inter)]">
                Error Code: {error.code}
              </h3>
              <p className="text-sm text-[var(--color-red-700)] font-[var(--font-inter)]">
                {getErrorMessage(error.code)}
              </p>
            </div>
          </div>

          {/* Suggestions */}
          <div className="mb-6">
            <h4 className="mb-3 font-medium text-[var(--color-gray-900)] font-[var(--font-inter)]">
              What you can do:
            </h4>
            <ul className="space-y-2 text-sm text-[var(--color-gray-600)] font-[var(--font-inter)]">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-2 h-2 mt-2 mr-3 bg-[var(--color-red)] rounded-full"></span>
                <span>Check your payment details and try again</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-2 h-2 mt-2 mr-3 bg-[var(--color-red)] rounded-full"></span>
                <span>Try a different payment method</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-2 h-2 mt-2 mr-3 bg-[var(--color-red)] rounded-full"></span>
                <span>Contact your bank if the problem persists</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-2 h-2 mt-2 mr-3 bg-[var(--color-red)] rounded-full"></span>
                <span>Contact our support team for assistance</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="w-full px-4 py-3 font-medium text-white transition-colors rounded-lg bg-[var(--color-orange-500)] hover:bg-[var(--color-orange-600)] font-[var(--font-inter)]"
              >
                Try Again
              </button>
            )}

            {onTryDifferentMethod && (
              <button
                onClick={onTryDifferentMethod}
                className="w-full px-4 py-3 font-medium transition-colors rounded-lg bg-[var(--color-gray-100)] text-[var(--color-gray-700)] hover:bg-[var(--color-gray-200)] font-[var(--font-inter)]"
              >
                Try Different Payment Method
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full px-4 py-2 font-medium transition-colors rounded-lg text-[var(--color-gray-500)] hover:text-[var(--color-gray-700)] font-[var(--font-inter)]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
