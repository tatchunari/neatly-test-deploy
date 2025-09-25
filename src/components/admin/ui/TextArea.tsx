import React from "react";
import { UseFormRegisterReturn } from "react-hook-form";

interface TextAreaProps {
  label: string;
  required?: boolean;
  placeholder?: string;
  rows?: number;
  register: UseFormRegisterReturn;
  className?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  required = false,
  placeholder = "",
  rows = 4,
  register,
  className = "",
}) => {
  return (
    <div> {/* full width wrapper */}
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Room Description <span className="text-red-500">*</span>
      </label>
      <textarea
        {...register}
        rows={4}
        placeholder="Enter room description"
        className={`px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none ${className}`}
      />
    </div>
  );
};
