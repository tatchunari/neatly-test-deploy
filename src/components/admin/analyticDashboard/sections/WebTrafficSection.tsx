import { Button } from "../../ui/Button";
import { DropDownInput } from "../../ui/DropdownInput";
import { LineChartComponent, LineChartData } from "../LineChartComponent";

import { useForm } from "react-hook-form";
import { useState, useEffect, useMemo } from "react";

interface PageViewRecord {
  page: string;
  date: string;
  hour: string;
  timestamp: string;
  views: string;
}

type Timeframe = "Real-time" | "Yesterday" | "Last 7 Days" | "Last 30 days";

const WebTrafficSection = () => {
  const { setValue } = useForm();
  const [selectedTimeframe, setSelectedTimeframe] =
    useState<Timeframe>("Yesterday");
  const [selectedPage, setSelectedPage] = useState("All Pages");
  const [pageViewData, setPageViewData] = useState<PageViewRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Fixed page options
  const pageMapping: Record<string, string | null> = {
    "All Pages": null,
    Home: "/",
    "Superior Garden View": "/customer/search-result/1",
    Deluxe: "/customer/search-result/2",
    Superior: "/customer/search-result/3",
    Supreme: "/customer/search-result/4",
  };

  // Fetch GA4 data
  useEffect(() => {
    async function fetchPageViews() {
      try {
        const response = await fetch("/api/test-ga4");
        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          setPageViewData(result.data);
        }
      } catch (err) {
        console.error("Failed to fetch GA4 data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPageViews();
  }, []);

  // Filter + Aggregate data
  const chartData: LineChartData[] = useMemo(() => {
    if (pageViewData.length === 0) return [];

    const now = new Date();
    const selectedPath = pageMapping[selectedPage];

    // Filter by selected page
    let filtered = selectedPath
      ? pageViewData.filter((d) => d.page === selectedPath)
      : pageViewData;

    // Helper: group by key (hour or date)
    const groupBy = (
      arr: PageViewRecord[],
      keyFn: (item: PageViewRecord) => string
    ) => {
      const map = new Map<string, number>();
      for (const item of arr) {
        const key = keyFn(item);
        const views = parseInt(item.views, 10);
        map.set(key, (map.get(key) ?? 0) + views);
      }
      return Array.from(map.entries()).map(([key, value]) => ({
        key,
        value,
      }));
    };

    // Filter timeframe
    if (
      selectedTimeframe === "Real-time" ||
      selectedTimeframe === "Yesterday"
    ) {
      const targetDate = new Date(now);
      if (selectedTimeframe === "Yesterday")
        targetDate.setDate(targetDate.getDate() - 1);
      const dateStr = targetDate.toISOString().slice(0, 10).replace(/-/g, "");

      filtered = filtered.filter((item) => item.date === dateStr);

      const grouped = groupBy(filtered, (item) => item.hour.padStart(2, "0"));
      return grouped.map(({ key, value }) => ({
        time: `${key}:00`,
        value,
      }));
    }

    if (selectedTimeframe === "Last 7 Days") {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      filtered = filtered.filter((item) => {
        const date = new Date(item.timestamp);
        return date >= sevenDaysAgo && date <= now;
      });

      const grouped = groupBy(filtered, (item) => item.date);
      return grouped.map(({ key, value }) => ({
        time: new Date(
          `${key.slice(0, 4)}-${key.slice(4, 6)}-${key.slice(6, 8)}`
        ).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        value,
      }));
    }

    if (selectedTimeframe === "Last 30 days") {
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      filtered = filtered.filter((item) => {
        const date = new Date(item.timestamp);
        return date >= thirtyDaysAgo && date <= now;
      });

      const grouped = groupBy(filtered, (item) => item.date);
      const daily = grouped.map(({ key, value }) => ({
        date: new Date(
          `${key.slice(0, 4)}-${key.slice(4, 6)}-${key.slice(6, 8)}`
        ),
        value,
      }));

      // Group by week
      const weeklyMap = new Map<string, number>();
      for (const { date, value } of daily) {
        const weekKey = `${date.getFullYear()}-W${Math.ceil(
          date.getDate() / 7
        )}`;
        weeklyMap.set(weekKey, (weeklyMap.get(weekKey) ?? 0) + value);
      }

      return Array.from(weeklyMap.entries()).map(([key, value]) => ({
        time: key,
        value,
      }));
    }

    return [];
  }, [pageViewData, selectedTimeframe, selectedPage]);

  // Calculate Y-axis ticks
  const yAxisTicks = useMemo(() => {
    if (chartData.length === 0) return [0, 20, 40, 60, 80, 100];
    const max = Math.max(...chartData.map((d) => d.value));
    const step = Math.ceil(max / 6 / 10) * 10 || 1;
    return Array.from({ length: 7 }, (_, i) => i * step);
  }, [chartData]);

  const buttonClass = (timeframe: Timeframe) =>
    selectedTimeframe === timeframe
      ? "whitespace-nowrap border border-orange-500 text-orange-600 bg-orange-100"
      : "whitespace-nowrap border border-gray-400 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-100";

  if (loading) {
    return (
      <div className="flex flex-col bg-white rounded-lg shadow-md sm:p-8 w-full h-90 mt-10">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-80 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white rounded-lg shadow-md sm:p-8 w-full h-90 mt-10">
      <div className="flex w-full justify-between">
        <h2 className="mt-6 sm:mt-0 ml-3 sm:ml-0 text-lg font-medium text-gray-700">
          Website Traffic
        </h2>
        {/* Filters */}
        <div className="flex flex-row gap-4">
          <DropDownInput
            options={Object.keys(pageMapping)}
            name="pageFilter"
            setValue={setValue}
            onChange={(value) => setSelectedPage(value)}
          />
          {(
            ["Real-time", "Yesterday", "Last 7 Days", "Last 30 days"] as const
          ).map((tf) => (
            <Button
              key={tf}
              loading={false}
              text={tf}
              onClick={() => setSelectedTimeframe(tf)}
              className={buttonClass(tf)}
            />
          ))}
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 ? (
        <LineChartComponent
          data={chartData}
          datakey="time"
          lineColor="#E87B5A"
          height="h-80"
          yAxisTicks={yAxisTicks}
        />
      ) : (
        <div className="flex items-center justify-center h-80 text-gray-400">
          No traffic data available
        </div>
      )}
    </div>
  );
};

export default WebTrafficSection;
