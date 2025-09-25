import { useState, useEffect } from "react";
import { UseFormRegisterReturn, UseFormSetValue } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RHFSelectProps {
  label: string;
  options: string[];
  register: UseFormRegisterReturn;
  setValue: UseFormSetValue<any>;
  name: string;
  defaultValue?: string;
}

export const DropDownInput = ({
  label,
  options,
  register,
  setValue,
  name,
  defaultValue = "",
}: RHFSelectProps) => {
  const [selected, setSelected] = useState(defaultValue || options[0]);

  useEffect(() => {
    setValue(name, selected); // initialize form value
  }, []);

  const handleChange = (value: string) => {
    setSelected(value);
    setValue(name, value); // update RHF value
  };

  return (
    <div className="flex flex-col w-full text-sm relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      <Select onValueChange={handleChange} value={selected}>
        <SelectTrigger className="w-full border-gray-300 bg-white">
          <SelectValue placeholder={`Select ${label}`}/>
        </SelectTrigger>
        <SelectContent className="bg-white border-gray-300">
          <SelectGroup className="border-gray-300">
            <SelectLabel>{label}</SelectLabel>
            {options.map((opt) => (
              <SelectItem key={opt} value={opt} className="hover:bg-gray-200">
                {opt}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {/* Hidden input registered with RHF */}
      <input type="hidden" {...register} value={selected} />
    </div>
  );
};
