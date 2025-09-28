export interface UserProfile {
  id: string; // uuid - Primary Key
  username: string;
  first_name: string;
  last_name: string;
  phone: string;
  date_of_birth: string;
  country: string;
  profile_image?: string;
  created_at: string;
  role: "customer" | "agent" | "admin";
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  dateOfBirth: string;
  country: string;
  profilePicture?: File;
}

export interface AuthUser {
  id: string;
  email: string;
  user_metadata: {
    first_name: string;
    last_name: string;
    username: string;
    phone_number: string;
    date_of_birth: string;
    country: string;
  };
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface FormError {
  field: string;
  message: string;
}

// เพิ่ม Profile-related types
export interface ProfileFormData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  country: string;
  profilePicture?: File;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  profile?: UserProfile;
}

export interface ProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isUpdating: boolean;
}
