import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const OccupancyBarChart = () => {
  const data = [
    {
      month: "January",
      "Superior Garden View": 75,
      Deluxe: 45,
      Superior: 35,
      Supreme: 55,
    },
    {
      month: "February",
      "Superior Garden View": 35,
      Deluxe: 30,
      Superior: 40,
      Supreme: 25,
    },
    {
      month: "March",
      "Superior Garden View": 40,
      Deluxe: 45,
      Superior: 50,
      Supreme: 55,
    },
    {
      month: "April",
      "Superior Garden View": 95,
      Deluxe: 75,
      Superior: 70,
      Supreme: 60,
    },
    {
      month: "May",
      "Superior Garden View": 80,
      Deluxe: 85,
      Superior: 75,
      Supreme: 90,
    },
    {
      month: "June",
      "Superior Garden View": 45,
      Deluxe: 65,
      Superior: 35,
      Supreme: 40,
    },
  ];

  const roomTypes = [
    {
      key: "Superior Garden View",
      color: "#f97316",
      label: "Superior Garden View",
    },
    { key: "Deluxe", color: "#1f2937", label: "Deluxe" },
    { key: "Superior", color: "#E5A5A5", label: "Superior" },
    { key: "Supreme", color: "#eab308", label: "Supreme" },
  ];

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

  return (
    <div className="w-full bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-end gap-6 mb-6 flex-wrap">
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
