import React from "react";
import { BookingConfirmation } from "@/types/ิbooking";
import { formatCurrency, formatDate } from "@/utils/bookingUtils";

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  confirmation: BookingConfirmation;
  guests: number; // เพิ่มบรรทัดนี้
  paymentMethod: string; // เพิ่มบรรทัดนี้
  onViewBooking?: () => void;
  onNewBooking?: () => void;
}

export const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
  isOpen,
  onClose,
  confirmation,
  guests, // เพิ่มบรรทัดนี้
  paymentMethod, // เพิ่มบรรทัดนี้
  onViewBooking,
  onNewBooking,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-green-500 text-white p-6 rounded-t-lg text-center">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold font-inter">
            Payment Successful!
          </h2>
          <p className="text-green-100 mt-2 font-inter">
            Your booking has been confirmed
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Booking Details */}
          <div className="space-y-4 mb-6">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 font-inter">
                Booking Confirmation
              </h3>
              <p className="text-2xl font-bold text-green-600 font-inter">
                #{confirmation.bookingId}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 font-inter">Room:</span>
                <span className="font-medium font-inter">
                  {confirmation.roomType}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 font-inter">Check-in:</span>
                <span className="font-medium font-inter">
                  {formatDate(confirmation.checkIn)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 font-inter">Check-out:</span>
                <span className="font-medium font-inter">
                  {formatDate(confirmation.checkOut)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 font-inter">Guests:</span>
                <span className="font-medium font-inter">{guests}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 font-inter">Total:</span>
                <span className="font-bold text-lg text-green-600 font-inter">
                  {formatCurrency(confirmation.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-2 font-inter">
              Payment Method
            </h4>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-700 font-inter">
                {paymentMethod === "credit_card" && "💳 Credit Card"}
                {paymentMethod === "cash" && "💵 Cash"}
                {paymentMethod === "bank_transfer" && "🏦 Bank Transfer"}
                {paymentMethod === "promptpay" && "📱 PromptPay"}
              </p>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3 font-inter">
              What's Next?
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 font-inter">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Confirmation email sent to your email address</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Check-in after 2:00 PM on your arrival date</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span>Bring a valid ID for check-in</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {onViewBooking && (
              <button
                onClick={onViewBooking}
                className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors font-inter"
              >
                View My Booking
              </button>
            )}

            {onNewBooking && (
              <button
                onClick={onNewBooking}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors font-inter"
              >
                Make Another Booking
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
