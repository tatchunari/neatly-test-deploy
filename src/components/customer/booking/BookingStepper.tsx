import React from "react";

export type BookingStep = "basic_info" | "special_request" | "payment_method";

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
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted =
            steps.findIndex((s) => s.id === currentStep) > index;

          return (
            <React.Fragment key={step.id}>
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-inter font-medium ${
                    isActive
                      ? "bg-orange-500 text-white"
                      : isCompleted
                      ? "bg-orange-100 text-orange-500 border-2 border-orange-500"
                      : "bg-white text-black border-2 border-gray-300"
                  }`}
                >
                  {step.number}
                </div>
                <span
                  className={`text-sm mt-2 font-inter ${
                    isActive ? "text-orange-500" : "text-white"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="w-12 h-0.5 bg-gray-300 mx-2" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
