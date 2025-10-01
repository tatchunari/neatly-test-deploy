import Layout from "@/components/admin/Layout"


export default function index() {
  return (
    <Layout>
     
        <div className="bg-white rounded-lg shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Hotel Information
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
        </div>
     
    </Layout>
  );
}
