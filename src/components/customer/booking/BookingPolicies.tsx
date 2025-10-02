import React from "react";
import { BOOKING_POLICIES } from "@/constants/booking";

export const BookingPolicies: React.FC = () => {
  return (
    <div className="bg-white rounded-lg p-6 mt-6">
      <div className="space-y-2 text-sm text-gray-700 font-inter">
        <div className="flex items-start">
          <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
          <span>{BOOKING_POLICIES.refund_policy}</span>
        </div>
        <div className="flex items-start">
          <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
          <span>{BOOKING_POLICIES.change_policy}</span>
        </div>
      </div>
    </div>
  );
};
