import React from "react";
import { UseFormRegisterReturn } from "react-hook-form";

interface TextInputProps {
  label: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  register: UseFormRegisterReturn;
  className?: string;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  required = false,
  placeholder = "",
  type = "text",
  register,
  className = "",
  ...props
}) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        {...register}
        {...props}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${className}`}
      />
    </div>
  );
};
