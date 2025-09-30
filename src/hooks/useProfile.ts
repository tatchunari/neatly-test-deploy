import { useState, useEffect, useCallback } from "react";
import { ProfileService } from "@/services/profileService";
import { ProfileState } from "@/types/user.type";
import { ProfileFormData } from "@/utils/validation/profileValidation";

export const useProfile = () => {
  // State management
  const [state, setState] = useState<ProfileState>({
    profile: null,
    isLoading: true,
    error: null,
    isUpdating: false,
  });

  /**
   * โหลดข้อมูลโปรไฟล์
   */
  const loadProfile = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await ProfileService.getCurrentUserProfile();

      if (result.success && result.data) {
        setState((prev) => ({
          ...prev,
          profile: result.data || null,
          isLoading: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          error: result.message,
          isLoading: false,
        }));
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "ไม่สามารถโหลดข้อมูลโปรไฟล์ได้";
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
    }
  }, []);

  /**
   * อัปเดตข้อมูลโปรไฟล์
   */
  const updateProfile = useCallback(
    async (formData: ProfileFormData): Promise<boolean> => {
      if (!state.profile) return false;

      setState((prev) => ({ ...prev, isUpdating: true, error: null }));

      try {
        // ตรวจสอบ username availability (ถ้าเปลี่ยน username)
        if (formData.username !== state.profile.username) {
          const usernameResult = await ProfileService.checkUsernameAvailability(
            formData.username,
            state.profile.id
          );

          if (!usernameResult.success) {
            setState((prev) => ({
              ...prev,
              error: usernameResult.message,
              isUpdating: false,
            }));
            return false;
          }

          if (!usernameResult.data) {
            setState((prev) => ({
              ...prev,
              error: "ชื่อผู้ใช้นี้มีอยู่แล้ว",
              isUpdating: false,
            }));
            return false;
          }
        }

        // อัปเดตข้อมูล
        const result = await ProfileService.updateUserProfile(
          state.profile.id,
          {
            first_name: formData.firstName,
            last_name: formData.lastName,
            username: formData.username,
            phone: formData.phoneNumber,
            date_of_birth: formData.dateOfBirth,
            country: formData.country,
          },
          formData.profilePicture
        );

        if (result.success && result.data) {
          setState((prev) => ({
            ...prev,
            profile: result.data || null,
            isUpdating: false,
          }));
          return true;
        } else {
          setState((prev) => ({
            ...prev,
            error: result.message,
            isUpdating: false,
          }));
          return false;
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์";
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isUpdating: false,
        }));
        return false;
      }
    },
    [state.profile]
  );

  /**
   * ลบรูปโปรไฟล์
   */
  const deleteProfilePicture = useCallback(async (): Promise<boolean> => {
    if (!state.profile) return false;

    try {
      const result = await ProfileService.deleteProfilePicture(
        state.profile.id
      );

      if (result.success) {
        // อัปเดต state
        setState((prev) => ({
          ...prev,
          profile: prev.profile
            ? { ...prev.profile, profile_image: undefined }
            : null,
        }));
        return true;
      } else {
        setState((prev) => ({ ...prev, error: result.message }));
        return false;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "ไม่สามารถลบรูปโปรไฟล์ได้";
      setState((prev) => ({ ...prev, error: errorMessage }));
      return false;
    }
  }, [state.profile]);

  /**
   * เคลียร์ error
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  /**
   * Refresh ข้อมูลโปรไฟล์
   */
  const refreshProfile = useCallback(() => {
    loadProfile();
  }, [loadProfile]);

  // โหลดข้อมูลเมื่อ component mount
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    // State
    profile: state.profile,
    isLoading: state.isLoading,
    error: state.error,
    isUpdating: state.isUpdating,

    // Actions
    updateProfile,
    deleteProfilePicture,
    refreshProfile,
    clearError,
  };
};
