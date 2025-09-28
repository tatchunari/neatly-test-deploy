import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  registerSchema,
  RegisterFormData,
} from "@/utils/validation/registerValidation";
import { AuthService } from "@/services/authService";
import { useRouter } from "next/router";

export const useFormValidation = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
      dateOfBirth: "",
      country: "",
      profilePicture: undefined,
    },
  });

  const {
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = form;

  // ตรวจสอบ username availability พร้อม loading state
  const checkUsername = async (username: string) => {
    if (username.length < 3) return true;

    setIsCheckingUsername(true);
    try {
      const isAvailable = await AuthService.checkUsernameAvailability(username);
      return isAvailable;
    } catch (error) {
      console.error("Error checking username:", error);
      return false;
    } finally {
      setIsCheckingUsername(false);
    }
  };

  // Submit form
  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // ตรวจสอบ username availability
      const isUsernameAvailable = await checkUsername(data.username);
      if (!isUsernameAvailable) {
        form.setError("username", {
          type: "manual",
          message: "This username is already taken", // ชื่อผู้ใช้นี้มีอยู่แล้ว
        });
        return;
      }

      // สร้าง user
      const userProfile = await AuthService.registerUser(data);

      setSuccess(true);
      console.log("User registered successfully:", userProfile);

      // Reset form → ให้ placeholder ไม่หาย
      form.reset({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        phoneNumber: "",
        dateOfBirth: "",
        country: "",
        profilePicture: undefined,
      });

      // Redirect ไปหน้า login หลังจาก 5 วินาที
      setTimeout(() => {
        router.push("/customer/login");
      }, 5000);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred during registration"; // เกิดข้อผิดพลาดในการสมัครสมาชิก
      setError(errorMessage);
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Watch form values
  const watchedValues = watch();

  return {
    form,
    errors,
    isLoading,
    error,
    success,
    onSubmit: handleSubmit(onSubmit),
    checkUsername,
    watchedValues,
    setValue,
    isCheckingUsername,
  };
};
