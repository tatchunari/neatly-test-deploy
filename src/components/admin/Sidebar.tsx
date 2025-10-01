import Link from "next/link";
import { useRouter } from "next/router";
import { Tickets } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

const menuItems = [
  {
    label: "Customer Booking",
    href: "/admin/bookings",
    icon: "/assets/booking-green.png",
  },
  {
    label: "Room Management",
    href: "/admin/room-management",
    icon: "/assets/manage-green.png",
  },
  {
    label: "Hotel Information",
    href: "/admin/hotel-info",
    icon: "/assets/hotel-green.png",
  },
  {
    label: "Room & Property",
    href: "/admin/room-types",
    icon: "/assets/room-green.png",
  },
  {
    label: "Analytics Dashboard",
    href: "/admin/analytics",
    icon: "/assets/analytic-green.png",
  },
  {
    label: "Chatbot Setup",
    href: "/admin/chatbot",
    icon: "/assets/chat-green.png",
  },
  {
    label: "Support Tickets",
    href: "/admin/ticket",
    icon: "Tickets",
  },
];

export default function Sidebar() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <aside className="w-68 min-h-screen h-full bg-green-800 flex flex-col">
      {/* Logo */}
      <div className="flex items-center justify-center mt-10">
        <Image
          className="w-35"
          src="/assets/logo-white.png"
          alt="logo"
          width={800}
          height={600}
        />
      </div>
      <div className="flex justify-center items-center font-inter font-light text-xl mt-6 text-green-300">
        Admin Panel Control
      </div>

      {/* Navigation */}
      <nav className="mt-25 flex-1 w-full">
        {menuItems.map((item) => {
          const isActive =
            router.pathname === item.href ||
            router.pathname.startsWith(item.href + "/");

          return (
            <div key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center w-full px-7 py-5 mb-2 text-md font-medium text-green-300 hover:bg-green-600 ${
                  isActive ? "bg-green-600 text-green-300" : ""
                }`}
              >
                {item.icon === "Tickets" ? (
                  <Tickets className="w-6 h-6 mr-3 text-green-500" />
                ) : (
                  <Image
                    width={800}
                    height={600}
                    className="w-6 h-6 mr-3"
                    src={item.icon}
                    alt={item.label}
                  />
                )}
                <span>{item.label}</span>
              </Link>
            </div>
          );
        })}
      </nav>

      {/* Logout Button at the bottom */}
      <div className="mt-auto mb-30 border-t-1 border-green-100/20">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-7 py-5 text-md font-inter font-medium text-green-300 hover:bg-green-600 hover:text-white cursor-pointer transition-colors"
        >
          <img className="w-6 h-6 mr-4" src="/assets/logout.png" alt="Logout" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
