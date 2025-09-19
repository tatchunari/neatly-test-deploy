import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface PlusIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

export const PlusIcon = forwardRef<SVGSVGElement, PlusIconProps>(
  ({ size = 24, className, ...props }, ref) => (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 17 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-current", className)}
      {...props}
    >
      <path
        d="M8.5 1.5V16.5M16 9H1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
);

PlusIcon.displayName = "PlusIcon";
