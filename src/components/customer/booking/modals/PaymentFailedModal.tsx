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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="bg-red-500 text-white p-6 rounded-t-lg text-center">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">{getErrorIcon(error.code)}</span>
          </div>
          <h2 className="text-2xl font-semibold font-inter">Payment Failed</h2>
          <p className="text-red-100 mt-2 font-inter">
            We couldn't process your payment
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Error Message */}
          <div className="mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-medium text-red-800 mb-2 font-inter">
                Error Code: {error.code}
              </h3>
              <p className="text-red-700 text-sm font-inter">
                {getErrorMessage(error.code)}
              </p>
            </div>
          </div>

          {/* Suggestions */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3 font-inter">
              What you can do:
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 font-inter">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Check your payment details and try again</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Try a different payment method</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Contact your bank if the problem persists</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Contact our support team for assistance</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors font-inter"
              >
                Try Again
              </button>
            )}

            {onTryDifferentMethod && (
              <button
                onClick={onTryDifferentMethod}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors font-inter"
              >
                Try Different Payment Method
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full text-gray-500 py-2 px-4 rounded-lg font-medium hover:text-gray-700 transition-colors font-inter"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
