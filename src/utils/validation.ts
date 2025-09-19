import { z } from "zod";

export const registerSchema = z
  .object({
    // ต่อไปจะเพิ่มฟิลด์ทีละฟิลด์
    firstName: z
      .string()
      .min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร")
      .max(50, "ชื่อต้องไม่เกิน 50 ตัวอักษร")
      .regex(/^[a-zA-Zก-๙\s]+$/, "ชื่อใช้ได้เฉพาะตัวอักษรและช่องว่าง"),
    lastName: z
      .string()
      .min(2, "นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร")
      .max(50, "นามสกุลต้องไม่เกิน 50 ตัวอักษร")
      .regex(/^[a-zA-Zก-๙\s]+$/, "นามสกุลใช้ได้เฉพาะตัวอักษรและช่องว่าง"),
    username: z
      .string()
      .min(3, "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร")
      .max(30, "ชื่อผู้ใช้ต้องไม่เกิน 30 ตัวอักษร")
      .regex(/^[a-zA-Z0-9_]+$/, "ชื่อผู้ใช้ใช้ได้เฉพาะตัวอักษร ตัวเลข และ _")
      .refine((val) => !val.startsWith("_") && !val.endsWith("_"), {
        message: "ชื่อผู้ใช้ไม่สามารถขึ้นต้นหรือลงท้ายด้วย _ ได้",
      }),
    email: z
      .string()
      .email("รูปแบบอีเมลไม่ถูกต้อง")
      .max(100, "อีเมลต้องไม่เกิน 100 ตัวอักษร")
      .toLowerCase(),
    password: z
      .string()
      .min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")
      .max(100, "รหัสผ่านต้องไม่เกิน 100 ตัวอักษร")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "รหัสผ่านต้องมีตัวอักษรเล็ก ใหญ่ และตัวเลขอย่างน้อยอย่างละ 1 ตัว"
      )
      .regex(
        /^(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/,
        "รหัสผ่านต้องมีอักขระพิเศษอย่างน้อย 1 ตัว"
      ),
    confirmPassword: z.string(),
    phoneNumber: z
      .string()
      .regex(/^[0-9+\-\s()]+$/, "รูปแบบเบอร์โทรไม่ถูกต้อง")
      .min(10, "เบอร์โทรต้องมีอย่างน้อย 10 หลัก")
      .max(15, "เบอร์โทรต้องไม่เกิน 15 หลัก")
      .transform((val) => val.replace(/\s/g, "")),
    dateOfBirth: z
      .string()
      .min(1, "กรุณาเลือกวันเกิด")
      .refine((date) => {
        const birthDate = new Date(date);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
          return age - 1 >= 18;
        }
        return age >= 18;
      }, "ต้องมีอายุอย่างน้อย 18 ปี")
      .refine((date) => {
        const birthDate = new Date(date);
        const today = new Date();
        return birthDate <= today;
      }, "วันเกิดไม่สามารถเป็นอนาคตได้"),
    country: z
      .string()
      .min(1, "กรุณาเลือกประเทศ")
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
          message: "กรุณาเลือกประเทศที่ถูกต้อง",
        }
      ),
    profilePicture: z
      .instanceof(File)
      .optional()
      .refine((file) => {
        if (!file) return true;
        return file.size <= 5 * 1024 * 1024; // 5MB
      }, "ขนาดไฟล์ต้องไม่เกิน 5MB")
      .refine((file) => {
        if (!file) return true;
        return ["image/jpeg", "image/png", "image/webp"].includes(file.type);
      }, "รองรับเฉพาะไฟล์ JPG, PNG, และ WebP"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "รหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"], // ระบุฟิลด์ที่มีปัญหา
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
