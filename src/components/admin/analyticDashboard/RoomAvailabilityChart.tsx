import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { SelectInput } from "./SelectInput";

import { Room } from "@/types/rooms";

interface RoomAvailabilityChartProps {
  roomsData: Room[] | null | undefined;
}

const RoomAvailabilityChart: React.FC<RoomAvailabilityChartProps> = ({
  roomsData,
}) => {
  const occupiedCount =
    roomsData?.filter(
      (room) => room.status && room.status.startsWith("Occupied")
    ).length ?? 0;

  const bookedCount =
    roomsData?.filter((room) => room.status?.startsWith("Assign")).length ?? 0;

  const availableCount =
    roomsData?.filter((room) => room.status && room.status.startsWith("Vacant"))
      .length ?? 0;

  const roomAvailabilityData = [
    { name: "Occupied", value: occupiedCount, color: "#E76B39" },
    { name: "Booked", value: bookedCount, color: "#3D4F44" },
    { name: "Available", value: availableCount, color: "#C5CFDA" },
  ];

  const period = ["This month", "This week", "Today"];
  const [selectedPeriod, setSelectedPeriod] = useState("This month");

  return (
    <div className="flex flex-col items-center bg-gray-50 mt-8 w-full sm:w-full mx-auto">
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

          <div className="flex flex-col gap-4 ml-8 mt-10">
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
