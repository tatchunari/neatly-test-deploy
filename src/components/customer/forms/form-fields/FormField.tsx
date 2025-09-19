import { forwardRef } from "react";
import { FieldError } from "react-hook-form";

interface FormFieldProps {
  label: string; // ชื่อฟิลด์ (เช่น "ชื่อ", "อีเมล")
  error?: FieldError; // ข้อผิดพลาดจาก validation
  children: React.ReactNode; // input component ที่จะใส่ข้างใน
  required?: boolean; // จำเป็นต้องกรอกหรือไม่
}

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, error, children, required = false }, ref) => (
    <div ref={ref} className="space-y-2">
      {/* Label - Properties ที่แสดงในรูป */}
      <label className="block text-base font-normal leading-6 tracking-normal font-inter text-gray-900">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Input Component */}
      {children}

      {/* Error Message */}
      {error && <p className="text-sm text-red-500">{error.message}</p>}
    </div>
  )
);
