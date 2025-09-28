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

    // ✅ sync value (ISO) → readable
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

    // ✅ mask input mm/dd/yyyy
    const formatMask = (raw: string) => {
      const digits = raw.replace(/\D/g, "").slice(0, 8);
      const mm = digits.substring(0, 2);
      const dd = digits.substring(2, 4);
      const yyyy = digits.substring(4, 8);

      let masked = "mm/dd/yyyy".split("");
      if (mm) masked[0] = mm[0] || "m";
      if (mm.length > 1) masked[1] = mm[1];
      if (dd) masked[3] = dd[0] || "d";
      if (dd.length > 1) masked[4] = dd[1];
      if (yyyy) {
        for (let i = 0; i < yyyy.length; i++) {
          masked[6 + i] = yyyy[i];
        }
      }
      return masked.join("");
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawDigits = e.target.value.replace(/\D/g, "").slice(0, 8);
      const masked = formatMask(rawDigits);
      setInputValue(masked);

      // caret
      const getCaretPosition = (len: number) => {
        if (len <= 2) return len;
        if (len <= 4) return len + 1;
        return len + 2;
      };
      caretPosRef.current = getCaretPosition(rawDigits.length);

      // complete → update ISO
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

    // focus / blur
    const handleFocus = () => {
      setIsFocused(true);
      if (!inputValue) {
        setInputValue("mm/dd/yyyy");
      }
    };

    const handleBlur = () => {
      setIsFocused(false);
      if (inputValue === "mm/dd/yyyy") {
        setInputValue("");
        onChange?.({
          target: { value: "" },
        } as React.ChangeEvent<HTMLInputElement>);
      }
    };

    // ✅ calendar select (fix timezone shift)
    const handleDaySelect = (day: Date | undefined) => {
      if (day) {
        const year = day.getFullYear();
        const month = String(day.getMonth() + 1).padStart(2, "0");
        const date = String(day.getDate()).padStart(2, "0");
        const iso = `${year}-${month}-${date}`; // YYYY-MM-DD

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
