import { useState, useEffect } from "react";
import {
  UseFormRegisterReturn,
  UseFormSetValue,
  Path,
  FieldValues,
  PathValue,
} from "react-hook-form";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RHFSelectProps<T extends FieldValues, K extends Path<T>> {
  label?: string;
  options: PathValue<T, K>[]; // 👈 ensure options match the field's type
  register?: UseFormRegisterReturn;
  setValue: UseFormSetValue<T>;
  name: K;
  defaultValue?: PathValue<T, K>;
  onChange?: (value: PathValue<T, K>) => void;
}

export const DropDownInput = <T extends FieldValues, K extends Path<T>>({
  label,
  options,
  register,
  setValue,
  name,
  defaultValue,
  onChange,
}: RHFSelectProps<T, K>) => {
  const [selected, setSelected] = useState<PathValue<T, K>>(
    defaultValue ?? options[0]
  );

  useEffect(() => {
    setValue(name, selected); // ✅ typed correctly now
  }, [name, selected, setValue]);

  const handleChange = (value: PathValue<T, K>) => {
    setSelected(value);
    setValue(name, value);
    onChange?.(value);
  };

  return (
    <div className="flex flex-col w-full text-sm relative">
      <label className="block text-sm font-medium text-gray-900 mb-2">
        {label}
      </label>

      <Select onValueChange={handleChange} value={selected as string} disabled={disabled}>
        <SelectTrigger className={`w-full border border-gray-300 !bg-white rounded-md text-sm px-3 py-2 ${
          disabled 
            ? "text-gray-600 cursor-pointer !bg-white !border-gray-300 !opacity-50" 
            : "hover:border-orange-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 cursor-pointer"
        }`}>
          <SelectValue placeholder={`Select ${label}`} />
        </SelectTrigger>
        <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg">
          <SelectGroup>
            {options.map((opt) => (
              <SelectItem key={opt as string} value={opt as string}>
                {opt}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {/* Hidden input registered with RHF */}
      <input type="hidden" {...register} value={selected as string} />
    </div>
  );
};