// src/services/authService.ts
import { supabase } from "@/lib/supabaseClient";
import { UserProfile, RegisterFormData } from "../types/user.type";

export class AuthService {
  // สมัครสมาชิก
  static async registerUser(formData: RegisterFormData): Promise<UserProfile> {
    try {
      // 1. สร้าง user ใน auth.users
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            username: formData.username,
            phone_number: formData.phoneNumber,
            date_of_birth: formData.dateOfBirth,
            country: formData.country,
          },
        },
      });

      if (authError) {
        console.error("Auth error:", authError);
        throw new Error(authError.message);
      }
      if (!authData.user) throw new Error("ไม่สามารถสร้างผู้ใช้ได้");

      // 2. สร้าง profile ใน profiles table
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: authData.user.id,
          username: formData.username,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phoneNumber,
          date_of_birth: formData.dateOfBirth,
          country: formData.country,
          profile_image: null,
          role: "customer",
        })
        .select()
        .single();

      if (profileError) {
        console.error("Profile error:", profileError);
        throw new Error(profileError.message);
      }

      // 3. อัปโหลดรูปโปรไฟล์ (ถ้ามี)
      if (formData.profilePicture) {
        const avatarUrl = await this.uploadProfilePicture(
          formData.profilePicture,
          authData.user.id
        );

        await supabase
          .from("profiles")
          .update({ profile_image: avatarUrl })
          .eq("id", authData.user.id);
      }

      return profileData;
    } catch (error) {
      console.error("Register user error:", error);
      throw error;
    }
  }

  // ตรวจสอบ username availability
  static async checkUsernameAvailability(username: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .single();

    return !data; // ถ้าไม่มีข้อมูล = username ว่าง
  }

  // อัปโหลดรูปโปรไฟล์
  static async uploadProfilePicture(
    file: File,
    userId: string
  ): Promise<string> {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}.${fileExt}`;

    // ลบไฟล์เก่าก่อน (ถ้ามี)
    await supabase.storage.from("profile-pictures").remove([fileName]);

    const { data, error } = await supabase.storage
      .from("profile-pictures")
      .upload(fileName, file);

    if (error) throw new Error(error.message);

    const { data: urlData } = supabase.storage
      .from("profile-pictures")
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  }

  // ตรวจสอบสถานะการยืนยันอีเมล
  static async checkEmailVerification(userId: string): Promise<boolean> {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("Get user error:", error);
        return false;
      }

      return user?.email_confirmed_at !== null;
    } catch (error) {
      console.error("Check email verification error:", error);
      return false;
    }
  }

  // ส่งอีเมลยืนยันอีกครั้ง
  static async resendVerificationEmail(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      });

      if (error) {
        console.error("Resend verification error:", error);
        throw new Error("Unable to resend verification email");
      }
    } catch (error) {
      console.error("Resend verification error:", error);
      throw new Error("An error occurred while resending verification email");
    }
  }
}
