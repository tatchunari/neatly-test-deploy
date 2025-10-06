import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

interface LineChartData {
  month: string;
  value: number;
}

interface LineChartComponentProps {
  data?: LineChartData[];
  lineColor?: string;
  areaColor?: string;
  height?: string;
  className?: string;
  yAxisTicks?: number[];
}

export const LineChartComponent = ({
  data = [],
  lineColor = "#E87B5A",
  height = "h-80",
  className = "",
  yAxisTicks,
}: LineChartComponentProps) => {
  return (
    <div className={`w-full ${height} ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={lineColor} stopOpacity={0.1} />
              <stop offset="95%" stopColor={lineColor} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="0"
            stroke="#F3F4F6"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9CA3AF", fontSize: 12 }}
            dy={10}
            padding={{ left: 30, right: 20 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            ticks={yAxisTicks}
            tick={{ fill: "#9CA3AF", fontSize: 12 }}
            tickFormatter={(value) => value.toLocaleString()}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="none"
            fillOpacity={1}
            fill="url(#colorValue)"
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={lineColor}
            strokeWidth={4}
            dot={{ fill: "#FFFFFF", strokeWidth: 4, r: 5 }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
