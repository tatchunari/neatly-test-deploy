import { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "@/components/customer/icons/CalendarIcon";

interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, error, onChange, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      // เปลี่ยนเป็น date picker
      e.target.type = "date";
      e.target.setAttribute("min", "1900-01-01");
      e.target.setAttribute("max", "2100-12-31");
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      // เปลี่ยนกลับเป็น text input
      e.target.type = "text";
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <div className="relative">
        <input
          ref={ref}
          type={isFocused ? "date" : "text"}
          placeholder="mm/dd/yyyy"
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          className={cn(
            // Base styles from design system
            "w-full h-12 pt-3 pr-12 pb-3 pl-3 border rounded",
            "bg-[var(--color-white)] border-[var(--color-gray-400)]",
            "focus:outline-none focus:ring-2 focus:ring-[var(--color-blue-500)]",
            "transition-colors duration-200",

            // Typography from design system
            "font-inter text-base font-normal leading-6 tracking-normal",
            "text-[var(--color-gray-900)]", // Text color เมื่อเลือก
            "placeholder:text-[var(--color-gray-600)]", // Placeholder text color

            // Error state
            error && "border-[var(--color-red)] focus:ring-[var(--color-red)]",

            // Custom className
            className
          )}
          {...props}
        />

        {/* Calendar Icon */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <CalendarIcon size={20} className="text-[var(--color-gray-400)]" />
        </div>
      </div>
    );
  }
);

DatePicker.displayName = "DatePicker";
