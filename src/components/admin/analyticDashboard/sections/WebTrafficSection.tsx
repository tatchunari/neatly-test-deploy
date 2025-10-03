import { Button } from "../../ui/Button";
import { DropDownInput } from "../../ui/DropdownInput";
import { LineChartComponent } from "../LineChartComponent";

import { useForm } from "react-hook-form";

const revenueData = [
  { time: "04:00 AM", value: 0 },
  { time: "06:00 AM", value: 0 },
  { time: "12:00 AM", value: 30 },
  { time: "04:00 PM", value: 28 },
  { time: "08:00 PM", value: 60 },
  { time: "12:00 PM", value: 50 },
];

const options = ["All Pages", "Home", "Superior Garden", "Deluxe", "Superior"];

const WebTrafficSection = () => {
  const { setValue } = useForm();
  return (
    <div className="flex flex-col bg-white rounded-lg shadow-md sm:p-8 w-full h-90 mt-10">
      <div className="flex w-full justify-between">
        <h2 className="mt-6 sm:mt-0 ml-3 sm:ml-0 text-lg font-medium text-gray-700">
          Website Traffic
        </h2>

        {/* Filter Section */}
        <div className="flex flex-row gap-4">
          <DropDownInput options={options} name="options" setValue={setValue} />
          <Button
            loading={false}
            text="Real-time"
            className="whitespace-nowrap border-1 border-gray-400 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-100 focus:bg-orange-100 focus:text-orange-600 focus:border-orange-500"
          />

          <Button
            loading={false}
            text="Yesterday"
            className="whitespace-nowrap border-1 border-gray-400 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-100 focus:bg-orange-100 focus:text-orange-600 focus:border-orange-500"
          />

          <Button
            loading={false}
            text="Last 7 Days"
            className="whitespace-nowrap border-1 border-gray-400 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-100 focus:bg-orange-100 focus:text-orange-600 focus:border-orange-500"
          />

          <Button
            loading={false}
            text="Last 30 days"
            className="whitespace-nowrap border-1 border-gray-400 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-100 focus:bg-orange-100 focus:text-orange-600 focus:border-orange-500"
          />
        </div>
      </div>
      {/* Line Chart */}
      <LineChartComponent
        data={revenueData}
        datakey="time"
        lineColor="#E87B5A"
        height="h-80"
        yAxisTicks={[0, 20, 40, 60, 80, 100, 120, 140]}
      />
    </div>
  );
};

export default WebTrafficSection;
