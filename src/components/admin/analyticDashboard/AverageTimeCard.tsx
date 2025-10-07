import { LucideIcon } from "lucide-react";

type TimeCardProps = {
  icon: LucideIcon;
  title: "Check-in" | "Check-out"; // restrict so we can infer color
  subtitle: string;
  time: string;
};

// Predefined color maps
const colorClasses = {
  green: {
    container: "bg-green-100",
    circle: "bg-green-300",
    icon: "text-green-600",
    title: "text-green-600",
    subtitle: "text-green-500",
    time: "text-green-600",
  },
  orange: {
    container: "bg-orange-100",
    circle: "bg-orange-300",
    icon: "text-orange-600",
    title: "text-orange-600",
    subtitle: "text-orange-500",
    time: "text-orange-600",
  },
};

const TimeCard = ({ icon: Icon, title, subtitle, time }: TimeCardProps) => {
  // auto-choose color based on title
  const color = title === "Check-in" ? "green" : "orange";
  const colors = colorClasses[color];

  return (
    <div
      className={`${colors.container} flex flex-row rounded-md justify-between`}
    >
      <div className="flex flex-row items-center p-4">
        <div
          className={`${colors.circle} w-15 h-15 flex justify-center items-center rounded-full`}
        >
          <Icon className={`w-8 h-8 ${colors.icon}`} />
        </div>
        <div className="flex flex-col mx-3">
          <h2 className={`font-bold ${colors.title}`}>{title}</h2>
          <p className={`${colors.subtitle}`}>{subtitle}</p>
        </div>
      </div>

      <p className={`p-5 font-bold text-xl ${colors.time}`}>{time}</p>
    </div>
  );
};

export default TimeCard;
