import DatePicker from "../../ui/DatePicker";
import { LineChartComponent } from "../LineChartComponent";
import { Button } from "../../ui/Button";

import { Bookings } from "@/pages/admin/analytics";

import { useState, useMemo } from "react";

const revenueData = [
  { month: "January", value: 40000 },
  { month: "February", value: 15000 },
  { month: "March", value: 55000 },
  { month: "April", value: 65000 },
  { month: "May", value: 38000 },
  { month: "June", value: 58000 },
];

interface BookingTrendsChartProps {
  bookingsData: Bookings[] | null | undefined;
}

const RevenueTrendSection: React.FC<BookingTrendsChartProps> = ({
  bookingsData,
}) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const revenueData = useMemo(() => {
    if (!bookingsData || bookingsData.length === 0) return [];

    // Filter bookings by date range if dates are selected
    let filteredBookings = bookingsData;

    if (startDate && endDate) {
      filteredBookings = bookingsData.filter((booking) => {
        const bookingDate = new Date(booking.booking_date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return bookingDate >= start && bookingDate <= end;
      });
    }

    // Group bookings by month and calculate revenue
    const monthlyRevenue: Record<string, number> = {};
    filteredBookings.forEach((booking) => {
      if (booking.status === "confirmed" || booking.status === "pending") {
        const date = new Date(booking.booking_date);
        const monthYear = `${date.toLocaleString("default", {
          month: "long",
        })} ${date.getFullYear()}`;

        if (!monthlyRevenue[monthYear]) {
          monthlyRevenue[monthYear] = 0;
        }

        monthlyRevenue[monthYear] += booking.total_amount || 0;
      }
    });

    // Convert to array format for chart
    return Object.entries(monthlyRevenue)
      .map(([month, value]) => ({ month, value }))
      .sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA.getTime() - dateB.getTime();
      });
  }, [bookingsData, startDate, endDate]);

  const [selectedDate, setSelectedDate] = useState("");
  // Calculate dynamic Y-axis ticks based on max revenue
  const yAxisTicks = useMemo(() => {
    if (revenueData.length === 0)
      return [0, 10000, 20000, 30000, 40000, 50000, 60000, 70000];

    const maxValue = Math.max(...revenueData.map((d) => d.value));
    const tickCount = 8;
    const step = Math.ceil(maxValue / tickCount / 1000) * 1000; // Round to nearest 1000

    return Array.from({ length: tickCount + 1 }, (_, i) => i * step);
  }, [revenueData]);

  const handleExport = () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates");
      return;
    }

    console.log("Exporting revenue data from", startDate, "to", endDate);

    // Create CSV content
    const csvContent = [
      "Month,Revenue",
      ...revenueData.map((item) => `${item.month},${item.value}`),
    ].join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `revenue_${startDate}_to_${endDate}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col bg-white rounded-lg shadow-md sm:p-8 w-full h-100 sm:h-full mt-10 md:pb-5 pb-5">
      <div className="flex md:flex-row flex-col w-full justify-between">
        <div className="flex flex-row justify-between">
          <h2 className="mt-6 sm:mt-0 ml-3 sm:ml-0 text-lg font-medium text-gray-700">
            Revenue Trend
          </h2>
          <Button
            text="Export"
            loading={false}
            onClick={handleExport}
            className="bg-orange-600 text-white hover:bg-orange-700 h-10 md:hidden mt-4 mr-4"
          />
        </div>
        {/* Date Picker */}
        <div className="flex flex-row gap-4 md:p-0 p-5 items-center">
          <div className="flex md:flex-row flex-col gap-2">
            <p>From</p>
            <DatePicker
              label="Start date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min="2020-01-01"
              max="2030-12-31"
            />
          </div>

          <div className="flex md:flex-row flex-col gap-2">
            <p>to</p>
            <DatePicker
              label="End date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || "2020-01-01"}
              max="2030-12-31"
            />
          </div>
          <Button
            text="Export"
            loading={false}
            onClick={handleExport}
            className="bg-orange-600 text-white hover:bg-orange-700 h-10 md:block hidden"
          />
        </div>
      </div>

      {/* Line Chart */}
      {revenueData.length > 0 ? (
        <LineChartComponent
          data={revenueData}
          datakey="month"
          lineColor="#E87B5A"
          height="h-80"
          yAxisTicks={yAxisTicks}
        />
      ) : (
        <div className="flex items-center justify-center h-80 text-gray-400">
          {startDate && endDate
            ? "No revenue data for selected period"
            : "Select a date range to view revenue trends"}
        </div>
      )}
    </div>
  );
};

export default RevenueTrendSection;
