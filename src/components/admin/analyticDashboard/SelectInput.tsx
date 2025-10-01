import { useState, useEffect } from "react";

interface SelectInputProps {
  options?: string[];
  placeholder?: string;
  value?: string | null;
  onChange?: (value: string) => void;
  className?: string;
  width?: string;
}

export const SelectInput = ({
  options = [],
  placeholder = "Select",
  value = null,
  onChange = () => {},
  className = "",
  width = "w-44",
}: SelectInputProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<string>(value || placeholder);

  const handleSelect = (option: string) => {
    setSelected(option);
    setIsOpen(false);
    onChange(option);
  };

  useEffect(() => {
    if (value !== null) {
      setSelected(value);
    }
  }, [value]);

  return (
    <div className={`flex flex-col ${width} text-sm relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left px-4 pr-2 py-2 border rounded bg-white text-gray-800 border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none"
      >
        <span>{selected}</span>
        <svg
          className={`w-5 h-5 inline float-right transition-transform duration-200 ${
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
        <ul className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded shadow-md mt-1 py-2 z-10 max-h-60 overflow-y-auto">
          {options.map((option) => (
            <li
              key={option}
              className="px-4 py-2 hover:bg-indigo-500 hover:text-white cursor-pointer"
              onClick={() => handleSelect(option)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
