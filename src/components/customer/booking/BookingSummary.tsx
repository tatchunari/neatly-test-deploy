import React from "react";
import { BookingCalculation } from "@/types/booking";
import { formatCurrency, formatDate } from "@/utils/bookingUtils";

interface BookingSummaryProps {
  roomInfo: {
    name: string;
    price: number;
    image?: string;
  };
  checkIn: string;
  checkOut: string;
  guests: number;
  calculation: BookingCalculation;
  specialRequests?: Array<{
    name: string;
    price: number;
  }>;
  promotionCode?: {
    code: string;
    discount: number;
  };
  timeLeft?: {
    minutes: number;
    seconds: number;
  };
}

export const BookingSummary: React.FC<BookingSummaryProps> = ({
  roomInfo,
  checkIn,
  checkOut,
  guests,
  calculation,
  specialRequests = [],
  promotionCode,
  timeLeft,
}) => {
  return (
    <div className="bg-green-900 rounded-lg p-6 text-white">
      {/* Header with Timer */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 114 0 2 2 0 01-4 0zm8 0a2 2 0 114 0 2 2 0 01-4 0z"
              clipRule="evenodd"
            />
          </svg>
          <h3 className="text-lg font-semibold font-inter">Booking Detail</h3>
        </div>

        {timeLeft && (
          <div className="bg-red text-white px-3 py-1 rounded-full text-sm font-mono font-inter">
            {timeLeft.minutes.toString().padStart(2, "0")}:
            {timeLeft.seconds.toString().padStart(2, "0")}
          </div>
        )}
      </div>

      {/* Check-in/Check-out Times */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1 font-inter">
          <span>Check-in</span>
          <span>Check-out</span>
        </div>
        <div className="flex justify-between text-sm mb-1 font-inter">
          <span>After 2:00 PM</span>
          <span>Before 12:00 PM</span>
        </div>
      </div>

      {/* Dates and Guests */}
      <div className="mb-6">
        <p className="text-sm mb-1 font-inter">
          {formatDate(checkIn)} - {formatDate(checkOut)}
        </p>
        <p className="text-sm font-inter">{guests} Guests</p>
      </div>

      {/* Price Breakdown */}
      <div className="space-y-2 mb-4">
        {/* Room Price */}
        <div className="flex justify-between text-sm font-inter">
          <span>{roomInfo.name}</span>
          <span>{formatCurrency(calculation.basePrice)}</span>
        </div>

        {/* Special Requests */}
        {specialRequests.map((request, index) => (
          <div key={index} className="flex justify-between text-sm font-inter">
            <span>{request.name}</span>
            <span>{formatCurrency(request.price)}</span>
          </div>
        ))}

        {/* Promotion Discount */}
        {promotionCode && promotionCode.discount > 0 && (
          <div className="flex justify-between text-sm text-orange-200 font-inter">
            <span>Promotion Code</span>
            <span>-{formatCurrency(promotionCode.discount)}</span>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="border-t border-green-700 pt-4">
        <div className="flex justify-between font-semibold font-inter">
          <span>Total</span>
          <span>{formatCurrency(calculation.total)}</span>
        </div>
      </div>
    </div>
  );
};
