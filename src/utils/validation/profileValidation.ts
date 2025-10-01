import { z } from "zod";
import {
  firstNameValidation,
  lastNameValidation,
  phoneValidation,
  countryValidation,
  profilePictureValidation,
  dateOfBirthValidation,
} from "./commonValidation";

export const profileSchema = z.object({
  username: z.string().optional(),
  firstName: firstNameValidation,
  lastName: lastNameValidation,
  email: z
    .string()
    .optional()
    .refine((val) => !val || z.string().email().safeParse(val).success, {
      message: "Invalid email format",
    }),
  phoneNumber: phoneValidation,
  dateOfBirth: dateOfBirthValidation, // เปลี่ยนจาก z.string() เป็น dateOfBirthValidation
  country: countryValidation,
  profilePicture: profilePictureValidation,
});

export type ProfileFormData = z.infer<typeof profileSchema>;
