import { useEffect, useState } from "react";

interface ProgressBarProps {
  value: number;
  color?: string; // tailwind class e.g. "bg-blue-600"
  height?: string; // tailwind class e.g. "h-3"
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  color = "bg-blue-600",
  height = "h-3",
  className = "",
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // animate from 0 to value on mount or when value changes
    const timeout = setTimeout(() => {
      setProgress(value);
    }, 100); // small delay to trigger CSS transition
    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <div
      className={`w-full bg-gray-200 rounded-full overflow-hidden ${height} ${className}`}
    >
      <div
        className={`${color} h-full rounded-full transition-all duration-1000 ease-out`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};
