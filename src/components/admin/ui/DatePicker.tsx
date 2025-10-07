import React from "react";

/**
 * Minimal-styled native date input using Tailwind CSS.
 * - Keeps the native date picker but applies a subtle gray border and light focus state.
 */

type DateInputProps = {
  id?: string;
  label?: string;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  className?: string;
  min?: string;
  max?: string;
  required?: boolean;
};

export default function DatePicker({
  id = "date",
  label = "",
  value,
  onChange,
  className = "",
  min,
  max,
  required = false,
}: DateInputProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <input
        id={id}
        type="date"
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        required={required}
        className={
          "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400" +
          " appearance-none"
        }
      />
    </div>
  );
}
