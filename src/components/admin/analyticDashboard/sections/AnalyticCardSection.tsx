import { StatisticsCard } from "../StatisticsCard";
import { ShoppingCart, Wallet, BookCheck, Globe } from "lucide-react";
import { Statistics } from "@/pages/admin/analytics";

import { calculateChange } from "@/utils/calculateChange";

interface AnalyticCardSectionProps {
  statsData: Statistics[] | null | undefined;
}

const AnalyticCardSection: React.FC<AnalyticCardSectionProps> = ({
  statsData,
}) => {
  // Use the latest stats record
  const latestStats = statsData?.[0];

  if (!latestStats) return <p>Loading...</p>;

  const latest = statsData?.[0];
  const previous = statsData?.[1];

  const totalBookingChange = calculateChange(
    Number(latest?.total_bookings ?? 0),
    Number(previous?.total_bookings ?? 0)
  );

  const totalSalesChange = calculateChange(
    Number(latest?.total_sales ?? 0),
    Number(previous?.total_sales ?? 0)
  );

  const totalUsersChange = calculateChange(
    Number(latest?.total_users ?? 0),
    Number(previous?.total_users ?? 0)
  );

  const totalVisitorsChange = calculateChange(
    Number(latest?.total_visitors ?? 0),
    Number(previous?.total_visitors ?? 0)
  );

  const cards = [
    {
      title: "Total booking",
      value: latest?.total_bookings.toString() ?? "0",
      change: totalBookingChange.change,
      changeType: totalBookingChange.changeType,
      icon: ShoppingCart,
    },
    {
      title: "Total sales",
      value: latest?.total_sales.toString() ?? "0",
      change: totalSalesChange.change,
      changeType: totalSalesChange.changeType,
      icon: Wallet,
    },
    {
      title: "Total booking users",
      value: latest?.total_users.toString() ?? "0",
      change: totalUsersChange.change,
      changeType: totalUsersChange.changeType,
      icon: BookCheck,
    },
    {
      title: "Total site visitors",
      value: latest?.total_visitors.toString() ?? "0",
      change: totalVisitorsChange.change,
      changeType: totalVisitorsChange.changeType,
      icon: Globe,
    },
  ];
  return (
    <div className="flex md:flex-row flex-col justify-center gap-5">
      {cards.map((card, index) => (
        <StatisticsCard
          key={index}
          title={card.title}
          value={card.value}
          change={card.change}
          changeType={card.changeType}
          icon={card.icon}
        />
      ))}
    </div>
  );
};

export default AnalyticCardSection;
