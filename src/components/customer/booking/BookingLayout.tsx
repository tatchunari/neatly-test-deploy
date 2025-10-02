import React from "react";

interface BookingLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}

export const BookingLayout: React.FC<BookingLayoutProps> = ({
  children,
  sidebar,
}) => {
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="pt-12 md:pt-[100px] px-4 md:px-8">
        <h1 className="text-3xl md:text-4xl font-noto text-green-900 mb-8">
          Booking Room
        </h1>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Panel - Form */}
          <div className="flex-1">{children}</div>

          {/* Right Panel - Sidebar */}
          <div className="lg:w-96">{sidebar}</div>
        </div>
      </div>
    </div>
  );
};
