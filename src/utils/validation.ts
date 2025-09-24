import { z } from "zod";

export const registerSchema = z
  .object({
    // ต่อไปจะเพิ่มฟิลด์ทีละฟิลด์
    firstName: z
      .string()
      .min(2, { message: "First name must be at least 2 characters" }) // ชื่อต้องมีอย่างน้อย 2 ตัวอักษร
      .max(50, { message: "First name must not exceed 50 characters" }) // ชื่อต้องไม่เกิน 50 ตัวอักษร
      .regex(/^[a-zA-Zก-๙\s]+$/, {
        message: "First name can only contain letters and spaces",
      }), // ชื่อใช้ได้เฉพาะตัวอักษรและช่องว่าง
    lastName: z
      .string()
      .min(2, { message: "Last name must be at least 2 characters" }) // นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร
      .max(50, { message: "Last name must not exceed 50 characters" }) // นามสกุลต้องไม่เกิน 50 ตัวอักษร
      .regex(/^[a-zA-Zก-๙\s]+$/, {
        message: "Last name can only contain letters and spaces",
      }), // นามสกุลใช้ได้เฉพาะตัวอักษรและช่องว่าง
    username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters" }) // ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร
      .max(20, { message: "Username must not exceed 20 characters" }) // ชื่อผู้ใช้ต้องไม่เกิน 20 ตัวอักษร
      .regex(/^[a-zA-Z0-9_]+$/, {
        message: "Username can only contain letters, numbers, and _",
      }) // ชื่อผู้ใช้ใช้ได้เฉพาะตัวอักษร ตัวเลข และ _
      .refine((val) => !val.startsWith("_") && !val.endsWith("_"), {
        message: "Username cannot start or end with _", // ชื่อผู้ใช้ไม่สามารถขึ้นต้นหรือลงท้ายด้วย _ ได้
      })
      .refine((val) => !val.includes("..") && !val.includes("__"), {
        message: "Username cannot contain consecutive '.' or '_'", // ชื่อผู้ใช้ไม่สามารถมี . หรือ _ ติดกันได้
      }),
    email: z
      .string()
      .email({ message: "Invalid email format" }) // รูปแบบอีเมลไม่ถูกต้อง
      .max(150, { message: "Email must not exceed 150 characters" }) // อีเมลต้องไม่เกิน 150 ตัวอักษร
      .trim()
      .toLowerCase(),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }) // รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร
      .max(64, { message: "Password must not exceed 64 characters" }) // รหัสผ่านต้องไม่เกิน 64 ตัวอักษร
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        {
          message:
            "Password must contain at least one lowercase letter, one uppercase letter, and one number",
        } // รหัสผ่านต้องมีตัวอักษรเล็ก ใหญ่ และตัวเลขอย่างน้อยอย่างละ 1 ตัว
      ),
    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your password" }), // กรุณายืนยันรหัสผ่าน
    phoneNumber: z
      .string()
      .regex(/^[0-9+\-\s()]+$/, { message: "Invalid phone number format" }) // รูปแบบเบอร์โทรไม่ถูกต้อง
      .min(10, { message: "Phone number must be at least 10 digits" }) // เบอร์โทรต้องมีอย่างน้อย 10 หลัก
      .max(15, { message: "Phone number must not exceed 15 digits" }) // เบอร์โทรต้องไม่เกิน 15 หลัก
      .transform((val) => val.replace(/\s/g, "")),
    dateOfBirth: z
      .string()
      .min(1, { message: "Please select your date of birth" }) // กรุณาเลือกวันเกิด
      .refine(
        (date) => {
          const birthDate = new Date(date);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();

          if (
            monthDiff < 0 || // เดือนยังไม่ถึง
            (monthDiff === 0 && today.getDate() < birthDate.getDate()) // เดือนเดียวกันแต่วันที่ยังไม่ถึง
          ) {
            return age - 1 >= 18; // ลบ 1 ปี
          }
          return age >= 18;
        },
        { message: "Must be at least 18 years old" }
      ) // ต้องมีอายุอย่างน้อย 18 ปี
      .refine(
        (date) => {
          const birthDate = new Date(date);
          const today = new Date();
          return birthDate <= today;
        },
        { message: "Date of birth cannot be in the future" }
      ), // วันเกิดไม่สามารถเป็นอนาคตได้
    country: z
      .string()
      .min(1, { message: "Please select a country" }) // กรุณาเลือกประเทศ
      .refine(
        (val) =>
          [
            "thailand",
            "singapore",
            "malaysia",
            "indonesia",
            "philippines",
            "vietnam",
            "other",
          ].includes(val),
        {
          message: "Please select a valid country", // กรุณาเลือกประเทศที่ถูกต้อง
        }
      ),
    profilePicture: z
      .instanceof(File)
      .optional()
      .refine(
        (file) => {
          if (!file) return true;
          return file.size <= 5 * 1024 * 1024; // 5MB
        },
        { message: "File size must not exceed 5MB" }
      ) // ขนาดไฟล์ต้องไม่เกิน 5MB
      .refine(
        (file) => {
          if (!file) return true;
          return ["image/jpeg", "image/png", "image/webp"].includes(file.type);
        },
        { message: "Only JPG, PNG, and WebP files are supported" }
      ), // รองรับเฉพาะไฟล์ JPG, PNG, และ WebP
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match", // รหัสผ่านไม่ตรงกัน
    path: ["confirmPassword"], // ระบุฟิลด์ที่มีปัญหา
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
