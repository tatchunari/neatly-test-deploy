import React from "react";
import { BookingStep } from "@/types/booking";

interface BookingStepperProps {
  currentStep: BookingStep;
  steps: {
    id: BookingStep;
    label: string;
    number: number;
  }[];
}

export const BookingStepper: React.FC<BookingStepperProps> = ({
  currentStep,
  steps,
}) => {
  return (
    <div className="flex items-center justify-start mb-8">
      <div className="flex items-center space-x-8">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted =
            steps.findIndex((s) => s.id === currentStep) > index;
          const isInactive = !isActive && !isCompleted;

          return (
            <React.Fragment key={step.id}>
              {/* Step Circle */}
              <div className="flex items-center gap-[10px] py-3">
                <div
                  className={`w-[66px] h-[66px] rounded-[4px] flex items-center justify-center ${
                    isActive
                      ? "bg-[var(--color-orange-500)] text-[var(--color-white)]" // Active: ส้มเข้ม ตัวเลขขาว
                      : isCompleted
                      ? "bg-[var(--color-orange-100)] text-[var(--color-orange-500)]" // Completed: ส้มอ่อน ตัวเลขส้ม
                      : "bg-[var(--color-gray-200)] text-[var(--color-gray-600)]" // Inactive: เทา ตัวเลขเทา
                  }`}
                  style={{
                    fontSize: "28px",
                    fontWeight: "600",
                    lineHeight: "150%",
                    letterSpacing: "-2%",
                    fontFamily: "var(--font-inter)",
                  }}
                >
                  {step.number}
                </div>
                <span
                  className={`font-inter ${
                    isActive
                      ? "text-[var(--color-orange-500)]" // Active: ข้อความส้ม
                      : isCompleted
                      ? "text-[var(--color-gray-900)]" // Completed: ข้อความเทาเข้ม
                      : "text-[var(--color-gray-600)]" // Inactive: ข้อความเทา
                  }`}
                  style={{
                    fontSize: "20px",
                    fontWeight: "600",
                    lineHeight: "150%",
                    letterSpacing: "-2%",
                    fontFamily: "var(--font-inter)",
                  }}
                >
                  {step.label}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
