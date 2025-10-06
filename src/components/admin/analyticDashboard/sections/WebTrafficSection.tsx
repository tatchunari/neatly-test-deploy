import { Button } from "../../ui/Button";
import { DropDownInput } from "../../ui/DropdownInput";
import { LineChartComponent } from "../LineChartComponent";

import { useForm } from "react-hook-form";
import { useState, useMemo } from "react";
import { Statistics } from "@/pages/admin/analytics";

interface WebTrafficSectionProps {
  statsData: Statistics[] | null | undefined;
}

const revenueData = [
  { time: "04:00 AM", value: 0 },
  { time: "06:00 AM", value: 0 },
  { time: "12:00 AM", value: 30 },
  { time: "04:00 PM", value: 28 },
  { time: "08:00 PM", value: 60 },
  { time: "12:00 PM", value: 50 },
];

const options = ["All Pages", "Home", "Superior Garden", "Deluxe", "Superior"];

const WebTrafficSection: React.FC<WebTrafficSectionProps> = ({ statsData }) => {
  const { setValue } = useForm();
  const [selectedTimeframe, setSelectedTimeframe] = useState("Yesterday");
  const [selectedPage, setSelectedPage] = useState("All Pages");

  // Calculate web traffic data based on selected timeframe
  const trafficData = useMemo(() => {
    if (!statsData || statsData.length === 0) return [];

    const now = new Date();
    let filteredStats = [];

    // Filter statistics based on timeframe
    switch (selectedTimeframe) {
      case "Real-time":
      case "Yesterday":
        // Get yesterday's data
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        filteredStats = statsData.filter((stat) => {
          const statDate = new Date(stat.period_start);
          return statDate.toDateString() === yesterday.toDateString();
        });
        break;

      case "Last 7 Days":
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        filteredStats = statsData.filter((stat) => {
          const statDate = new Date(stat.period_start);
          return statDate >= sevenDaysAgo && statDate <= now;
        });
        break;

      case "Last 30 days":
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        filteredStats = statsData.filter((stat) => {
          const statDate = new Date(stat.period_start);
          return statDate >= thirtyDaysAgo && statDate <= now;
        });
        break;

      default:
        filteredStats = statsData;
    }

    // For Yesterday/Real-time: Show hourly data (simulate 24 hours)
    interface HourlyDataObject {
      time: string;
      value: number;
    }
    if (
      selectedTimeframe === "Yesterday" ||
      selectedTimeframe === "Real-time"
    ) {
      const hourlyData: HourlyDataObject[] = [];
      const totalVisitors = filteredStats.reduce(
        (sum, stat) => sum + (stat.total_visitors || 0),
        0
      );

      // Simulate hourly distribution (peak hours in afternoon/evening)
      const hours = [
        { time: "12:00 AM", factor: 0.02 },
        { time: "02:00 AM", factor: 0.01 },
        { time: "04:00 AM", factor: 0.01 },
        { time: "06:00 AM", factor: 0.03 },
        { time: "08:00 AM", factor: 0.05 },
        { time: "10:00 AM", factor: 0.08 },
        { time: "12:00 PM", factor: 0.1 },
        { time: "02:00 PM", factor: 0.12 },
        { time: "04:00 PM", factor: 0.15 },
        { time: "06:00 PM", factor: 0.18 },
        { time: "08:00 PM", factor: 0.14 },
        { time: "10:00 PM", factor: 0.08 },
      ];

      hours.forEach((hour) => {
        hourlyData.push({
          time: hour.time,
          value: Math.round(totalVisitors * hour.factor),
        });
      });

      return hourlyData;
    }

    // For Last 7 Days: Show daily data
    if (selectedTimeframe === "Last 7 Days") {
      const dailyData = [];
      for (let i = 6; i >= 0; i--) {
        const day = new Date(now);
        day.setDate(day.getDate() - i);

        const dayStats = filteredStats.filter((stat) => {
          const statDate = new Date(stat.period_start);
          return statDate.toDateString() === day.toDateString();
        });

        const visitors = dayStats.reduce(
          (sum, stat) => sum + (stat.total_visitors || 0),
          0
        );

        dailyData.push({
          time: day.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          value: visitors,
        });
      }
      return dailyData;
    }

    // For Last 30 Days: Show weekly data
    if (selectedTimeframe === "Last 30 days") {
      const weeklyData = [];
      for (let i = 4; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - i * 7);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        const weekStats = filteredStats.filter((stat) => {
          const statDate = new Date(stat.period_start);
          return statDate >= weekStart && statDate <= weekEnd;
        });

        const visitors = weekStats.reduce(
          (sum, stat) => sum + (stat.total_visitors || 0),
          0
        );

        weeklyData.push({
          time: `${weekStart.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}`,
          value: visitors,
        });
      }
      return weeklyData;
    }

    return [];
  }, [statsData, selectedTimeframe]);

  // Calculate dynamic Y-axis ticks
  const yAxisTicks = useMemo(() => {
    if (trafficData.length === 0) return [0, 20, 40, 60, 80, 100, 120, 140];

    const maxValue = Math.max(...trafficData.map((d) => d.value));
    const tickCount = 7;
    const step = Math.ceil(maxValue / tickCount / 10) * 10 || 1; // Round to nearest 10

    return Array.from({ length: tickCount + 1 }, (_, i) => i * step);
  }, [trafficData]);

  const handleTimeframeClick = (timeframe) => {
    setSelectedTimeframe(timeframe);
  };

  const buttonClass = (timeframe) => {
    return selectedTimeframe === timeframe
      ? "whitespace-nowrap border-1 border-orange-500 text-orange-600 bg-orange-100"
      : "whitespace-nowrap border-1 border-gray-400 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-100";
  };

  return (
    <div className="flex flex-col bg-white rounded-lg shadow-md sm:p-8 w-full h-90 mt-10">
      <div className="flex w-full justify-between">
        <h2 className="mt-6 sm:mt-0 ml-3 sm:ml-0 text-lg font-medium text-gray-700">
          Website Traffic
        </h2>
        {/* Filter Section */}
        <div className="flex flex-row gap-4">
          <DropDownInput
            options={options}
            name="options"
            setValue={setValue}
            onChange={(value) => setSelectedPage(value)}
          />
          <Button
            loading={false}
            text="Real-time"
            onClick={() => handleTimeframeClick("Real-time")}
            className={buttonClass("Real-time")}
          />
          <Button
            loading={false}
            text="Yesterday"
            onClick={() => handleTimeframeClick("Yesterday")}
            className={buttonClass("Yesterday")}
          />
          <Button
            loading={false}
            text="Last 7 Days"
            onClick={() => handleTimeframeClick("Last 7 Days")}
            className={buttonClass("Last 7 Days")}
          />
          <Button
            loading={false}
            text="Last 30 days"
            onClick={() => handleTimeframeClick("Last 30 days")}
            className={buttonClass("Last 30 days")}
          />
        </div>
      </div>
      {/* Line Chart */}
      {trafficData.length > 0 ? (
        <LineChartComponent
          data={trafficData}
          datakey="time"
          lineColor="#E87B5A"
          height="h-80"
          yAxisTicks={yAxisTicks}
        />
      ) : (
        <div className="flex items-center justify-center h-80 text-gray-400">
          No traffic data available for selected timeframe
        </div>
      )}
    </div>
  );
};

export default WebTrafficSection;
