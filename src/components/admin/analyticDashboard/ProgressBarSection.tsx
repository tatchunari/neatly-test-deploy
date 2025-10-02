import { ProgressBar } from "../ui/ProgressBar";

interface ProgressBarSectionProps {
  label: string;
  count: string;
  value: number;
  color?: string;
}

const ProgressBarSection: React.FC<ProgressBarSectionProps> = ({
  label,
  count,
  value,
  color = "bg-orange-500",
}) => {
  return (
    <div className="w-full">
      <p className="font-bold">
        {label}
        <span className="font-semibold text-gray-700 ml-2">{count}</span>
      </p>

      <div className="flex flex-row items-center gap-3">
        <ProgressBar value={value} color={color} className="mt-2 flex-1" />
        <p className="font-bold">{value}%</p>
      </div>
    </div>
  );
};

export default ProgressBarSection;
