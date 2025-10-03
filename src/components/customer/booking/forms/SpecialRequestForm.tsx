import React from "react";
import { SpecialRequest } from "@/types/booking";
import { SPECIAL_REQUESTS } from "@/constants/booking";
import { formatCurrency } from "@/utils/bookingUtils";

interface SpecialRequestFormProps {
  specialRequests: SpecialRequest[];
  onSpecialRequestsChange: (requests: SpecialRequest[]) => void;
  additionalRequest: string;
  onAdditionalRequestChange: (request: string) => void;
}

export const SpecialRequestForm: React.FC<SpecialRequestFormProps> = ({
  specialRequests,
  onSpecialRequestsChange,
  additionalRequest,
  onAdditionalRequestChange,
}) => {
  const handleRequestToggle = (requestId: string) => {
    const updatedRequests = specialRequests.map((request) =>
      request.id === requestId
        ? { ...request, selected: !request.selected }
        : request
    );
    onSpecialRequestsChange(updatedRequests);
  };

  const selectedRequests = specialRequests.filter((req) => req.selected);
  const totalSpecialRequestsPrice = selectedRequests.reduce(
    (sum, req) => sum + (req.price || 0),
    0
  );

  return (
    <div className="bg-white rounded-lg p-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 font-inter">
        Special Request
      </h2>

      {/* Special Requests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {SPECIAL_REQUESTS.map((request) => {
          const isSelected =
            specialRequests.find((req) => req.id === request.id)?.selected ||
            false;

          return (
            <div
              key={request.id}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => handleRequestToggle(request.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 font-inter">
                    {request.name}
                  </h3>
                  <p className="text-sm text-gray-600 font-inter">
                    {formatCurrency(request.price || 0)}
                  </p>
                </div>

                {/* Checkbox */}
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    isSelected
                      ? "border-orange-500 bg-orange-500"
                      : "border-gray-300"
                  }`}
                >
                  {isSelected && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Requests Summary */}
      {selectedRequests.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gray-900 mb-3 font-inter">
            Selected Requests
          </h3>
          <div className="space-y-2">
            {selectedRequests.map((request) => (
              <div
                key={request.id}
                className="flex justify-between items-center text-sm font-inter"
              >
                <span className="text-gray-700">{request.name}</span>
                <span className="text-gray-900 font-medium">
                  {formatCurrency(request.price || 0)}
                </span>
              </div>
            ))}
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between items-center font-medium font-inter">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">
                  {formatCurrency(totalSpecialRequestsPrice)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Additional Request */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
          Additional Request
        </label>
        <textarea
          value={additionalRequest}
          onChange={(e) => onAdditionalRequestChange(e.target.value)}
          placeholder="Please specify any additional requests or special needs..."
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg font-inter focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
        />
        <p className="text-xs text-gray-500 mt-1 font-inter">
          Please note: Additional requests are subject to availability and may
          incur extra charges.
        </p>
      </div>

      {/* Skip Button */}
      <div className="mt-6 text-center">
        <button
          onClick={() => {
            // Clear all selections and additional request
            const clearedRequests = specialRequests.map((req) => ({
              ...req,
              selected: false,
            }));
            onSpecialRequestsChange(clearedRequests);
            onAdditionalRequestChange("");
          }}
          className="text-orange-500 hover:text-orange-600 transition-colors font-inter text-sm underline"
        >
          Skip Special Requests
        </button>
      </div>
    </div>
  );
};
