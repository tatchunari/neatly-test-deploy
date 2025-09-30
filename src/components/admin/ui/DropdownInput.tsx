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
  label: string;
  options: PathValue<T, K>[]; // 👈 ensure options match the field's type
  register: UseFormRegisterReturn;
  setValue: UseFormSetValue<T>;
  name: K;
  defaultValue?: PathValue<T, K>;
}

export const DropDownInput = <T extends FieldValues, K extends Path<T>>({
  label,
  options,
  register,
  setValue,
  name,
  defaultValue,
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
  };

  return (
    <div className="flex flex-col w-full text-sm relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      <Select onValueChange={handleChange} value={selected as string}>
        <SelectTrigger className="w-full border-gray-300 bg-white">
          <SelectValue placeholder={`Select ${label}`} />
        </SelectTrigger>
        <SelectContent className="bg-white border-gray-300">
          <SelectGroup className="border-gray-300">
            <SelectLabel>{label}</SelectLabel>
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
