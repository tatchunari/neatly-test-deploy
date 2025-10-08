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
          className="text-base font-medium transition-colors text-[var(--color-orange-500)] hover:text-[var(--color-orange-600)] font-[var(--font-inter)]"
        >
          Back
        </button>
      )}

      {/* Next/Confirm Button */}
      <button
        onClick={onNext || onConfirm}
        disabled={disabled || loading}
        className={`px-8 py-4 h-12 min-w-[101px] rounded text-base font-medium transition-colors font-[var(--font-inter)] ${
          !onNext && onConfirm // If it's a confirm button, use orange-600
            ? disabled || loading
              ? "bg-[var(--color-gray-300)] text-[var(--color-gray-500)] cursor-not-allowed"
              : "bg-[var(--color-orange-600)] text-white hover:bg-[var(--color-orange-700)]"
            : disabled || loading
            ? "bg-[var(--color-gray-300)] text-[var(--color-gray-500)] cursor-not-allowed"
            : "bg-[var(--color-orange-500)] text-white hover:bg-[var(--color-orange-600)]"
        }`}
      >
        {loading ? "Loading..." : nextLabel}
      </button>
    </div>
  );
};
