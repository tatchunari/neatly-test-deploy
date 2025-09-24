import { useState } from "react";
import { useRouter } from "next/router";           
import { supabase } from "@/lib/supabaseClient";   

// สร้าง interface สำหรับเก็บ error message ของ username และ password
interface Errors {
  username: string;
  password: string;
}

export default function LoginForm() {
  const router = useRouter();   // ใช้เปลี่ยนหน้าไป /dashboard เมื่อ login สำเร็จ

  // สร้าง state เก็บค่าที่ผู้ใช้กรอก และ error message
  const [username, setUsername] = useState<string>("");  
  const [password, setPassword] = useState<string>("");  
  const [errors, setErrors] = useState<Errors>({ username: "", password: "" });

  // ฟังก์ชันจะถูกเรียกเมื่อผู้ใช้กด Submit ฟอร์ม
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // ป้องกันไม่ให้ฟอร์ม reload หน้าเว็บ

    // สร้าง object สำหรับเก็บ error ชุดใหม่
    let newErrors: Errors = { username: "", password: "" };

    // ตัดช่องว่างหน้าหลังออก
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    // ตรวจสอบว่า username/email ถูกกรอกหรือไม่ และต้องยาว ≥ 6 ตัว ถ้าไม่ใช่ email
    if (!trimmedUsername) {
      newErrors.username = "Username or Email is required";
    } else {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedUsername); // regex เช็ค email
      if (!isEmail && trimmedUsername.length < 6) {
        newErrors.username = "Username must be at least 6 characters";
      }
    }

    // ตรวจสอบ password ว่ากรอกครบ และยาว ≥ 6 ตัวอักษร
    if (!trimmedPassword) newErrors.password = "Password is required";
    else if (trimmedPassword.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    // อัพเดต state error
    setErrors(newErrors);

    // ถ้ามี error ให้หยุดทำงาน ไม่ต้อง login
    if (newErrors.username || newErrors.password) return;

    // ตรวจสอบว่าค่าที่กรอกเป็น email หรือ username
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedUsername);
    let emailToLogin = trimmedUsername; // ถ้าเป็น email ใช้ email เดิมเลย

    // ถ้าเป็น username → ไปดึง email จากตาราง users ใน Supabase
    if (!isEmail) {
      const { data, error } = await supabase
        .from("users")
        .select("email")
        .eq("username", trimmedUsername)
        .single();

      // ถ้าไม่เจอ email → แจ้ง error
      if (error || !data?.email) {
        setErrors({ username: "Username not found", password: "" });
        return;
      }
      emailToLogin = data.email; // ถ้าเจอ → ใช้ email ที่ได้มา login
    }

    // ส่งคำขอไป Supabase เพื่อล็อกอิน
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: emailToLogin,
      password: trimmedPassword,
    });

    // ถ้า login ล้มเหลว → แสดงข้อความ error
    if (authError) {
      setErrors({ username: "Login failed: " + authError.message, password: "" });
    } 
    // ถ้าสำเร็จ → redirect ไปหน้า dashboard
    else {
      router.push("/dashboard");
    }
  };

  return (
    // ฟอร์ม login พร้อม onSubmit handler
    <form onSubmit={handleSubmit}>
      {/* ช่องกรอก Username หรือ Email */}
      <div className="mb-5 md:mb-[40px]">
        <label htmlFor="email" className="block mb-2 text-[15px] md:text-[16px] leading-[150%] text-gray-900">
          Username or Email
        </label>
        <input
          id="email"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}   // อัพเดต state เมื่อพิมพ์
          placeholder="Enter your username or email"
          className="w-full md:w-[452px] h-[48px] rounded border border-gray-300 bg-white pt-3 pr-4 pb-3 pl-3 text-[16px] outline-none placeholder:text-gray-500 focus:border-green-700 transition"
        />
        {/* แสดง error ถ้ามี */}
        <p className={`text-sm h-5 mt-1 ${errors.username ? "text-red-500 visible" : "invisible"}`}>
          {errors.username || "placeholder"}
        </p>
      </div>

      {/* ช่องกรอกรหัสผ่าน */}
      <div className="mb-5 md:mb-[40px]">
        <label htmlFor="password" className="block mb-2 text-[15px] md:text-[16px] leading-[150%] text-gray-900">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}   // อัพเดต state เมื่อพิมพ์
          placeholder="Enter your password"
          className="w-full md:w-[452px] h-[48px] rounded border border-gray-300 bg-white pt-3 pr-4 pb-3 pl-3 text-[16px] outline-none placeholder:text-gray-500 focus:border-green-700 focus:ring-2 focus:ring-green-100 transition"
        />
        {/* แสดง error ถ้ามี */}
        <p className={`text-sm h-5 mt-1 ${errors.password ? "text-red-500 visible" : "invisible"}`}>
          {errors.password || "placeholder"}
        </p>
      </div>

      {/* ปุ่ม Log In และลิงก์ Register */}
      <div className="flex flex-col">
        <button
          type="submit"
          className="w-full md:w-[452px] h-[48px] mb-4 md:mb-[16px] rounded bg-orange-600 font-inter text-white text-[16px] font-semibold leading-[16px] px-8 cursor-pointer transition hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-200"
        >
          Log In
        </button>

        <div className="flex items-center gap-2">
          <p className="font-inter text-[15px] md:text-[16px] leading-[150%] tracking-[-0.02em] text-gray-700">
            Don’t have an account yet?
          </p>
          <a href="/customer/register" className="font-semibold text-orange-500 text-[15px] md:text-[16px] hover:underline">
            Register
          </a>
        </div>
      </div>
    </form>
  );
}