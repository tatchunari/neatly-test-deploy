import React, { useState } from "react";
import { PaymentMethod, CreditCardDetails } from "@/types/booking";
import { PAYMENT_METHODS } from "@/constants/booking";
import { BookingButtons } from "../BookingButtons";

interface PaymentMethodFormProps {
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  creditCardDetails: CreditCardDetails;
  onCreditCardDetailsChange: (details: CreditCardDetails) => void;
  promoCode: string;
  onPromoCodeChange: (code: string) => void;
  onPromoCodeApply: () => void;
  promoCodeApplied: boolean;
  promoDiscount: number;
  onBack?: () => void;
  onConfirm?: () => void;
  disabled?: boolean;
  loading?: boolean;
  errors?: {
    paymentMethod?: string;
    creditCard?: Record<string, string>;
    promoCode?: string;
  };
}

export const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({
  paymentMethod,
  onPaymentMethodChange,
  creditCardDetails,
  onCreditCardDetailsChange,
  promoCode,
  onPromoCodeChange,
  onPromoCodeApply,
  promoCodeApplied,
  promoDiscount,
  onBack,
  onConfirm,
  disabled = false,
  loading = false,
  errors = {},
}) => {
  const [showCreditCardForm, setShowCreditCardForm] = useState(false);

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    onPaymentMethodChange(method);
    setShowCreditCardForm(method === PAYMENT_METHODS.CREDIT_CARD);
  };

  const handleCreditCardChange = (
    field: keyof CreditCardDetails,
    value: string
  ) => {
    onCreditCardDetailsChange({
      ...creditCardDetails,
      [field]: value,
    });
  };

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");
    // Add spaces every 4 digits
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const formatExpiryDate = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");
    // Add slash after 2 digits
    if (digits.length >= 2) {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
    }
    return digits;
  };

  const paymentMethodOptions = [
    {
      value: PAYMENT_METHODS.CREDIT_CARD,
      label: "Credit Card",
      icon: "💳",
      description: "Pay securely with your credit card",
    },
    {
      value: PAYMENT_METHODS.CASH,
      label: "Cash",
      icon: "💵",
      description: "Pay in cash at the hotel",
    },
  ];

  return (
    <div className="p-8 space-y-8 border rounded-lg bg-[var(--color-white)] border-[var(--color-gray-300)]">
      <h2 className="text-xl font-semibold text-[var(--color-gray-800)] mb-6 font-[var(--font-inter)]">
        Payment Method
      </h2>

      {/* Payment Method Selection */}
      <div className="space-y-4 mb-8">
        <label className="block text-sm font-medium text-[var(--color-gray-700)] font-[var(--font-inter)]">
          Choose Payment Method
        </label>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {paymentMethodOptions.map((option) => (
            <div
              key={option.value}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                paymentMethod === option.value
                  ? "border-[var(--color-orange-500)] bg-[var(--color-orange-50)]"
                  : "border-[var(--color-gray-200)] hover:border-[var(--color-gray-300)]"
              }`}
              onClick={() => handlePaymentMethodChange(option.value)}
            >
              <div className="flex items-center">
                <span className="mr-3 text-2xl">{option.icon}</span>
                <div>
                  <h3 className="font-medium text-[var(--color-gray-900)] font-[var(--font-inter)]">
                    {option.label}
                  </h3>
                  <p className="text-sm text-[var(--color-gray-600)] font-[var(--font-inter)]">
                    {option.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {errors.paymentMethod && (
          <p className="text-sm text-[var(--color-red)] font-[var(--font-inter)]">
            {errors.paymentMethod}
          </p>
        )}
      </div>

      {/* Credit Card Form */}
      {paymentMethod === PAYMENT_METHODS.CREDIT_CARD && (
        <div className="pt-6 mb-6 border-t border-[var(--color-gray-200)]">
          <h3 className="mb-4 text-lg font-medium text-[var(--color-gray-900)] font-[var(--font-inter)]">
            Credit Card Information
          </h3>

          <div className="space-y-4">
            {/* Card Number */}
            <div>
              <label className="block mb-2 text-sm font-medium text-[var(--color-gray-700)] font-[var(--font-inter)]">
                Card Number
              </label>
              <input
                type="text"
                value={creditCardDetails.cardNumber}
                onChange={(e) => {
                  const formatted = formatCardNumber(e.target.value);
                  handleCreditCardChange("cardNumber", formatted);
                }}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-orange-500)] font-[var(--font-inter)] ${
                  errors.creditCard?.cardNumber
                    ? "border-[var(--color-red)]"
                    : "border-[var(--color-gray-300)] focus:border-[var(--color-orange-500)]"
                }`}
              />
              {errors.creditCard?.cardNumber && (
                <p className="mt-1 text-sm text-[var(--color-red)] font-[var(--font-inter)]">
                  {errors.creditCard.cardNumber}
                </p>
              )}
            </div>

            {/* Card Holder Name */}
            <div>
              <label className="block mb-2 text-sm font-medium text-[var(--color-gray-700)] font-[var(--font-inter)]">
                Cardholder Name
              </label>
              <input
                type="text"
                value={creditCardDetails.cardOwner}
                onChange={(e) =>
                  handleCreditCardChange("cardOwner", e.target.value)
                }
                placeholder="John Doe"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-orange-500)] font-[var(--font-inter)] ${
                  errors.creditCard?.cardholderName
                    ? "border-[var(--color-red)]"
                    : "border-[var(--color-gray-300)] focus:border-[var(--color-orange-500)]"
                }`}
              />
              {errors.creditCard?.cardholderName && (
                <p className="mt-1 text-sm text-[var(--color-red)] font-[var(--font-inter)]">
                  {errors.creditCard.cardholderName}
                </p>
              )}
            </div>

            {/* Expiry Date and CVV */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-medium text-[var(--color-gray-700)] font-[var(--font-inter)]">
                  Expiry Date
                </label>
                <input
                  type="text"
                  value={creditCardDetails.expiryDate}
                  onChange={(e) => {
                    const formatted = formatExpiryDate(e.target.value);
                    handleCreditCardChange("expiryDate", formatted);
                  }}
                  placeholder="MM/YY"
                  maxLength={5}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-orange-500)] font-[var(--font-inter)] ${
                    errors.creditCard?.expiryDate
                      ? "border-[var(--color-red)]"
                      : "border-[var(--color-gray-300)] focus:border-[var(--color-orange-500)]"
                  }`}
                />
                {errors.creditCard?.expiryDate && (
                  <p className="mt-1 text-sm text-[var(--color-red)] font-[var(--font-inter)]">
                    {errors.creditCard.expiryDate}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-[var(--color-gray-700)] font-[var(--font-inter)]">
                  CVV
                </label>
                <input
                  type="text"
                  value={creditCardDetails.cvc}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "");
                    handleCreditCardChange("cvc", digits);
                  }}
                  placeholder="123"
                  maxLength={4}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-orange-500)] font-[var(--font-inter)] ${
                    errors.creditCard?.cvc
                      ? "border-[var(--color-red)]"
                      : "border-[var(--color-gray-300)] focus:border-[var(--color-orange-500)]"
                  }`}
                />
                {errors.creditCard?.cvc && (
                  <p className="mt-1 text-sm text-[var(--color-red)] font-[var(--font-inter)]">
                    {errors.creditCard.cvc}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Promotion Code */}
      <div className="pt-6 border-t border-[var(--color-gray-200)]">
        <h3 className="mb-4 text-lg font-medium text-[var(--color-gray-900)] font-[var(--font-inter)]">
          Promotion Code
        </h3>

        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => onPromoCodeChange(e.target.value)}
              placeholder="Enter promotion code"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-orange-500)] font-[var(--font-inter)] ${
                errors.promoCode
                  ? "border-[var(--color-red)]"
                  : "border-[var(--color-gray-300)] focus:border-[var(--color-orange-500)]"
              }`}
            />
            {errors.promoCode && (
              <p className="mt-1 text-sm text-[var(--color-red)] font-[var(--font-inter)]">
                {errors.promoCode}
              </p>
            )}
          </div>

          <button
            onClick={onPromoCodeApply}
            disabled={!promoCode.trim() || promoCodeApplied}
            className={`px-6 py-3 rounded-lg font-medium transition-colors font-[var(--font-inter)] ${
              !promoCode.trim() || promoCodeApplied
                ? "bg-[var(--color-gray-300)] text-[var(--color-gray-500)] cursor-not-allowed"
                : "bg-[var(--color-orange-500)] text-white hover:bg-[var(--color-orange-600)]"
            }`}
          >
            {promoCodeApplied ? "Applied" : "Apply"}
          </button>
        </div>

        {promoCodeApplied && promoDiscount > 0 && (
          <div className="p-4 mt-4 border border-[var(--color-green-200)] rounded-lg bg-[var(--color-green-50)]">
            <p className="text-[var(--color-green-700)] font-[var(--font-inter)]">
              🎉 Promotion code applied! You saved {promoDiscount} THB
            </p>
          </div>
        )}
      </div>

      {/* BookingButtons */}
      <BookingButtons
        onBack={onBack}
        onConfirm={onConfirm}
        nextLabel="Confirm Booking"
        showBack={true}
        disabled={disabled}
        loading={loading}
      />
    </div>
  );
};
