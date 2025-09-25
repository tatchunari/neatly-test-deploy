"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";

// ใช้ supabase โดยตรง ไม่พึ่ง useAuth context
import { supabase } from "@/lib/supabaseClient";

/**
 * Responsive Navbar
 * - Desktop: 1440x100, shows logo, nav items, and login button/user menu
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

// เปลี่ยน path ของ navItems ให้ไปที่ section id สำหรับ scroll
// ปรับ path ให้ตรงกับ id ของแต่ละ section ที่ต้องการ scroll ไป
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

// UserMenu component (inline) ใช้ supabase โดยตรง
function UserMenu() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      try {
        setLoading(true);
        const { data } = await supabase.auth.getUser();
        if (isMounted) setUser(data?.user ?? null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) setUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    await supabase.auth.signOut();
    window.location.replace("/customer/login?logged_out=1");
  };

  if (loading) {
    // กำลังโหลด session → กันจอว่าง
    return <span className="text-gray-400 text-sm">Loading...</span>;
  }

  if (!user) {
    // ยังไม่ล็อกอิน → แสดงปุ่ม Log in
    return (
      <a
        href="/customer/login"
        className="text-[#F47A1F] text-sm font-semibold hover:underline"
      >
        Log in
      </a>
    );
  }

  // ล็อกอินแล้ว → แสดงเมนูผู้ใช้
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 text-[#F47A1F] text-sm font-semibold hover:underline"
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
            onClick={async () => {
              setOpen(false);
              await supabase.auth.signOut();
              window.location.replace("http://localhost:3000/");
            }}
            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

// Mobile user menu for hamburger (when logged in)
function MobileUserMenu({ user, onLogout }: { user: any; onLogout: () => void }) {
  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center gap-3 px-2 pt-4 pb-2">
        <img
          src="/images/avatar.png"
          alt="User avatar"
          className="w-10 h-10 rounded-full object-cover"
        />
        <span className="font-medium text-[#222] text-sm">{user?.user_metadata?.full_name || user?.email}</span>
      </div>
      <hr className="my-2 border-t border-gray-200" />
      <nav className="flex flex-col gap-2">
        <a
          href="/account"
          className="flex items-center gap-2 px-2 py-2 text-[#222] text-sm hover:text-[#F47A1F] transition-colors"
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 19.5a7.5 7.5 0 1115 0v.75a.75.75 0 01-.75.75h-13.5a.75.75 0 01-.75-.75V19.5z" />
          </svg>
          Profile
        </a>
        <a
          href="/payment"
          className="flex items-center gap-2 px-2 py-2 text-[#222] text-sm hover:text-[#F47A1F] transition-colors"
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <rect x="2.25" y="6.75" width="19.5" height="10.5" rx="2.25" stroke="currentColor" strokeWidth={1.5} />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 9.75h19.5" />
          </svg>
          Payment Method
        </a>
        <a
          href="/booking-history"
          className="flex items-center gap-2 px-2 py-2 text-[#222] text-sm hover:text-[#F47A1F] transition-colors"
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth={1.5} />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 3v4M8 3v4M3 9h18" />
          </svg>
          Booking History
        </a>
      </nav>
      <hr className="my-2 border-t border-gray-200" />
      <button
        onClick={() => {
          onLogout();
          window.location.href = "http://localhost:3000/";
        }}
        className="flex items-center gap-2 px-2 py-2 text-[#222] text-sm hover:text-[#F47A1F] transition-colors text-left"
      >
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-3A2.25 2.25 0 008.25 5.25V9m7.5 6v3.75A2.25 2.25 0 0113.5 21h-3A2.25 2.25 0 018.25 18.75V15m-3-3h13.5" />
        </svg>
        Log out
      </button>
    </div>
  );
}

// ฟังก์ชัน scroll ไปยัง section ตาม id
function scrollToSection(id: string) {
  if (typeof window === "undefined") return;
  const sectionId = id.replace(/^#/, "");
  const el = document.getElementById(sectionId);
  if (el) {
    // ปรับ offset ให้เลื่อนหลัง navbar (100px สำหรับ desktop, 80px สำหรับ mobile เพื่อให้เห็นข้อมูลครบ)
    const yOffset = window.innerWidth >= 768 ? -100 : -80;
    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: "smooth" });
  }
}

const Navbar = ({
  navItems = defaultNavItems,
  loginLabel = "Log in",
  logo = defaultLogo,
}: NavbarProps) => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch user for mobile menu
  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      try {
        setLoading(true);
        const { data } = await supabase.auth.getUser();
        if (isMounted) setUser(data?.user ?? null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) setUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Desktop: scroll ไปยัง section ตาม id
  const renderNavItems = (onClick?: () => void) =>
    navItems.map((item) => (
      <button
        key={item.label}
        className="text-[#4B5755] text-sm font-medium px-0 py-2 text-left hover:text-[#F47A1F] transition-colors whitespace-nowrap"
        style={{ width: "100%" }}
        onClick={() => {
          scrollToSection(item.path);
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

  // Mobile menu 
  const MobileMenu = (
    <div
      className={`fixed top-0 left-0 h-full w-full z-50 bg-white transition-transform duration-300 md:hidden ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
      style={{ minWidth: 0 }}
    >
      <div className="flex items-center px-4 py-3 border-b" style={{ height: 48 }}>
        {/* Logo clickable for mobile menu */}
        <div
          className="flex-shrink-0 cursor-pointer"
          onClick={() => {
            setOpen(false);
            window.location.href = "http://localhost:3000/";
          }}
        >
          {logo}
        </div>
        <div className="ml-auto">{Hamburger}</div>
      </div>
      <nav className="flex flex-col px-4 pt-6">
        {/* If not logged in, show nav items and login button */}
        {!user ? (
          <>
            {navItems.map((item, idx) => (
              <button
                key={item.label}
                className="text-[#222] text-sm font-normal py-2 text-left hover:text-[#F47A1F] transition-colors whitespace-nowrap"
                style={{ width: "100%" }}
                onClick={() => {
                  scrollToSection(item.path);
                  setOpen(false);
                }}
              >
                {item.label}
              </button>
            ))}
            <hr className="my-6 border-t border-gray-200" />
            <a
              href="/customer/login"
              className="block text-[#F47A1F] text-sm font-semibold hover:underline py-2"
              onClick={() => setOpen(false)}
            >
              Log in
            </a>
          </>
        ) : (
          // If logged in, show user menu as in the image
          <MobileUserMenu
            user={user}
            onLogout={async () => {
              setOpen(false);
              await supabase.auth.signOut();
              window.location.replace("/customer/login?logged_out=1");
            }}
          />
        )}
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
          {/* Logo clickable */}
          <div
            className="flex-shrink-0 cursor-pointer"
            onClick={() => {
              window.location.href = "http://localhost:3000/";
            }}
          >
            {logo}
          </div>
          {/* Desktop nav */}
          <nav className="hidden md:flex items-center space-x-2">
            {renderNavItems()}
          </nav>
          {/* Desktop login button or user menu */}
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