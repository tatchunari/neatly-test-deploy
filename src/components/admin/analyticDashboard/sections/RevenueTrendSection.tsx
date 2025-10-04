import { DateRangePicker } from "../../ui/DateRangePicker";
import { LineChartComponent } from "../LineChartComponent";
import { Button } from "../../ui/Button";

const revenueData = [
  { month: "January", value: 40000 },
  { month: "February", value: 15000 },
  { month: "March", value: 55000 },
  { month: "April", value: 65000 },
  { month: "May", value: 38000 },
  { month: "June", value: 58000 },
];

const RevenueTrendSection = () => {
  const handleExport = (from: string, to: string) => {
    console.log("Exporting from", from, "to", to);
  };
  return (
    <div className="flex flex-col bg-white rounded-lg shadow-md sm:p-8 w-full h-90 mt-10">
      <div className="flex w-full justify-between">
        <h2 className="mt-6 sm:mt-0 ml-3 sm:ml-0 text-lg font-medium text-gray-700">
          Revenue Trend
        </h2>

        {/* Date Picker */}
        <div className="flex flex-row gap-4">
          <DateRangePicker />
          <Button
            text="Export"
            loading={false}
            onClick={() => handleExport("start", "end")}
            className="bg-orange-600 text-white hover:bg-orange-700 h-10"
          />
        </div>
      </div>
      {/* Line Chart */}
      <LineChartComponent
        data={revenueData}
        datakey="month"
        lineColor="#E87B5A"
        height="h-80"
        yAxisTicks={[0, 10000, 20000, 30000, 40000, 50000, 60000, 70000]}
      />
    </div>
  );
};

export default RevenueTrendSection;
