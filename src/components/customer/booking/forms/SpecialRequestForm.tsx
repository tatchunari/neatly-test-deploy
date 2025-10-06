import React from "react";
import { SpecialRequest } from "@/types/booking";
import { SPECIAL_REQUESTS } from "@/constants/booking";
import { formatCurrency } from "@/utils/bookingUtils";
import { BookingButtons } from "../BookingButtons";

interface SpecialRequestFormProps {
  specialRequests: SpecialRequest[];
  onSpecialRequestsChange: (requests: SpecialRequest[]) => void;
  additionalRequest: string;
  onAdditionalRequestChange: (request: string) => void;
  onBack?: () => void;
  onNext?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export const SpecialRequestForm: React.FC<SpecialRequestFormProps> = ({
  specialRequests,
  onSpecialRequestsChange,
  additionalRequest,
  onAdditionalRequestChange,
  onBack,
  onNext,
  disabled = false,
  loading = false,
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
    <div className="p-8 space-y-8 border rounded-lg bg-[var(--color-white)] border-[var(--color-gray-300)]">
      <h2 className="text-xl font-semibold text-[var(--color-gray-800)] mb-6 font-[var(--font-inter)]">
        Special Request
      </h2>

      {/* Special Requests Grid */}
      <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-2 lg:grid-cols-3">
        {SPECIAL_REQUESTS.map((request) => {
          const isSelected =
            specialRequests.find((req) => req.id === request.id)?.selected ||
            false;

          return (
            <div
              key={request.id}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                isSelected
                  ? "border-[var(--color-orange-500)] bg-[var(--color-orange-50)]"
                  : "border-[var(--color-gray-200)] hover:border-[var(--color-gray-300)]"
              }`}
              onClick={() => handleRequestToggle(request.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-[var(--color-gray-900)] font-[var(--font-inter)]">
                    {request.name}
                  </h3>
                  <p className="text-sm text-[var(--color-gray-600)] font-[var(--font-inter)]">
                    {formatCurrency(request.price || 0)}
                  </p>
                </div>

                {/* Checkbox */}
                <div
                  className={`flex items-center justify-center w-5 h-5 border-2 rounded ${
                    isSelected
                      ? "border-[var(--color-orange-500)] bg-[var(--color-orange-500)]"
                      : "border-[var(--color-gray-300)]"
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
        <div className="p-4 mb-6 border rounded-lg bg-[var(--color-gray-50)]">
          <h3 className="mb-3 font-medium text-[var(--color-gray-900)] font-[var(--font-inter)]">
            Selected Requests
          </h3>
          <div className="space-y-2">
            {selectedRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between text-sm font-[var(--font-inter)]"
              >
                <span className="text-[var(--color-gray-700)]">{request.name}</span>
                <span className="font-medium text-[var(--color-gray-900)]">
                  {formatCurrency(request.price || 0)}
                </span>
              </div>
            ))}
            <div className="pt-2 mt-2 border-t border-[var(--color-gray-200)]">
              <div className="flex items-center justify-between font-medium font-[var(--font-inter)]">
                <span className="text-[var(--color-gray-900)]">Total</span>
                <span className="text-[var(--color-gray-900)]">
                  {formatCurrency(totalSpecialRequestsPrice)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Additional Request */}
      <div>
        <label className="block mb-2 text-sm font-medium text-[var(--color-gray-700)] font-[var(--font-inter)]">
          Additional Request
        </label>
        <textarea
          value={additionalRequest}
          onChange={(e) => onAdditionalRequestChange(e.target.value)}
          placeholder="Please specify any additional requests or special needs..."
          rows={4}
          className="w-full px-4 py-3 border border-[var(--color-gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-orange-500)] focus:border-[var(--color-orange-500)] resize-none font-[var(--font-inter)]"
        />
        <p className="mt-1 text-xs text-[var(--color-gray-500)] font-[var(--font-inter)]">
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
          className="text-sm font-medium underline transition-colors text-[var(--color-orange-500)] hover:text-[var(--color-orange-600)] font-[var(--font-inter)]"
        >
          Skip Special Requests
        </button>
      </div>

      {/* BookingButtons */}
      <BookingButtons
        onBack={onBack}
        onNext={onNext}
        nextLabel="Next"
        showBack={true}
        disabled={disabled}
        loading={loading}
      />
    </div>
  );
};
