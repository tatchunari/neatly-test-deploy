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
        "bg-[var(--color-white)] border-[var(--color-gray-400)]",
        "focus:outline-none focus:ring-2 focus:ring-[var(--color-blue-500)]",
        "transition-colors duration-200",

        // Typography from design system
        "font-inter text-base font-normal leading-6 tracking-normal",
        "text-[var(--color-gray-900)]", // Text color เมื่อเลือก

        // Error state
        error && "border-[var(--color-red)] focus:ring-[var(--color-red)]",

        // Custom className
        className
      )}
      {...props}
    >
      {placeholder && (
        <option value="" disabled className="text-[var(--color-gray-600)]">
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

Select.displayName = "Select";
