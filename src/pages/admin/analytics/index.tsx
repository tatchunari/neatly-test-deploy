import AnalyticCardSection from "@/components/admin/analyticDashboard/AnalyticCardSection";
import BookingTrendsChart from "@/components/admin/analyticDashboard/BookingTrendsChart";
import OccupancyAndGuestSection from "@/components/admin/analyticDashboard/OccupancyAndGuestSection";
import RevenueTrendSection from "@/components/admin/analyticDashboard/RevenueTrendSection";
import RoomAvailabilityChart from "@/components/admin/analyticDashboard/RoomAvailabilityChart.tsx";
import Layout from "@/components/admin/Layout";

function AnalyticDashboard() {
  return (
    <Layout>
      <div className="flex-1 bg-gray-50">
        {/* Header */}
        <div className="flex flex-row justify-between pb-5 mt-20 md:mt-10 mx-10 sticky">
          <p className="text-2xl md:text-xl font-semibold">
            Analytic Dashboard
          </p>
        </div>

        <div className=" flex flex-col max-w-7xl mx-auto p-6 bg-gray-50 border-t border-gray-400 min-w-3">
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
        </div>
      </div>
    </Layout>
  );
}

export default AnalyticDashboard;
