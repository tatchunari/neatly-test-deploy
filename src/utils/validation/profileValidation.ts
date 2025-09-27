import { z } from "zod";
import {
  firstNameValidation,
  lastNameValidation,
  phoneValidation,
  countryValidation,
  profilePictureValidation,
} from "./commonValidation";

export const profileSchema = z.object({
  firstName: firstNameValidation,
  lastName: lastNameValidation,
  email: z
    .string()
    .optional()
    .refine((val) => !val || z.string().email().safeParse(val).success, {
      message: "Invalid email format",
    }),
  phoneNumber: phoneValidation,
  dateOfBirth: z
    .string()
    .min(1, { message: "Please select your date of birth" }), // กรุณาเลือกวันเกิด
  country: countryValidation,
  profilePicture: profilePictureValidation,
});

export type ProfileFormData = z.infer<typeof profileSchema>;
