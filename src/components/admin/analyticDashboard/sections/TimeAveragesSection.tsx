import AverageTimeCard from "../AverageTimeCard";
import { Building } from "lucide-react";

const TimeAveragesSection = () => {
  return (
    <div className="flex flex-col bg-white rounded-lg shadow-md sm:p-8 w-full mt-10">
      <div className="flex md:flex-row flex-col w-full justify-between">
        <h2 className="mt-6 sm:mt-0 ml-3 sm:ml-0 text-lg font-semibold text-gray-700">
          Check-in and Check-out Times Averages
        </h2>
      </div>

      {/* Check-in & Check-out Card Section */}
      <div className="grid grid-cols-2 gap-4 mt-5">
        <AverageTimeCard
          icon={Building}
          title="Check-in"
          subtitle="Check-in time from 2.00 PM onwards"
          time="4:03 PM"
        />

        <AverageTimeCard
          icon={Building}
          title="Check-out"
          subtitle="Check-out time by 12.00 PM"
          time="10:32 PM"
        />
      </div>
    </div>
  );
};

export default TimeAveragesSection;
