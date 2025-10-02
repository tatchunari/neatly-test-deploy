import React, { useState } from "react";
import { PaymentMethod, CreditCardDetails } from "@/types/ิbooking";
import { PAYMENT_METHODS } from "@/constants/booking";

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
    {
      value: PAYMENT_METHODS.BANK_TRANSFER,
      label: "Bank Transfer",
      icon: "🏦",
      description: "Transfer to our bank account",
    },
    {
      value: PAYMENT_METHODS.PROMPTPAY,
      label: "PromptPay",
      icon: "📱",
      description: "Pay with PromptPay QR code",
    },
  ];

  return (
    <div className="bg-white rounded-lg p-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 font-inter">
        Payment Method
      </h2>

      {/* Payment Method Selection */}
      <div className="space-y-4 mb-8">
        <label className="block text-sm font-medium text-gray-700 font-inter">
          Choose Payment Method
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentMethodOptions.map((option) => (
            <div
              key={option.value}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                paymentMethod === option.value
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => handlePaymentMethodChange(option.value)}
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">{option.icon}</span>
                <div>
                  <h3 className="font-medium text-gray-900 font-inter">
                    {option.label}
                  </h3>
                  <p className="text-sm text-gray-600 font-inter">
                    {option.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {errors.paymentMethod && (
          <p className="text-red-500 text-sm font-inter">
            {errors.paymentMethod}
          </p>
        )}
      </div>

      {/* Credit Card Form */}
      {paymentMethod === PAYMENT_METHODS.CREDIT_CARD && (
        <div className="border-t border-gray-200 pt-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 font-inter">
            Credit Card Information
          </h3>

          <div className="space-y-4">
            {/* Card Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
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
                className={`w-full px-4 py-3 border rounded-lg font-inter focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.creditCard?.cardNumber
                    ? "border-red-500"
                    : "border-gray-300 focus:border-orange-500"
                }`}
              />
              {errors.creditCard?.cardNumber && (
                <p className="text-red-500 text-sm mt-1 font-inter">
                  {errors.creditCard.cardNumber}
                </p>
              )}
            </div>

            {/* Card Holder Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                Cardholder Name
              </label>
              <input
                type="text"
                value={creditCardDetails.cardOwner}
                onChange={(e) =>
                  handleCreditCardChange("cardOwner", e.target.value)
                }
                placeholder="John Doe"
                className={`w-full px-4 py-3 border rounded-lg font-inter focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.creditCard?.cardholderName
                    ? "border-red-500"
                    : "border-gray-300 focus:border-orange-500"
                }`}
              />
              {errors.creditCard?.cardholderName && (
                <p className="text-red-500 text-sm mt-1 font-inter">
                  {errors.creditCard.cardholderName}
                </p>
              )}
            </div>

            {/* Expiry Date and CVV */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
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
                  className={`w-full px-4 py-3 border rounded-lg font-inter focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    errors.creditCard?.expiryDate
                      ? "border-red-500"
                      : "border-gray-300 focus:border-orange-500"
                  }`}
                />
                {errors.creditCard?.expiryDate && (
                  <p className="text-red-500 text-sm mt-1 font-inter">
                    {errors.creditCard.expiryDate}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
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
                  className={`w-full px-4 py-3 border rounded-lg font-inter focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    errors.creditCard?.cvc
                      ? "border-red-500"
                      : "border-gray-300 focus:border-orange-500"
                  }`}
                />
                {errors.creditCard?.cvc && (
                  <p className="text-red-500 text-sm mt-1 font-inter">
                    {errors.creditCard.cvc}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Promotion Code */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 font-inter">
          Promotion Code
        </h3>

        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => onPromoCodeChange(e.target.value)}
              placeholder="Enter promotion code"
              className={`w-full px-4 py-3 border rounded-lg font-inter focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.promoCode
                  ? "border-red-500"
                  : "border-gray-300 focus:border-orange-500"
              }`}
            />
            {errors.promoCode && (
              <p className="text-red-500 text-sm mt-1 font-inter">
                {errors.promoCode}
              </p>
            )}
          </div>

          <button
            onClick={onPromoCodeApply}
            disabled={!promoCode.trim() || promoCodeApplied}
            className={`px-6 py-3 rounded-lg font-medium transition-colors font-inter ${
              !promoCode.trim() || promoCodeApplied
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-orange-500 text-white hover:bg-orange-600"
            }`}
          >
            {promoCodeApplied ? "Applied" : "Apply"}
          </button>
        </div>

        {promoCodeApplied && promoDiscount > 0 && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 font-inter">
              🎉 Promotion code applied! You saved {promoDiscount} THB
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
