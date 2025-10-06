import { useState, useEffect, useRef } from "react";

interface ChatbotDropdownProps {
  label: string;
  options: string[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  multiple?: boolean;
  searchable?: boolean;
  showAllOption?: boolean; // Only for multiple selection
  className?: string;
}

export const ChatbotDropdown = ({
  label,
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
  multiple = false,
  searchable = false,
  showAllOption = false,
  className = ""
}: ChatbotDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get display value
  const getDisplayValue = () => {
    if (multiple) {
      const selectedArray = Array.isArray(value) ? value : [];
      if (selectedArray.length === 0) {
        return placeholder || `Select ${label.toLowerCase()}...`;
      }
      return selectedArray.join(", ");
    } else {
      return value || placeholder || `Select ${label.toLowerCase()}...`;
    }
  };

  // Handle option selection
  const handleOptionClick = (option: string) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      let newValues: string[];
      
      if (option === "All") {
        // Handle "All" option
        const allSelected = options.every(opt => currentValues.includes(opt));
        newValues = allSelected ? [] : [...options];
      } else {
        // Handle individual option
        if (currentValues.includes(option)) {
          newValues = currentValues.filter(v => v !== option);
        } else {
          newValues = [...currentValues, option];
        }
      }
      
      onChange(newValues);
    } else {
      onChange(option);
      setIsOpen(false);
    }
  };

  // Handle "All" option removal
  const handleRemoveOption = (option: string) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.filter(v => v !== option);
      onChange(newValues);
    }
  };

  // Filter options based on search term
  const filteredOptions = searchable && searchTerm
    ? options.filter(option => 
        option.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  // Check if option is selected
  const isSelected = (option: string) => {
    if (multiple) {
      return Array.isArray(value) ? value.includes(option) : false;
    } else {
      return value === option;
    }
  };

  // Check if all options are selected (for "All" option)
  const allSelected = multiple && Array.isArray(value) && 
    options.every(option => value.includes(option));

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-900 mb-2">
        {label}
      </label>

      {/* Dropdown Trigger */}
      <div 
        className={`w-full border border-gray-300 rounded-md text-sm px-3 py-2 bg-white ${
          multiple ? 'min-h-[36px]' : 'h-[36px]'
        } flex items-center cursor-pointer ${
          disabled 
            ? "text-gray-600 opacity-50 cursor-not-allowed" 
            : "hover:border-orange-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        }`}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
          }
        }}
      >
        {/* Display selected values */}
        {multiple ? (
          <div className="flex flex-wrap gap-1 flex-1">
            {Array.isArray(value) && value.length > 0 ? (
              value.map((selectedValue) => (
                <span
                  key={selectedValue}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-xs rounded-md"
                  onClick={(e) => {
                    if (!disabled) {
                      e.stopPropagation();
                      handleRemoveOption(selectedValue);
                    }
                  }}
                >
                  {selectedValue}
                  {!disabled && (
                    <button className="ml-1 text-gray-500 hover:text-gray-700">
                      ✕
                    </button>
                  )}
                </span>
              ))
            ) : (
              <span className="text-gray-600 text-sm">
                {placeholder || `Select ${label.toLowerCase()}...`}
              </span>
            )}
          </div>
        ) : (
          <span className={`flex-1 ${value ? "" : "text-gray-600"}`}>
            {getDisplayValue()}
          </span>
        )}

        {/* Arrow Icon */}
        <svg 
          className={`w-4 h-4 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50">
          {/* Search Bar */}
          {searchable && (
            <div className="p-2 border-b border-gray-200">
              <input
                type="text"
                placeholder={`Search ${label.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          
          {/* Options List */}
          <div className="max-h-40 overflow-y-auto">
            {/* "All" option for multiple selection */}
            {multiple && showAllOption && (
              <div
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 flex items-center justify-between ${
                  allSelected ? 'bg-orange-50' : ''
                }`}
                onClick={() => handleOptionClick('All')}
              >
                <span>All</span>
                {allSelected && (
                  <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            )}
            
            {/* Individual options */}
            {filteredOptions.map((option) => (
              <div
                key={option}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 flex items-center justify-between ${
                  isSelected(option) ? 'bg-orange-50' : ''
                }`}
                onClick={() => handleOptionClick(option)}
              >
                <span>{option}</span>
                {isSelected(option) && (
                  <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
