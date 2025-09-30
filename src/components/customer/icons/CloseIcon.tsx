import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface CloseIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

export const CloseIcon = forwardRef<SVGSVGElement, CloseIconProps>(
  ({ size = 24, className, ...props }, ref) => (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("text-current", className)}
      {...props}
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
);

CloseIcon.displayName = "CloseIcon";