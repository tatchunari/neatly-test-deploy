interface StatCardProps {
  title: string;
  value: string | number;
  change: string;
  changeType?: "up" | "down";
  icon: React.ComponentType<{ className?: string }>;
}

export const StatisticsCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
}) => {
  const isPositive = changeType === "up";
  const isNegative = changeType === "down";

  return (
    <div className="bg-white rounded-lg py-4 px-5 w-full shadow-sm border border-gray-200 flex items-center justify-between relative">
      <div className="flex-1">
        <p className="text-gray-900 text-lg mb-2 font-inter">{title}</p>
        <p className="text-3xl font-semibold text-gray-900 mb-2 font-inter">
          {value}
        </p>
        <div className="flex items-center gap-1">
          {isPositive && (
            <svg
              className="w-4 h-4 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          )}
          {isNegative && (
            <svg
              className="w-4 h-4 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
              />
            </svg>
          )}
          <span
            className={`text-sm ${
              isPositive
                ? "text-green-600"
                : isNegative
                ? "text-red-600"
                : "text-gray-600"
            }`}
          >
            {change}
          </span>
        </div>
      </div>
      <div className="bg-gray-300 rounded-full p-3 right-5 top-5 absolute">
        <Icon className="w-6 h-6 text-gray-700" />
      </div>
    </div>
  );
};
