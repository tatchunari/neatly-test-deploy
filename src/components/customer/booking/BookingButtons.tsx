import React from "react";

interface BookingButtonsProps {
  onBack?: () => void;
  onNext?: () => void;
  onConfirm?: () => void;
  nextLabel?: string;
  showBack?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

export const BookingButtons: React.FC<BookingButtonsProps> = ({
  onBack,
  onNext,
  onConfirm,
  nextLabel = "Next",
  showBack = true,
  disabled = false,
  loading = false,
}) => {
  return (
    <div className="flex justify-between mt-8">
      {/* Back Button */}
      {showBack && (
        <button
          onClick={onBack}
          className="text-orange-500 hover:text-orange-600 transition-colors font-inter"
        >
          Back
        </button>
      )}

      {/* Next/Confirm Button */}
      <button
        onClick={onNext || onConfirm}
        disabled={disabled || loading}
        className={`px-8 py-3 rounded-lg font-medium transition-colors font-inter ${
          disabled || loading
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-orange-500 text-white hover:bg-orange-600"
        }`}
      >
        {loading ? "Loading..." : nextLabel}
      </button>
    </div>
  );
};
