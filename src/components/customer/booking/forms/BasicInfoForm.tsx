import React from "react";
import { GuestInfo } from "@/types/booking";
import { BookingButtons } from "../BookingButtons";

interface BasicInfoFormProps {
  guestInfo: GuestInfo;
  onBack?: () => void;
  onNext?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const COUNTRY_OPTIONS = [
  { value: "thailand", label: "Thailand" },
  { value: "singapore", label: "Singapore" },
  { value: "malaysia", label: "Malaysia" },
  { value: "indonesia", label: "Indonesia" },
  { value: "philippines", label: "Philippines" },
  { value: "vietnam", label: "Vietnam" },
  { value: "other", label: "Other" },
];

export const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  guestInfo,
  onBack,
  onNext,
  disabled = false,
  loading = false,
}) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getCountryLabel = (countryCode: string) => {
    const country = COUNTRY_OPTIONS.find((c) => c.value === countryCode);
    return country ? country.label : countryCode;
  };

  return (
    <div className="w-full p-6 space-y-8 border rounded md:w-[740px] md:p-10 bg-[var(--color-white)] border-[var(--color-gray-300)]">
      <h3 className="text-xl font-semibold leading-normal tracking-tight text-[var(--color-gray-800)] font-[var(--font-inter)]">
        Basic Information
      </h3>

      <div className="space-y-6">
        {/* First Row - First Name & Last Name */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-base font-normal leading-normal tracking-normal text-[var(--color-gray-900)] font-[var(--font-inter)]">
              First name
            </label>
            <div className="flex items-center w-full h-12 px-3 py-3 border rounded bg-[var(--color-white)] border-[var(--color-gray-400)] text-base font-normal leading-normal tracking-normal text-[var(--color-black)] font-[var(--font-inter)]">
              {guestInfo.firstName}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-base font-normal leading-normal tracking-normal text-[var(--color-gray-900)] font-[var(--font-inter)]">
              Last name
            </label>
            <div className="flex items-center w-full h-12 px-3 py-3 border rounded bg-[var(--color-white)] border-[var(--color-gray-400)] text-base font-normal leading-normal tracking-normal text-[var(--color-black)] font-[var(--font-inter)]">
              {guestInfo.lastName}
            </div>
          </div>
        </div>

        {/* Second Row - Email */}
        <div className="space-y-2">
          <label className="block text-base font-normal leading-normal tracking-normal text-[var(--color-gray-900)] font-[var(--font-inter)]">
            Email
          </label>
          <div className="flex items-center w-full h-12 px-3 py-3 border rounded bg-[var(--color-white)] border-[var(--color-gray-400)] text-base font-normal leading-normal tracking-normal text-[var(--color-black)] font-[var(--font-inter)]">
            {guestInfo.email}
          </div>
        </div>

        {/* Third Row - Phone number */}
        <div className="space-y-2">
          <label className="block text-base font-normal leading-normal tracking-normal text-[var(--color-gray-900)] font-[var(--font-inter)]">
            Phone number
          </label>
          <div className="flex items-center w-full h-12 px-3 py-3 border rounded bg-[var(--color-white)] border-[var(--color-gray-400)] text-base font-normal leading-normal tracking-normal text-[var(--color-black)] font-[var(--font-inter)]">
            {guestInfo.phone}
          </div>
        </div>

        {/* Fourth Row - Date of Birth */}
        <div className="space-y-2">
          <label className="block text-base font-normal leading-normal tracking-normal text-[var(--color-gray-900)] font-[var(--font-inter)]">
            Date of Birth
          </label>
          <div className="flex items-center w-full h-12 px-3 py-3 border rounded bg-[var(--color-white)] border-[var(--color-gray-400)] text-base font-normal leading-normal tracking-normal text-[var(--color-black)] font-[var(--font-inter)]">
            {formatDate(guestInfo.dateOfBirth)}
          </div>
        </div>

        {/* Fifth Row - Country */}
        <div className="space-y-2">
          <label className="block text-base font-normal leading-normal tracking-normal text-[var(--color-gray-900)] font-[var(--font-inter)]">
            Country
          </label>
          <div className="flex items-center w-full h-12 px-3 py-3 border rounded bg-[var(--color-white)] border-[var(--color-gray-400)] text-base font-normal leading-normal tracking-normal text-[var(--color-black)] font-[var(--font-inter)]">
            {getCountryLabel(guestInfo.country)}
          </div>
        </div>
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
