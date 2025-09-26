import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";
import { ProfileForm } from "@/components/customer/forms/ProfileForm";
import { UserProfile } from "@/types/user.type";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /**
   * ตรวจสอบการล็อกอิน
   */
  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          // ถ้าไม่ได้ล็อกอิน ให้ redirect ไปหน้า login
          router.push("/customer/login");
          return;
        }

        setUser(user);
      } catch (error) {
        console.error("Error checking user:", error);
        router.push("/customer/login");
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  /**
   * จัดการเมื่ออัปเดตโปรไฟล์สำเร็จ
   */
  const handleProfileUpdate = (profile: UserProfile) => {
    console.log("Profile updated:", profile);

    // แสดง notification (ถ้ามี)
    // toast.success("อัปเดตโปรไฟล์สำเร็จ!");

    // หรือ redirect ไปหน้าอื่น
    // router.push("/customer/dashboard");
  };

  /**
   * จัดการเมื่อยกเลิกการแก้ไข
   */
  const handleCancel = () => {
    // ถ้าต้องการให้ redirect ไปหน้าอื่น
    router.back();
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังตรวจสอบการล็อกอิน...</p>
        </div>
      </div>
    );
  }

  // ถ้าไม่ได้ล็อกอิน จะ redirect ไปหน้า login
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                โปรไฟล์ของฉัน
              </h1>
              <p className="text-gray-600">จัดการข้อมูลส่วนตัวของคุณ</p>
            </div>

            {/* Navigation buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/customer/dashboard")}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← กลับ
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <ProfileForm onSuccess={handleProfileUpdate} onCancel={handleCancel} />
      </div>
    </div>
  );
}
