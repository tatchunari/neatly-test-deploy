import AnalyticCardSection from "@/components/admin/analyticDashboard/sections/AnalyticCardSection";
import BookingTrendsChart from "@/components/admin/analyticDashboard/BookingTrendsChart";
import OccupancyAndGuestSection from "@/components/admin/analyticDashboard/sections/OccupancyAndGuestSection";
import RevenueTrendSection from "@/components/admin/analyticDashboard/sections/RevenueTrendSection";
import RoomAvailabilityChart from "@/components/admin/analyticDashboard/RoomAvailabilityChart";
import Layout from "@/components/admin/Layout";
import TimeAveragesSection from "@/components/admin/analyticDashboard/sections/TimeAveragesSection";
import WebTrafficSection from "@/components/admin/analyticDashboard/sections/WebTrafficSection";

import { useQuery } from "@/hooks/useQuery";
import { Room } from "@/types/rooms";
export interface Statistics {
  id: string;
  period_start: string;
  period_end: string;
  total_bookings: number;
  total_sales: number;
  total_users: number;
  total_visitors: number;
  created_at: string;
}

export type StatisticsApiResponse = {
  success: boolean;
  message: string;
  data?: Statistics[] | null;
  error?: string;
};

export interface Bookings {
  id: string;
  user_id: string;
  room_id: string;
  status: "pending" | "confirmed" | "cancelled" | "refunded";
  check_in_date: string;
  check_out_date: string;
  total_amount: number;
  special_requests?: string[];
  additional_request?: string[];
  standard_request?: string[];
  created_at: string;
}

// API response from backend
export type BookingsApiResponse = {
  success: boolean;
  message: string;
  data?: Bookings[] | null;
  error?: string;
};

export type RoomsApiResponse = {
  success: boolean;
  message: string;
  data?: Room[] | null;
  error?: string;
};

function AnalyticDashboard() {
  const { data: statisticsResponse } =
    useQuery<StatisticsApiResponse>("/api/statistics");

  const { data: bookingsResponse } =
    useQuery<BookingsApiResponse>("/api/bookings");

  const { data: roomsResponse } = useQuery<RoomsApiResponse>("/api/rooms");

  const statisticsData = statisticsResponse?.data;
  const bookingsData = bookingsResponse?.data;
  const roomsData = roomsResponse?.data;
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
            <AnalyticCardSection statsData={statisticsData} />
          </div>

          {/* Availability Chart & Booking Trends  */}
          <div className="flex flex-col md:flex-row md:gap-5">
            <RoomAvailabilityChart roomsData={roomsData} />
            <BookingTrendsChart bookingsData={bookingsData} />
          </div>

          {/* Revenue Trend */}
          <div className="flex">
            <RevenueTrendSection />
          </div>

          {/* Occupancy & Guest Section */}
          <div className="flex">
            <OccupancyAndGuestSection />
          </div>

          {/* Average Check-in & Check-out Time */}
          <div className="flex">
            <TimeAveragesSection />
          </div>

          {/* Web Traffic */}
          <WebTrafficSection />
        </div>
      </div>
    </Layout>
  );
}

export default AnalyticDashboard;
