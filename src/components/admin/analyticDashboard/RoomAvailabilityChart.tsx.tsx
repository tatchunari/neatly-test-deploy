import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { SelectInput } from "./SelectInput";

const RoomAvailabilityChart = () => {
  const data = [
    { name: "Occupied", value: 21, color: "#E87B5A" },
    { name: "Booked", value: 16, color: "#3D4F44" },
    { name: "Available", value: 8, color: "#C5CFDA" },
  ];

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const currentMonth = new Date().toLocaleString("en-US", {
    month: "long",
  });
  const [selectedPeriod, setSelectedPeriod] = useState(currentMonth);

  const total = data.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 py-8">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-700">
            Room Availability
          </h2>
          <SelectInput
            options={months}
            value={selectedPeriod}
            onChange={(value) => {
              setSelectedPeriod(value);
              console.log("Selected period:", value);
            }}
            width="w-35"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="relative" style={{ width: "200px", height: "200px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={0}
                  dataKey="value"
                  startAngle={90}
                  endAngle={450}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-col gap-4 ml-8">
            {data.map((entry, index) => (
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
