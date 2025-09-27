import React, {
  forwardRef,
  useState,
  useRef,
  useLayoutEffect,
  useEffect,
} from "react";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "@/components/customer/icons/CalendarIcon";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, error, onChange, value, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [showCalendar, setShowCalendar] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const caretPosRef = useRef<number>(0);

    // ✅ sync ค่า value (ISO) → readable format
    useEffect(() => {
      if (value && value !== "mm/dd/yyyy" && typeof value === "string") {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          const formatted = date.toLocaleDateString("en-US", {
            weekday: "short",
            day: "numeric",
            month: "long",
            year: "numeric",
          });
          setInputValue(formatted);
        }
      } else {
        setInputValue("");
      }
    }, [value]);

    // ✅ mask template function
    const formatMask = (raw: string) => {
      const template = "mm/dd/yyyy".split("");
      const digits = raw.replace(/\D/g, "").slice(0, 8);

      let digitIndex = 0;
      for (let i = 0; i < template.length; i++) {
        if (/[mdy]/.test(template[i]) && digitIndex < digits.length) {
          template[i] = digits[digitIndex];
          digitIndex++;
        }
      }
      return template.join("");
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawDigits = e.target.value.replace(/\D/g, "").slice(0, 8);
      const masked = formatMask(rawDigits);
      setInputValue(masked);

      // caret position
      const getCaretPosition = (len: number) => {
        if (len <= 2) return len;
        if (len <= 4) return len + 1;
        return len + 2;
      };
      caretPosRef.current = getCaretPosition(rawDigits.length);

      // ถ้ากรอกครบ → แปลงเป็น ISO + readable
      if (rawDigits.length === 8) {
        const iso = `${rawDigits.substring(4)}-${rawDigits.substring(
          0,
          2
        )}-${rawDigits.substring(2, 4)}`;
        const date = new Date(iso);
        if (!isNaN(date.getTime())) {
          const formatted = date.toLocaleDateString("en-US", {
            weekday: "short",
            day: "numeric",
            month: "long",
            year: "numeric",
          });
          setInputValue(formatted);
          onChange?.({
            target: { value: iso },
          } as React.ChangeEvent<HTMLInputElement>);
        }
      }
    };

    // caret control
    useLayoutEffect(() => {
      if (inputRef.current && caretPosRef.current) {
        requestAnimationFrame(() => {
          inputRef.current?.setSelectionRange(
            caretPosRef.current,
            caretPosRef.current
          );
        });
      }
    }, [inputValue]);

    // mask hint
    const handleFocus = () => {
      setIsFocused(true);
      if (!inputValue) {
        setInputValue("mm/dd/yyyy"); // แสดง template
      }
    };

    const handleBlur = () => {
      setIsFocused(false);
      if (inputValue === "mm/dd/yyyy") {
        setInputValue(""); // clear template
        onChange?.({
          target: { value: "" },
        } as React.ChangeEvent<HTMLInputElement>);
      }
    };

    const handleDaySelect = (day: Date | undefined) => {
      if (day) {
        const iso = day.toISOString().split("T")[0]; // ✅ form เก็บ ISO
        const formatted = day.toLocaleDateString("en-US", {
          weekday: "short",
          day: "numeric",
          month: "long",
          year: "numeric",
        });
        setInputValue(formatted);
        onChange?.({
          target: { value: iso },
        } as React.ChangeEvent<HTMLInputElement>);
        setShowCalendar(false);
      }
    };

    return (
      <div className="relative">
        <input
          ref={(node) => {
            inputRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref)
              (ref as React.MutableRefObject<HTMLInputElement | null>).current =
                node;
          }}
          type="text"
          value={inputValue}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          placeholder="Select your date of birth"
          className={cn(
            "w-full h-12 pt-3 pr-10 pb-3 pl-3 border rounded",
            "bg-[var(--color-white)] border-[var(--color-gray-400)]",
            "focus:outline-none focus:ring-2 focus:ring-blue-500",
            "transition-colors duration-200",
            "font-inter text-base font-normal leading-6 tracking-normal",
            "text-[var(--color-gray-900)]",
            "placeholder:text-[var(--color-gray-600)]",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        />
        <div
          className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
          onClick={() => setShowCalendar(!showCalendar)}
        >
          <CalendarIcon size={20} className="text-[var(--color-gray-400)]" />
        </div>

        {showCalendar && (
          <div className="absolute z-10 mt-2 bg-white border rounded shadow">
            <DayPicker
              mode="single"
              onSelect={handleDaySelect}
              captionLayout="dropdown"
              defaultMonth={new Date(1990, 0)}
              disabled={(date) => date > new Date() || date < new Date(1900, 0)}
            />
          </div>
        )}
      </div>
    );
  }
);

DatePicker.displayName = "DatePicker";
