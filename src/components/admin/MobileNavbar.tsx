import React, { useState } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { Tickets } from "lucide-react";

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

const MobileNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <>
      <div className="flex h-15 justify-between bg-green-800 z-50 shadow-[0px_4px_25px_0px_#0000000D] w-full fixed top-0">
        <div className="flex flex-row justify-center items-center px-4 gap-2">
          <Image
            src="/assets/logo-white.png"
            alt="logo"
            className="w-30 h-7"
            width={800}
            height={600}
          />
          <p className="text-white font-inter font-light text-sm mt-2">
            Admin Panel Control
          </p>
        </div>
        <button
          onClick={toggleMenu}
          className="mt-1 mr-5 focus:outline-none"
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <X className="text-white w-6 h-6" />
          ) : (
            <Menu className="text-white w-6 h-6" />
          )}
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-none z-40" onClick={closeMenu}></div>

          {/* Menu */}
          <div className="fixed top-15 left-0 right-0 bg-white shadow-lg z-50 max-h-[calc(100vh-60px)] overflow-y-auto">
            <nav className="py-2">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  onClick={closeMenu}
                  className="flex items-center gap-3 px-6 py-4 hover:bg-gray-100 transition-colors"
                >
                  {item.icon !== "Tickets" ? (
                    <Image
                      src={item.icon}
                      alt={item.label}
                      width={24}
                      height={24}
                      className="w-6 h-6"
                    />
                  ) : (
                    <span className="text-green-500 font-semibold">
                      <Tickets />
                    </span>
                  )}
                  <span className="text-gray-800 font-inter text-base">
                    {item.label}
                  </span>
                </Link>
              ))}
            </nav>
          </div>
        </>
      )}
    </>
  );
};

export default MobileNavbar;
