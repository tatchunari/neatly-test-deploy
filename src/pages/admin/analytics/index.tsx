import AnalyticCardSection from "@/components/admin/analyticDashboard/sections/AnalyticCardSection";
import BookingTrendsChart from "@/components/admin/analyticDashboard/BookingTrendsChart";
import OccupancyAndGuestSection from "@/components/admin/analyticDashboard/sections/OccupancyAndGuestSection";
import RevenueTrendSection from "@/components/admin/analyticDashboard/sections/RevenueTrendSection";
import RoomAvailabilityChart from "@/components/admin/analyticDashboard/RoomAvailabilityChart.tsx";
import Layout from "@/components/admin/Layout";
import TimeAveragesSection from "@/components/admin/analyticDashboard/sections/TimeAveragesSection";

function AnalyticDashboard() {
  return (
    <Layout>
      <div className="flex-1 bg-gray-50">
        {/* Header */}
        <div className="bg-white w-full md:z-100 z-40 border-b border-gray-400">
          <p className="text-2xl md:text-xl font-semibold pb-5 mt-20 md:mt-10 mx-10">
            Analytic Dashboard
          </p>
        </div>

        <div className=" flex flex-col max-w-7xl mx-auto p-6 bg-gray-50 min-w-3">
          {/* Analytic Statistics */}
          <div className="flex flex-col">
            <AnalyticCardSection />
          </div>

          {/* Availability Chart & Booking Trends  */}
          <div className="flex flex-col md:flex-row md:gap-5">
            <RoomAvailabilityChart />
            <BookingTrendsChart />
          </div>

          {/* Revenue Trend */}
          <div className="flex">
            <RevenueTrendSection />
          </div>

          {/* Occupancy & Guest Section */}
          <div className="flex">
            <OccupancyAndGuestSection />
          </div>

          <div className="flex">
            <TimeAveragesSection />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default AnalyticDashboard;
