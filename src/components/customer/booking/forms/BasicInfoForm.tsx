import React, { useEffect } from "react";
import { GuestInfo } from "@/types/booking";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/lib/supabaseClient";

interface BasicInfoFormProps {
  guestInfo: GuestInfo;
  onGuestInfoChange: (guestInfo: GuestInfo) => void;
}

export const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  guestInfo,
  onGuestInfoChange,
}) => {
  const { profile, isLoading } = useProfile();

  // Load profile data when available
  useEffect(() => {
    if (profile) {
      const loadProfileData = async () => {
        // Get email from auth
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const updatedGuestInfo: GuestInfo = {
          firstName: profile.first_name || "",
          lastName: profile.last_name || "",
          email: user?.email || "",
          phone: profile.phone || "",
          dateOfBirth: profile.date_of_birth || "",
          country: profile.country || "",
        };

        onGuestInfoChange(updatedGuestInfo);
      };

      loadProfileData();
    }
  }, [profile, onGuestInfoChange]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getCountryLabel = (value: string) => {
    const countries = [
      { value: "thailand", label: "Thailand" },
      { value: "singapore", label: "Singapore" },
      { value: "malaysia", label: "Malaysia" },
      { value: "indonesia", label: "Indonesia" },
      { value: "philippines", label: "Philippines" },
      { value: "vietnam", label: "Vietnam" },
      { value: "other", label: "Other" },
    ];
    return countries.find((c) => c.value === value)?.label || value;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-8">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-inter">
              Loading profile data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 font-inter">
        Basic Information
      </h2>

      <div className="space-y-6">
        {/* First Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
              First name
            </label>
            <div className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-inter">
              {guestInfo.firstName}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
              Last name
            </label>
            <div className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-inter">
              {guestInfo.lastName}
            </div>
          </div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
              Email
            </label>
            <div className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-inter">
              {guestInfo.email}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
              Phone number
            </label>
            <div className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-inter">
              {guestInfo.phone}
            </div>
          </div>
        </div>

        {/* Third Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
              Date of Birth
            </label>
            <div className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-inter">
              {formatDate(guestInfo.dateOfBirth)}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
              Country
            </label>
            <div className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-inter">
              {getCountryLabel(guestInfo.country)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
