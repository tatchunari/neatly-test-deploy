"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

/**
 * Responsive Navbar
 * - Desktop: 1440x100, shows logo, nav items, and login button
 * - Mobile: 375x48, shows logo and hamburger, menu slides out on click
 * - Hamburger: 3 bars, only on mobile
 * - Login button: orange (#F47A1F)
 * - Uses TailwindCSS
 * - navItems, loginLabel, logo, etc. are props for flexible rendering
 */

type NavItem = {
  label: string;
  path: string;
};

type NavbarProps = {
  navItems?: NavItem[];
  loginLabel?: string;
  logo?: React.ReactNode;
};

const defaultNavItems: NavItem[] = [
  { label: "About Neatly", path: "#about" },
  { label: "Service & Facilities", path: "#services" },
  { label: "Rooms & Suits", path: "#rooms" },
];

// ใช้รูป logo.png จาก public/image/logo.png
const defaultLogo = (
  <div className="flex items-center space-x-2">
    <Image
      src="/logo.png"
      alt="Neatly Logo"
      width={100}
      height={100}
      className="object-contain"
      priority
    />
  </div>
);

const Navbar = ({
  navItems = defaultNavItems,
  loginLabel = "Log in",
  logo = defaultLogo,
}: NavbarProps) => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fetch user session from Supabase
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let ignore = false;
    const getSession = async () => {
      if (!supabase) return;
      setLoading(true);
      const { data, error } = await supabase.auth.getUser();
      if (!ignore) {
        setUser(data?.user || null);
        setLoading(false);
      }
    };
    getSession();

    // Listen for auth state changes
    const { data: listener } = supabase?.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    // Close dropdown on outside click
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      ignore = true;
      document.removeEventListener("mousedown", handleClickOutside);
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Scroll to section function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Render nav items
  const renderNavItems = (onClick?: () => void) =>
    navItems.map((item) => (
      <button
        key={item.label}
        className="text-[#4B5755] text-sm font-medium px-3 py-2 hover:text-[#F47A1F] transition-colors"
        onClick={() => {
          if (item.path.startsWith("#")) {
            const sectionId = item.path.substring(1);
            scrollToSection(sectionId);
          } else {
            window.location.href = item.path;
          }
          if (onClick) onClick();
        }}
      >
        {item.label}
      </button>
    ));

  // Hamburger icon (toggle open/close)
  const Hamburger = (
    <button
      className="flex flex-col justify-center items-center w-8 h-8 md:hidden"
      aria-label="Toggle menu"
      onClick={() => setOpen((prev) => !prev)}
    >
      <span
        className={`block w-6 h-0.5 bg-[#4B5755] mb-1 rounded transition-all duration-300 ${
          open ? "rotate-45 translate-y-2" : ""
        }`}
      ></span>
      <span
        className={`block w-6 h-0.5 bg-[#4B5755] mb-1 rounded transition-all duration-300 ${
          open ? "opacity-0" : ""
        }`}
      ></span>
      <span
        className={`block w-6 h-0.5 bg-[#4B5755] rounded transition-all duration-300 ${
          open ? "-rotate-45 -translate-y-2" : ""
        }`}
      ></span>
    </button>
  );

  // Logout handler
  const handleLogout = async () => {
    setOpen(false);
    if (supabase) {
      await supabase.auth.signOut();
    }
    window.location.replace("/customer/login?logged_out=1");
  };

  // User menu for logged-in user and not-logged-in user
  const UserMenu = () => {
    if (loading) {
      // กำลังโหลด session → กันจอว่าง
      return <span className="text-gray-400 text-sm">Loading...</span>;
    }

    if (!user) {
      // ยังไม่ล็อกอิน → แสดงปุ่ม Log in
      return (
        <a
          href="/customer/login"
          className="text-orange-500 text-sm font-semibold hover:underline"
        >
          Log in
        </a>
      );
    }

    // ล็อกอินแล้ว → แสดงเมนูผู้ใช้
    return (
      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 text-orange-500 text-sm font-semibold hover:underline"
        >
          <img src="/images/avatar.png" className="w-6 h-6 rounded-full" alt="User avatar" />
          <span className="hidden md:inline">{user.email}</span>
          <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.146l3.71-3.916a.75.75 0 111.08 1.04l-4.24 4.48a.75.75 0 01-1.08 0l-4.24-4.48a.75.75 0 01.02-1.06z"/>
          </svg>
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-44 rounded-lg border bg-white shadow-md z-50">
            <a href="/account" className="block px-4 py-2 hover:bg-gray-50">Account</a>
            <a href="/settings" className="block px-4 py-2 hover:bg-gray-50">Settings</a>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    );
  };

  // Mobile menu (no close button, close by clicking hamburger again)
  const MobileMenu = (
    <div
      className={`fixed top-0 left-0 h-full w-[260px] z-50 bg-white shadow-lg transition-transform duration-300 md:hidden ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center px-6 py-4 border-b">
        {logo}
      </div>
      <nav className="flex flex-col px-6 py-4 space-y-2">
        {renderNavItems(() => setOpen(false))}
        <div className="mt-4">
          <UserMenu />
        </div>
      </nav>
    </div>
  );

  return (
    <>
      {/* Navbar container */}
      <header className="fixed top-0 left-0 w-full z-40 bg-white shadow-sm">
        <div
          className="mx-auto flex items-center justify-between px-4 md:px-12"
          style={{
            maxWidth: 1440,
            height: 100,
          }}
        >
          {/* Logo */}
          <div className="flex-shrink-0">{logo}</div>
          {/* Desktop nav */}
          <nav className="hidden md:flex items-center space-x-2">
            {renderNavItems()}
          </nav>
          {/* Desktop login/user button */}
          <div className="hidden md:inline-block">
            <UserMenu />
          </div>
          {/* Hamburger for mobile */}
          <div className="md:hidden">{Hamburger}</div>
        </div>
        {/* Mobile menu */}
        {MobileMenu}
      </header>
      {/* Spacer for fixed navbar */}
      <div className="block md:hidden" style={{ height: 48 }} />
      <div className="hidden md:block" style={{ height: 100 }} />
    </>
  );
};

export default Navbar;
