import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterFormData } from "@/utils/validation";
import { AuthService } from "@/services/authService";

export const useFormValidation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

  // ตรวจสอบ username availability
  const checkUsername = async (username: string) => {
    if (username.length < 3) return true;

    try {
      const isAvailable = await AuthService.checkUsernameAvailability(username);
      return isAvailable;
    } catch (error) {
      console.error("Error checking username:", error);
      return false;
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
          message: "ชื่อผู้ใช้นี้มีอยู่แล้ว",
        });
        return;
      }

      // สร้าง user
      const userProfile = await AuthService.registerUser(data);

      setSuccess(true);
      console.log("User registered successfully:", userProfile);

      // Reset form
      form.reset();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาดในการสมัครสมาชิก";
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
  };
};
