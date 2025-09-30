import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { supabase } from "../../lib/supabaseClient";
import Layout from "../../components/admin/Layout";
import { User } from "@supabase/supabase-js";

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.replace("/customer/login");
          return;
        }

        // Check if user is admin
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (error || !profile || profile.role !== "admin") {
          await supabase.auth.signOut();
          router.replace("/customer/login");
          return;
        }

        setUser(session.user);
      } catch (error) {
        console.error("Auth check error:", error);
        router.replace("/customer/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.replace("/customer/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard — Neatly</title>
      </Head>

      <Layout>
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Admin Dashboard
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Quick Stats Cards */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Total Bookings
              </h3>
              <p className="text-3xl font-bold text-green-600">0</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Active Rooms
              </h3>
              <p className="text-3xl font-bold text-blue-600">0</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Revenue
              </h3>
              <p className="text-3xl font-bold text-orange-600">$0</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => router.push("/admin/room-management")}
                className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition"
              >
                Manage Rooms
              </button>

              <button
                onClick={() => router.push("/admin/bookings")}
                className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition"
              >
                View Bookings
              </button>

              <button
                onClick={() => router.push("/admin/analytics")}
                className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition"
              >
                Analytics
              </button>

              <button
                onClick={() => router.push("/admin/chatbot")}
                className="bg-orange-600 text-white p-4 rounded-lg hover:bg-orange-700 transition"
              >
                Chatbot
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Recent Activity
            </h2>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-500">No recent activity to display.</p>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
