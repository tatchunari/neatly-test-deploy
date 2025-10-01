import { SelectInput } from "./SelectInput";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { useState } from "react";

const data = [
  { day: "Mon", bookings: 40 },
  { day: "Tue", bookings: 55 },
  { day: "Wed", bookings: 30 },
  { day: "Thu", bookings: 70 },
  { day: "Fri", bookings: 70 },
  { day: "Sat", bookings: 70 },
  { day: "Sun", bookings: 70 },
];

const period = ["This month", "This week", "Today"];

const BookingTrendsChart = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("This month");

  // Chart settings
  const xAxisKey = "day";
  const yAxisKey = "bookings";
  const yAxisTicks = [0, 20, 40, 60, 80, 100];
  const barColor = "#E87B5A";
  const maxBarSize = 10;

  return (
    <div className="bg-white rounded-lg shadow-md p-8 w-full h-90 mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-700">
          Booking Trends by Month
        </h2>
        <SelectInput
          options={period}
          value={selectedPeriod}
          onChange={(value) => {
            setSelectedPeriod(value);
            console.log("Selected period:", value);
          }}
          width="w-40"
        />
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
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
              dataKey={xAxisKey}
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
              dataKey={yAxisKey}
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
