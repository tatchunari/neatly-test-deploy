import AnalyticCardSection from "@/components/admin/analyticDashboard/AnalyticCardSection";
import Layout from "@/components/admin/Layout";

function AnalyticDashboard() {
  return (
    <Layout>
      <div className="flex-1">
        {/* Header */}
        <div className="flex flex-row justify-between border-b border-gray-400 pb-5 mt-10 mx-10">
          <p className="text-xl font-semibold">Analytic Dashboard</p>
        </div>

        <div className="max-w-7xl mt-10 mx-auto p-6 bg-gray-50 min-h-screen min-w-3">
          {/* Analytic Statistics */}
          <div className="flex flex-col">
            <AnalyticCardSection />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default AnalyticDashboard;
