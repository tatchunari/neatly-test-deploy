import { supabase } from "@/lib/supabaseClient";
import { UserProfile } from "../types/user.type";

// เพิ่ม interface สำหรับ response
interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  message: string;
}

export class ProfileService {
  /**
   * ดึงข้อมูลโปรไฟล์ผู้ใช้ปัจจุบัน
   * @returns Promise<ServiceResponse<UserProfile>>
   */
  static async getCurrentUserProfile(): Promise<ServiceResponse<UserProfile>> {
    try {
      // 1. ดึงข้อมูล user จาก Supabase Auth
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error("Auth error:", authError);
        return {
          success: false,
          message: "ไม่สามารถดึงข้อมูลผู้ใช้ได้",
        };
      }

      // 2. ดึงข้อมูล profile จาก profiles table
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Profile error:", profileError);
        return {
          success: false,
          message: "ไม่สามารถดึงข้อมูลโปรไฟล์ได้",
        };
      }

      return {
        success: true,
        data: profileData || null, // เพิ่ม || null
        message: "ดึงข้อมูลโปรไฟล์สำเร็จ",
      };
    } catch (error) {
      console.error("Get user profile error:", error);
      return {
        success: false,
        message: "เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์",
      };
    }
  }

  /**
   * อัปเดตข้อมูลโปรไฟล์ผู้ใช้
   * @param userId - ID ของผู้ใช้
   * @param profileData - ข้อมูลโปรไฟล์ใหม่
   * @param profilePicture - รูปโปรไฟล์ใหม่ (optional)
   * @returns Promise<ServiceResponse<UserProfile>>
   */
  static async updateUserProfile(
    userId: string,
    profileData: Partial<UserProfile>,
    profilePicture?: File
  ): Promise<ServiceResponse<UserProfile>> {
    try {
      let updatedProfile = { ...profileData };

      // 1. อัปโหลดรูปโปรไฟล์ใหม่ (ถ้ามี)
      if (profilePicture) {
        const uploadResult = await this.uploadProfilePicture(
          profilePicture,
          userId
        );

        if (!uploadResult.success) {
          return {
            success: false,
            message: uploadResult.message,
          };
        }

        updatedProfile.profile_image = uploadResult.data;
      }

      // 2. อัปเดตข้อมูลใน profiles table
      const { data, error } = await supabase
        .from("profiles")
        .update(updatedProfile)
        .eq("id", userId)
        .select()
        .single();

      if (error) {
        console.error("Update profile error:", error);
        return {
          success: false,
          message: error.message,
        };
      }

      // 3. อัปเดตข้อมูลใน auth.users metadata
      if (
        profileData.first_name ||
        profileData.last_name ||
        profileData.username
      ) {
        const { error: authError } = await supabase.auth.updateUser({
          data: {
            first_name: profileData.first_name,
            last_name: profileData.last_name,
            username: profileData.username,
            phone_number: profileData.phone,
            date_of_birth: profileData.date_of_birth,
            country: profileData.country,
          },
        });

        if (authError) {
          console.error("Auth update error:", authError);
          // ไม่ return error เพราะข้อมูลหลักอัปเดตแล้ว
        }
      }

      return {
        success: true,
        data,
        message: "อัปเดตโปรไฟล์สำเร็จ",
      };
    } catch (error) {
      console.error("Update user profile error:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์",
      };
    }
  }

  /**
   * อัปโหลดรูปโปรไฟล์ (ใช้ Path Structure)
   * @param file - ไฟล์รูปภาพ
   * @param userId - ID ของผู้ใช้
   * @returns Promise<ServiceResponse<string>>
   */
  static async uploadProfilePicture(
    file: File,
    userId: string
  ): Promise<ServiceResponse<string>> {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `avatar.${fileExt}`;
      const filePath = `profile-pictures/${userId}/${fileName}`;

      // 1. ลบโฟลเดอร์เก่าทั้งหมด (ถ้ามี)
      const { data: existingFiles } = await supabase.storage
        .from("profile-pictures")
        .list(`${userId}/`);

      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map(
          (file) => `${userId}/${file.name}`
        );
        const { error: deleteError } = await supabase.storage
          .from("profile-pictures")
          .remove(filesToDelete);

        if (deleteError) {
          console.error("Delete old files error:", deleteError);
          // ไม่ return error เพราะอาจไม่มีไฟล์อยู่แล้ว
        }
      }

      // 2. อัปโหลดไฟล์ใหม่
      const { data, error } = await supabase.storage
        .from("profile-pictures")
        .upload(filePath, file);

      if (error) {
        console.error("Upload error:", error);
        return {
          success: false,
          message: error.message,
        };
      }

      // 3. ดึง public URL
      const { data: urlData } = supabase.storage
        .from("profile-pictures")
        .getPublicUrl(filePath);

      return {
        success: true,
        data: urlData.publicUrl,
        message: "อัปโหลดรูปโปรไฟล์สำเร็จ",
      };
    } catch (error) {
      console.error("Upload profile picture error:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "เกิดข้อผิดพลาดในการอัปโหลดรูปโปรไฟล์",
      };
    }
  }

  /**
   * ลบรูปโปรไฟล์ (ใช้ข้อมูลจาก DB)
   * @param userId - ID ของผู้ใช้
   * @returns Promise<ServiceResponse<void>>
   */
  static async deleteProfilePicture(
    userId: string
  ): Promise<ServiceResponse<void>> {
    try {
      // 1. ดึงข้อมูล profile_image จาก DB
      const { data: profile, error: fetchError } = await supabase
        .from("profiles")
        .select("profile_image")
        .eq("id", userId)
        .single();

      if (fetchError) {
        console.error("Fetch profile error:", fetchError);
        return {
          success: false,
          message: "ไม่สามารถดึงข้อมูลโปรไฟล์ได้",
        };
      }

      // 2. ลบไฟล์จาก storage (ถ้ามี)
      if (profile?.profile_image) {
        // ดึงชื่อไฟล์จาก URL
        const urlParts = profile.profile_image.split("/");
        const fileName = urlParts[urlParts.length - 1];

        if (fileName) {
          const { error: deleteError } = await supabase.storage
            .from("profile-pictures")
            .remove([fileName]);

          if (deleteError) {
            console.error("Delete file error:", deleteError);
            // ไม่ return error เพราะอาจไม่มีไฟล์อยู่แล้ว
          }
        }
      }

      // 3. อัปเดต profile_image เป็น null
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ profile_image: null })
        .eq("id", userId);

      if (updateError) {
        console.error("Update profile error:", updateError);
        return {
          success: false,
          message: "ไม่สามารถลบรูปโปรไฟล์ได้",
        };
      }

      return {
        success: true,
        message: "ลบรูปโปรไฟล์สำเร็จ",
      };
    } catch (error) {
      console.error("Delete profile picture error:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "เกิดข้อผิดพลาดในการลบรูปโปรไฟล์",
      };
    }
  }

  /**
   * ตรวจสอบ username availability (ใช้ .maybeSingle())
   * @param username - ชื่อผู้ใช้ที่ต้องการตรวจสอบ
   * @param currentUserId - ID ของผู้ใช้ปัจจุบัน
   * @returns Promise<ServiceResponse<boolean>>
   */
  static async checkUsernameAvailability(
    username: string,
    currentUserId?: string
  ): Promise<ServiceResponse<boolean>> {
    try {
      let query = supabase
        .from("profiles")
        .select("id")
        .eq("username", username);

      if (currentUserId) {
        query = query.neq("id", currentUserId);
      }

      // ใช้ .maybeSingle() แทน .single()
      const { data, error } = await query.maybeSingle();

      if (error) {
        console.error("Username check error:", error);
        return {
          success: false,
          message: "ไม่สามารถตรวจสอบชื่อผู้ใช้ได้",
        };
      }

      const isAvailable = !data; // ถ้าไม่มีข้อมูล = username ว่าง

      return {
        success: true,
        data: isAvailable,
        message: isAvailable ? "ชื่อผู้ใช้ว่าง" : "ชื่อผู้ใช้นี้มีอยู่แล้ว",
      };
    } catch (error) {
      console.error("Username availability check error:", error);
      return {
        success: false,
        message: "เกิดข้อผิดพลาดในการตรวจสอบชื่อผู้ใช้",
      };
    }
  }
}
