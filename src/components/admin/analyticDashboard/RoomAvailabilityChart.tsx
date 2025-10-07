import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { SelectInput } from "./SelectInput";

import { Room } from "@/types/rooms";
import { Bookings } from "@/pages/admin/analytics";

interface RoomAvailabilityChartProps {
  roomsData: Room[] | null | undefined;
  bookingsData: Bookings[] | null | undefined;
}

const RoomAvailabilityChart: React.FC<RoomAvailabilityChartProps> = ({
  roomsData,
  bookingsData,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState("This month");
  const period = ["This month", "This week", "Today"];

  // Calculate room availability based on selected timeframe
  const roomAvailabilityData = useMemo(() => {
    if (
      !roomsData ||
      roomsData.length === 0 ||
      !bookingsData ||
      bookingsData.length === 0
    ) {
      // If no bookings data, just show current room status
      const occupiedCount =
        roomsData?.filter(
          (room) => room.status && room.status.startsWith("Occupied")
        ).length ?? 0;
      const bookedCount =
        roomsData?.filter((room) => room.status?.startsWith("Assign")).length ??
        0;
      const availableCount =
        roomsData?.filter(
          (room) => room.status && room.status.startsWith("Vacant")
        ).length ?? 0;

      return [
        { name: "Occupied", value: occupiedCount, color: "#E76B39" },
        { name: "Booked", value: bookedCount, color: "#3D4F44" },
        { name: "Available", value: availableCount, color: "#C5CFDA" },
      ];
    }

    const now = new Date();
    let startDate = new Date();
    let endDate = new Date(now);

    // Determine date range based on selected period
    switch (selectedPeriod) {
      case "Today":
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "This week":
        // Get start of week (Sunday)
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay());
        startDate.setHours(0, 0, 0, 0);
        // Get end of week (Saturday)
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "This month":
        // Get start of month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        // Get end of month
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      default:
        startDate = new Date(now);
        endDate = new Date(now);
    }

    // Filter bookings that overlap with the selected period
    const relevantBookings = bookingsData.filter((booking) => {
      if (booking.status !== "confirmed" && booking.status !== "pending") {
        return false;
      }
      const checkIn = new Date(booking.check_in_date);
      const checkOut = new Date(booking.check_out_date);

      // Check if booking overlaps with the selected period
      return checkIn <= endDate && checkOut >= startDate;
    });

    // Get unique room IDs that are booked/occupied
    const bookedRoomIds = new Set(relevantBookings.map((b) => b.room_id));

    // Count rooms
    let occupiedCount = 0;
    let bookedCount = 0;
    let availableCount = 0;

    roomsData.forEach((room) => {
      if (bookedRoomIds.has(room.id)) {
        // Check if the booking is currently active (check-in <= now < check-out)
        const activeBooking = relevantBookings.find((booking) => {
          const checkIn = new Date(booking.check_in_date);
          const checkOut = new Date(booking.check_out_date);
          return (
            booking.room_id === room.id && checkIn <= now && checkOut > now
          );
        });

        if (activeBooking) {
          occupiedCount++;
        } else {
          // Future booking
          bookedCount++;
        }
      } else {
        availableCount++;
      }
    });

    return [
      { name: "Occupied", value: occupiedCount, color: "#E76B39" },
      { name: "Booked", value: bookedCount, color: "#3D4F44" },
      { name: "Available", value: availableCount, color: "#C5CFDA" },
    ];
  }, [roomsData, bookingsData, selectedPeriod]);

  return (
    <div className="flex flex-col items-center bg-gray-50 mt-8 w-full h-70 sm:h-60 mx-auto">
      <div className="flex flex-col bg-white rounded-lg shadow-md sm:p-8 w-full h-90 sm:max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="mt-6 sm:mt-0 ml-3 sm:ml-0 text-lg font-medium text-gray-700">
            Room Availability
          </h2>
          <SelectInput
            options={period}
            value={selectedPeriod}
            onChange={(value) => {
              setSelectedPeriod(value);
            }}
            width="w-35"
            className="mr-5 md:mr-0 mt-5 md:mt-0"
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="relative w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] md:w-[300px] md:h-[300px] md:bottom-10">
            {/* Desktop Pie chart */}
            <div className="md:w-full md:h-full w-40 h-40 hidden md:block">
              <div className="bg-white/30 w-50 h-50 absolute rounded-full z-30 top-12 left-12"></div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roomAvailabilityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={125}
                    paddingAngle={0}
                    dataKey="value"
                    startAngle={90}
                    endAngle={450}
                  >
                    {roomAvailabilityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Mobile Pie chart */}
            <div className="block md:hidden w-[180px] h-[180px]">
              <div className="bg-white/30 w-32 h-32 absolute rounded-full z-30 top-6.5 left-6.5"></div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roomAvailabilityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    startAngle={90}
                    endAngle={450}
                  >
                    {roomAvailabilityData.map((entry, index) => (
                      <Cell key={`mobile-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="flex flex-col gap-4 md:ml-8 md:mt-10 mr-5 mt-10">
            {roomAvailabilityData.map((entry, index) => (
              <div key={index} className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-700 font-medium">
                  {entry.name}
                </span>
                <span className="text-sm text-gray-500 ml-auto">
                  {entry.value}
                </span>
                <span className="text-sm text-gray-400">Rooms</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomAvailabilityChart;
