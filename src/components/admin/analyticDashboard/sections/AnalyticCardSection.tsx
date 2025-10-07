import { StatisticsCard } from "../StatisticsCard";
import { ShoppingCart, Wallet, BookCheck, Globe } from "lucide-react";
import { Bookings, Statistics } from "@/pages/admin/analytics";
import { calculateChange } from "@/utils/calculateChange";

interface AnalyticCardSectionProps {
  statsData: Statistics[] | null | undefined;
  bookingsData: Bookings[] | null | undefined;
}

const AnalyticCardSection: React.FC<AnalyticCardSectionProps> = ({
  statsData,
  bookingsData,
}) => {
  if (!statsData || statsData.length === 0) return <p>Loading...</p>;

  const latest = statsData[0];
  const previous = statsData[1];

  // 🗓️ Get current and previous month/year
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const previousMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  // 📅 Filter bookings for current & previous month
  const currentMonthBookings =
    bookingsData?.filter((b) => {
      const date = new Date(b.booking_date);
      return (
        date.getMonth() === currentMonth && date.getFullYear() === currentYear
      );
    }) ?? [];

  const previousMonthBookings =
    bookingsData?.filter((b) => {
      const date = new Date(b.booking_date);
      return (
        date.getMonth() === previousMonth &&
        date.getFullYear() === previousMonthYear
      );
    }) ?? [];

  // 📊 Calculate totals for current month
  const totalBookings = currentMonthBookings.length;
  const totalSales = currentMonthBookings.reduce(
    (sum, b) => sum + Number(b.total_amount ?? 0),
    0
  );
  const totalUsers = new Set(currentMonthBookings.map((b) => b.user_id)).size;

  // 📊 Calculate totals for previous month
  const prevBookings = previousMonthBookings.length;
  const prevSales = previousMonthBookings.reduce(
    (sum, b) => sum + Number(b.total_amount ?? 0),
    0
  );
  const prevUsers = new Set(previousMonthBookings.map((b) => b.user_id)).size;

  // 📈 Calculate change for each metric
  const totalBookingChange = calculateChange(totalBookings, prevBookings);
  const totalSalesChange = calculateChange(totalSales, prevSales);
  const totalUsersChange = calculateChange(totalUsers, prevUsers);

  const totalVisitorsChange = calculateChange(
    Number(latest?.total_visitors ?? 0),
    Number(previous?.total_visitors ?? 0)
  );

  // 🧮 Prepare card data
  const cards = [
    {
      title: "Total booking",
      value: totalBookings.toString(),
      change: totalBookingChange.change,
      changeType: totalBookingChange.changeType,
      icon: ShoppingCart,
    },
    {
      title: "Total sales",
      value: totalSales.toLocaleString(),
      change: totalSalesChange.change,
      changeType: totalSalesChange.changeType,
      icon: Wallet,
    },
    {
      title: "Total booking users",
      value: totalUsers.toString(),
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
