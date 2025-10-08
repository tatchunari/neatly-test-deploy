import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useMemo } from "react";
import { Bookings } from "@/pages/admin/analytics";
import { Room } from "@/types/rooms";

interface OccupancyChartProps {
  bookings: Bookings[] | null | undefined;
  rooms: Room[] | null | undefined;
  startDate: string;
  endDate: string;
}

const OccupancyBarChart: React.FC<OccupancyChartProps> = ({
  bookings,
  rooms,
  startDate,
  endDate,
}) => {
  // Get unique room types and assign colors
  const roomTypes = useMemo(() => {
    if (!rooms || rooms.length === 0) return [];

    const uniqueTypes = [...new Set(rooms.map((room) => room.room_type))];
    const colors = [
      "#f97316",
      "#1f2937",
      "#E5A5A5",
      "#eab308",
      "#3b82f6",
      "#10b981",
    ];

    return uniqueTypes.map((type, index) => ({
      key: type,
      color: colors[index % colors.length],
      label: type,
    }));
  }, [rooms]);

  // Calculate occupancy data by room type
  const data = useMemo(() => {
    if (!bookings || bookings.length === 0 || !rooms || rooms.length === 0)
      return [];

    // Filter bookings by date range if dates are selected
    let filteredBookings = bookings;

    if (startDate && endDate) {
      filteredBookings = bookings.filter((booking) => {
        const checkIn = new Date(booking.check_in_date);
        const checkOut = new Date(booking.check_out_date);
        const start = new Date(startDate);
        const end = new Date(endDate);

        return checkIn <= end && checkOut >= start;
      });
    }

    // Count rooms by type
    const roomsByType: Record<string, number> = {};
    rooms.forEach((room) => {
      const type = room.room_type;
      roomsByType[type] = (roomsByType[type] || 0) + 1;
    });

    // Calculate occupancy by month and room type
    const monthlyData: Record<
      string,
      Record<string, { bookedDays: number; totalDays: number }>
    > = {};

    filteredBookings.forEach((booking) => {
      if (booking.status === "confirmed" || booking.status === "pending") {
        // Find the room to get its type
        const room = rooms.find((r) => r.id === booking.room_id);
        if (!room) return;

        const roomType = room.room_type;
        const checkIn = new Date(booking.check_in_date);
        const checkOut = new Date(booking.check_out_date);

        // Iterate through each day of the booking
        for (
          let d = new Date(checkIn);
          d < checkOut;
          d.setDate(d.getDate() + 1)
        ) {
          const monthYear = `${d.toLocaleString("default", {
            month: "long",
          })} ${d.getFullYear()}`;

          if (!monthlyData[monthYear]) {
            monthlyData[monthYear] = {};
          }

          if (!monthlyData[monthYear][roomType]) {
            const daysInMonth = new Date(
              d.getFullYear(),
              d.getMonth() + 1,
              0
            ).getDate();
            monthlyData[monthYear][roomType] = {
              bookedDays: 0,
              totalDays: daysInMonth * (roomsByType[roomType] || 1),
            };
          }

          monthlyData[monthYear][roomType].bookedDays += 1;
        }
      }
    });

    // Convert to array format with occupancy percentages
    const result = Object.entries(monthlyData)
      .map(([month, types]) => {
        const monthData: Record<string, number | string> = { month };

        Object.entries(types).forEach(([roomType, data]) => {
          monthData[roomType] = Math.round(
            (data.bookedDays / data.totalDays) * 100
          );
        });

        // Fill in 0 for room types with no bookings
        roomTypes.forEach((rt) => {
          if (!(rt.key in monthData)) {
            monthData[rt.key] = 0;
          }
        });

        return monthData;
      })
      .sort((a, b) => {
        const dateA = new Date(a.month as string);
        const dateB = new Date(b.month as string);
        return dateA.getTime() - dateB.getTime();
      });

    return result;
  }, [bookings, rooms, startDate, endDate, roomTypes]);

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="w-full bg-white">
        <div className="flex items-center justify-center h-96 text-gray-400">
          {startDate && endDate
            ? "No occupancy data for selected period"
            : "Select a date range to view occupancy by room type"}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex md:justify-end gap-6 mb-6 md:p-0 p-4 flex-wrap">
          {roomTypes.map((room) => (
            <div key={room.key} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: room.color }}
              />
              <span className="text-sm text-gray-700">{room.label}</span>
            </div>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            barSize={10}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f0f0f0"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{ fill: "#6b7280", fontSize: 12 }}
              axisLine={{ stroke: "#e5e7eb" }}
            />
            <YAxis
              tick={{ fill: "#6b7280", fontSize: 12 }}
              axisLine={{ stroke: "#e5e7eb" }}
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            {roomTypes.map((room) => (
              <Bar
                key={room.key}
                dataKey={room.key}
                fill={room.color}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default OccupancyBarChart;
