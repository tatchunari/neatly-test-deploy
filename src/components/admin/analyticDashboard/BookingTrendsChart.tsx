import { useState, useMemo } from "react";
import { Bookings } from "@/pages/admin/analytics";
import { SelectInput } from "./SelectInput";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

interface BookingTrendsChartProps {
  bookingsData: Bookings[] | null | undefined;
}

const periodOptions = ["This month", "Last month", "Last 2 months"];

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getBookingTrends(bookings: Bookings[], period: string) {
  const now = new Date();
  let startDate: Date;
  let endDate: Date;

  if (period === "This month") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  } else if (period === "Last month") {
    startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    endDate = new Date(now.getFullYear(), now.getMonth(), 0);
  } else {
    // Last 2 months
    startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  }

  const trends: Record<string, number> = {
    Mon: 0,
    Tue: 0,
    Wed: 0,
    Thu: 0,
    Fri: 0,
    Sat: 0,
    Sun: 0,
  };

  bookings.forEach((booking) => {
    const date = new Date(booking.check_in_date);
    if (
      date >= startDate &&
      date <= endDate &&
      booking.status?.toLowerCase() === "confirmed"
    ) {
      const jsDay = date.getDay();
      const weekday = weekDays[jsDay === 0 ? 6 : jsDay - 1];
      trends[weekday] += 1;
    }
  });

  return weekDays.map((day) => ({ day, bookings: trends[day] }));
}

const BookingTrendsChart: React.FC<BookingTrendsChartProps> = ({
  bookingsData,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState("This month");

  const chartData = useMemo(() => {
    if (!bookingsData) return [];
    return getBookingTrends(bookingsData, selectedPeriod);
  }, [bookingsData, selectedPeriod]);

  const yAxisTicks = [0, 5, 10, 15, 20]; // adjust dynamically if needed
  const barColor = "#E87B5A";
  const maxBarSize = 10;

  console.log("Chart Data", chartData);
  return (
    <div className="bg-white rounded-lg shadow-md p-8 w-full h-100 sm:h-90 mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-700">
          Booking Trends by Day
        </h2>
        <SelectInput
          options={periodOptions}
          value={selectedPeriod}
          onChange={(value) => setSelectedPeriod(value)}
          width="w-40"
        />
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            barCategoryGap="20%"
            barGap={2}
          >
            <CartesianGrid
              strokeDasharray="0"
              stroke="#F3F4F6"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9CA3AF", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9CA3AF", fontSize: 12 }}
              ticks={yAxisTicks}
            />
            <Bar
              dataKey="bookings"
              fill={barColor}
              radius={[4, 4, 0, 0]}
              maxBarSize={maxBarSize}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BookingTrendsChart;
