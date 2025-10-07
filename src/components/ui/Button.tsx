import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      children,
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      className={cn(
        // Base styles
        "inline-flex items-center justify-center rounded font-medium",
        "focus:outline-none focus:ring-2 focus:ring-orange-500",
        "transition-colors duration-200",
        "disabled:opacity-50 disabled:cursor-not-allowed",

        // Typography
        "font-open-sans text-base font-semibold leading-4 tracking-normal text-center",
        "text-white",

        // Variants
        variant === "primary" && "bg-[#C14817] text-white hover:bg-[#A03D12]",
        variant === "secondary" &&
          "bg-gray-200 text-gray-900 hover:bg-gray-300",
        variant === "outline" &&
          "border border-gray-400 text-gray-700 hover:bg-gray-50",

        // Sizes
        size === "sm" && "px-6 py-3 text-sm",
        size === "md" && "px-8 py-4 text-base", // 32px padding
        size === "lg" && "px-10 py-5 text-lg",

        // Full width
        fullWidth && "w-full",

        // Custom className
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {children}
    </button>
  )
);

Button.displayName = "Button";
