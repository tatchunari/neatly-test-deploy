import { useState } from "react";
import { UseFormRegisterReturn } from "react-hook-form";

interface DropdownInputProps {
  label: string;
  required?: boolean;
  options: string[];
  register: UseFormRegisterReturn;
  defaultValue?: string;
}

export const DropdownInput = ({
  label,
  required = false,
  options,
  register,
  defaultValue = "",
}: DropdownInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(defaultValue || options[0]);

  const handleSelect = (value: string) => {
    setSelected(value);
    setIsOpen(false);
    register.onChange({ target: { value } }); // updates React Hook Form
  };

  return (
    <div className="flex flex-col w-full text-sm relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left h-10 px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 hover:bg-gray-50 focus:outline-none flex justify-between items-center"
      >
        <span>{selected}</span>
        <svg
          className={`w-5 h-5 transition-transform duration-200 ${
            isOpen ? "rotate-0" : "-rotate-90"
          }`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="#6B7280"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <ul className="w-full bg-white border border-gray-300 rounded-md shadow-md mt-1 py-2 absolute z-10 top-full">
          {options.map((opt) => (
            <li
              key={opt}
              className="px-3 py-2 hover:bg-gray-300 cursor-pointer"
              onClick={() => handleSelect(opt)}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}

      {/* Hidden input for React Hook Form */}
      <input type="hidden" {...register} value={selected} />
    </div>
  );
};
