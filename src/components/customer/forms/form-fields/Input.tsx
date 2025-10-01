import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { ErrorIcon } from "@/components/customer/icons/ErrorIcon";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <div className="relative">
      <input
        ref={ref}
        className={cn(
          // Base styles from design system
          "w-full h-12 pt-3 pr-4 pb-3 pl-3 border rounded",
          "bg-[var(--color-white)] border-[var(--color-gray-400)]",
          "focus:outline-none focus:ring-2 focus:ring-[var(--color-orange-500)]",
          "transition-colors duration-200",

          // Typography from design system
          "font-inter text-base font-normal leading-6 tracking-normal",
          "text-[var(--color-black)]", // Text color เมื่อพิมพ์
          "placeholder:text-[var(--color-gray-600)]", // Placeholder text color

          // Error state
          error && "border-[var(--color-red)] focus:ring-[var(--color-red)]",

          // Custom className
          className
        )}
        {...props}
      />

      {/* Error Icon */}
      {error && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <ErrorIcon size={14} className="text-[var(--color-red)]" />
        </div>
      )}
    </div>
  )
);

Input.displayName = "Input";
