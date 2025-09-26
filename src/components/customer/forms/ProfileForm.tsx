import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "./form-fields/FormField";
import { Input } from "./form-fields/Input";
import { Select } from "./form-fields/Select";
import { DatePicker } from "./form-fields/DatePicker";
import { FileUpload } from "./form-fields/FileUpload";
import { Button } from "@/components/ui/Button";
import { useProfile } from "@/hooks/useProfile";
import {
  profileSchema,
  ProfileFormData,
} from "@/utils/validation/profileValidation";
import { supabase } from "@/lib/supabaseClient";

// Country options (ใช้ซ้ำกับ RegisterForm)
const COUNTRY_OPTIONS = [
  { value: "thailand", label: "Thailand" },
  { value: "singapore", label: "Singapore" },
  { value: "malaysia", label: "Malaysia" },
  { value: "indonesia", label: "Indonesia" },
  { value: "philippines", label: "Philippines" },
  { value: "vietnam", label: "Vietnam" },
  { value: "other", label: "Other" },
];

interface ProfileFormProps {
  onSuccess?: (profile: any) => void;
  onCancel?: () => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  // ใช้ Profile hook
  const {
    profile,
    isLoading,
    error,
    isUpdating,
    updateProfile,
    deleteProfilePicture,
    clearError,
  } = useProfile();

  // Local state สำหรับรูปโปรไฟล์
  const [profileImage, setProfileImage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Form setup
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      phoneNumber: "",
      dateOfBirth: "",
      country: "",
      profilePicture: undefined,
    },
  });

  const { errors } = form.formState;

  /**
   * เติมข้อมูลในฟอร์มเมื่อโหลดโปรไฟล์เสร็จ
   */
  useEffect(() => {
    if (profile) {
      setProfileImage(profile.profile_image || "");

      // ดึง email จาก auth user
      const getCurrentUserEmail = async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user?.email) {
          form.setValue("email", user.email);
        }
      };

      getCurrentUserEmail();

      // เติมข้อมูลในฟอร์ม
      form.reset({
        firstName: profile.first_name,
        lastName: profile.last_name,
        username: profile.username,
        email: "", // จะถูก set จาก auth user
        phoneNumber: profile.phone,
        dateOfBirth: profile.date_of_birth,
        country: profile.country,
      });
    }
  }, [profile, form]);

  /**
   * จัดการการส่งฟอร์ม
   */
  const onSubmit = async (data: ProfileFormData) => {
    clearError(); // เคลียร์ error ก่อน
    setSuccessMessage(""); // เคลียร์ success message

    const success = await updateProfile(data);
    if (success) {
      setSuccessMessage("อัปเดตโปรไฟล์สำเร็จ!");
      onSuccess?.(profile);

      // ซ่อน success message หลังจาก 3 วินาที
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    }
  };

  /**
   * จัดการการลบรูปโปรไฟล์
   */
  const handleDeleteProfilePicture = async () => {
    if (window.confirm("คุณต้องการลบรูปโปรไฟล์หรือไม่?")) {
      const success = await deleteProfilePicture();
      if (success) {
        setProfileImage("");
        setSuccessMessage("ลบรูปโปรไฟล์สำเร็จ!");

        // ซ่อน success message หลังจาก 3 วินาที
        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      }
    }
  };

  /**
   * จัดการการเลือกไฟล์ใหม่
   */
  const handleFileSelect = (file: File | null) => {
    if (file) {
      form.setValue("profilePicture", file);

      // แสดงรูปตัวอย่าง
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      form.setValue("profilePicture", undefined);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูลโปรไฟล์...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !profile) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 text-lg font-semibold mb-2">
          เกิดข้อผิดพลาด
        </div>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} variant="primary">
          โหลดใหม่
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <div className="flex gap-3">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onCancel}
            >
              ยกเลิก
            </Button>
          )}
          <Button
            type="button"
            variant="primary"
            size="md"
            loading={isUpdating}
            onClick={form.handleSubmit(onSubmit)}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {isUpdating ? "กำลังอัปเดต..." : "Update Profile"}
          </Button>
        </div>
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 customer-forms bg-white rounded-lg p-6 shadow-sm"
      >
        {/* Basic Information Section */}
        <div className="space-y-6">
          <h3 className="font-inter font-semibold text-[20px] leading-[150%] tracking-[-2%] text-[var(--color-gray-600)]">
            Basic Information
          </h3>

          {/* First Row: First Name & Last Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="First name" error={errors.firstName} required>
              <Input
                {...form.register("firstName")}
                error={!!errors.firstName}
                placeholder="Enter your first name"
              />
            </FormField>

            <FormField label="Last name" error={errors.lastName} required>
              <Input
                {...form.register("lastName")}
                error={!!errors.lastName}
                placeholder="Enter your last name"
              />
            </FormField>
          </div>

          {/* Second Row: Username & Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Username" error={errors.username} required>
              <Input
                {...form.register("username")}
                error={!!errors.username}
                placeholder="Enter your username"
              />
            </FormField>

            <FormField label="Email" error={errors.email} required>
              <Input
                {...form.register("email")}
                type="email"
                error={!!errors.email}
                placeholder="Enter your email"
                disabled
                readOnly
                className="bg-gray-100 cursor-not-allowed"
              />
            </FormField>
          </div>

          {/* Third Row: Phone Number & Date of Birth */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Phone number" error={errors.phoneNumber} required>
              <Input
                {...form.register("phoneNumber")}
                type="tel"
                error={!!errors.phoneNumber}
                placeholder="Enter your phone number"
              />
            </FormField>

            <FormField
              label="Date of Birth"
              error={errors.dateOfBirth}
              required
            >
              <DatePicker
                {...form.register("dateOfBirth")}
                error={!!errors.dateOfBirth}
                placeholder="Select your date of birth"
              />
            </FormField>
          </div>

          {/* Fourth Row: Country */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-1">
              <FormField label="Country" error={errors.country} required>
                <Select
                  {...form.register("country")}
                  error={!!errors.country}
                  options={COUNTRY_OPTIONS}
                  placeholder="Select your country"
                />
              </FormField>
            </div>
          </div>
        </div>

        {/* Profile Picture Section */}
        <div className="space-y-6 border-t border-gray-300 pt-[20px]">
          <h3 className="font-inter font-semibold text-[20px] leading-[150%] tracking-[-2%] text-[var(--color-gray-600)]">
            Profile Picture
          </h3>

          <div className="flex items-start gap-6">
            {/* Current Profile Picture */}
            {profileImage && (
              <div className="relative">
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                />
                <button
                  type="button"
                  onClick={handleDeleteProfilePicture}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600"
                  title="ลบรูปโปรไฟล์"
                >
                  ×
                </button>
              </div>
            )}

            {/* Upload New Picture */}
            <div className="flex-1">
              <FormField label="" error={errors.profilePicture}>
                <FileUpload
                  onFileSelect={handleFileSelect}
                  error={!!errors.profilePicture}
                />
              </FormField>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-sm text-green-600">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </form>
    </div>
  );
};
