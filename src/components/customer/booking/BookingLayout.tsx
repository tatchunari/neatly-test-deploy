import React from "react";

interface BookingLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  stepper?: React.ReactNode;
}

export const BookingLayout: React.FC<BookingLayoutProps> = ({
  children,
  sidebar,
  stepper,
}) => {
  return (
    <div className="w-full pt-[60px] md:pt-[48px] md:px-40 bg-[var(--color-bg)]">
      {/* Header */}
      <h1 className="font-medium leading-tight tracking-tight text-[32px] md:text-[44px] lg:text-[68px] text-[var(--color-green-800)] font-[var(--font-noto)]">
        Booking Room
      </h1>

      {/* Stepper Container */}
      <div className="py-6 md:py-10">{stepper}</div>

      {/* Main Content - Form and Sidebar */}
      <div className="flex flex-col items-start gap-6 md:gap-8 lg:flex-row">
        {/* Left Panel - Form (Responsive Width) */}
        <div className="w-full lg:flex-shrink-0 lg:w-[740px]">{children}</div>

        {/* Right Panel - Sidebar (Responsive Width) */}
        <div className="w-full lg:w-auto lg:min-w-[358px]">{sidebar}</div>
      </div>
    </div>
  );
};
