import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, options, placeholder, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        // Base styles from design system
        "w-full h-12 pt-3 pr-4 pb-3 pl-3 border rounded",
        "bg-white border-gray-400",
        "focus:outline-none focus:ring-2 focus:ring-blue-500",
        "transition-colors duration-200",

        // Typography from design system
        "font-inter text-base font-normal leading-6 tracking-normal",
        "text-gray-900", // Text color เมื่อเลือก
        "placeholder:text-gray-600", // Placeholder text color

        // Error state
        error && "border-red-500 focus:ring-red-500",

        // Custom className
        className
      )}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
);
