import DateRangePicker from "../../ui/DateRangePicker";
import { LineChartComponent } from "../LineChartComponent";
import { DropDownInput } from "../../ui/DropdownInput";
import { Button } from "../../ui/Button";
import { CreditCard } from "lucide-react";
import { Banknote } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import ProgressBarSection from "./ProgressBarSection";
import OccupancyBarChart from "../OccupancyRateBarChart";

const revenueData = [
  { month: "January", value: 40 },
  { month: "February", value: 50 },
  { month: "March", value: 97 },
  { month: "April", value: 39 },
  { month: "May", value: 55 },
  { month: "June", value: 82 },
];

const OccupancyAndGuestSection = () => {
  const options = ["Overall", "Room Types"];
  const { setValue } = useForm();
  const [selectedView, setSelectedView] = useState("Overall");

  const handleExport = (from: string, to: string) => {
    console.log("Exporting from", from, "to", to);
  };

  const handleViewChange = (value: string) => {
    setSelectedView(value);
  };

  return (
    <div className="flex flex-col bg-white rounded-lg shadow-md sm:p-8 w-full mt-10">
      <div className="flex md:flex-row flex-col w-full justify-between">
        <h2 className="mt-6 sm:mt-0 ml-3 sm:ml-0 text-lg font-medium text-gray-700">
          Occupancy & Guest
        </h2>
        {/* Right Side */}
        <div className="flex md:flex-row flex-col gap-4 items-center">
          <p className="text-gray-700 w-full text-right">View by</p>
          <DropDownInput
            options={options}
            name="options"
            setValue={setValue}
            onChange={(value) => setSelectedView(value)}
          />
          <DateRangePicker />
          <Button
            text="Export"
            loading={false}
            onClick={() => handleExport("start", "end")}
            className="bg-orange-600 text-white hover:bg-orange-700 h-10 w-40"
          />
        </div>
      </div>
      <h2 className="my-10">Occupancy Rate</h2>
      <div className="flex flex-col w-full">
        {/* Conditional Chart Rendering */}
        {selectedView === "Overall" ? (
          <LineChartComponent
            data={revenueData}
            datakey="month"
            lineColor="#E87B5A"
            height="h-80"
            yAxisTicks={[0, 20, 40, 60, 80, 100]}
            yAxisFormatter={(value) => `${value}%`}
          />
        ) : (
          <OccupancyBarChart />
        )}

        {/* Progress Bar Section */}
        <div className="grid grid-cols-2 gap-8">
          <div className="flex flex-col gap-y-4">
            <h3 className="my-3 font-semibold text-gray-800">Guest Visit</h3>
            <ProgressBarSection
              label="New guest"
              count="867 people"
              value={88}
            />
            <ProgressBarSection
              label="Returning guest"
              count="118 people"
              value={12}
            />
          </div>
          <div className="flex flex-col gap-y-4">
            <h3 className="my-3 font-semibold text-gray-800">Payment Method</h3>
            <div className="flex flex-row gap-4 items-center">
              <div className="flex bg-gray-400 w-10 h-10 items-center justify-center rounded-full">
                <CreditCard className="text-gray-700" />
              </div>
              <ProgressBarSection
                label="Credit card"
                count="699 people"
                value={71}
              />
            </div>
            <div className="flex flex-row gap-4 items-center">
              <div className="flex bg-gray-400 w-10 h-10 items-center justify-center rounded-full">
                <Banknote className="text-gray-700" />
              </div>
              <ProgressBarSection label="Cash" count="268 people" value={29} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OccupancyAndGuestSection;
