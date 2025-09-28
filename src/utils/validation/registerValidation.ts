import { z } from "zod";
import {
  firstNameValidation,
  lastNameValidation,
  usernameValidation,
  emailValidation,
  phoneValidation,
  dateOfBirthValidation,
  countryValidation,
  profilePictureValidation,
} from "./commonValidation";

export const registerSchema = z
  .object({
    firstName: firstNameValidation,
    lastName: lastNameValidation,
    username: usernameValidation,
    email: emailValidation,
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }) // รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร
      .max(64, { message: "Password must not exceed 64 characters" }) // รหัสผ่านต้องไม่เกิน 64 ตัวอักษร
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message:
          "Password must contain at least one lowercase letter, one uppercase letter, and one number", // รหัสผ่านต้องมีตัวอักษรเล็ก ใหญ่ และตัวเลขอย่างน้อยอย่างละ 1 ตัว
      }),
    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your password" }), // กรุณายืนยันรหัสผ่าน
    phoneNumber: phoneValidation,
    dateOfBirth: dateOfBirthValidation,
    country: countryValidation,
    profilePicture: profilePictureValidation,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match", // รหัสผ่านไม่ตรงกัน
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
