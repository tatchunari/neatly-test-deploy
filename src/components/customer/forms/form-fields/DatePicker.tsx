import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, error, ...props }, ref) => (
    <input
      ref={ref}
      type="date"
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
    />
  )
);

DatePicker.displayName = "DatePicker";