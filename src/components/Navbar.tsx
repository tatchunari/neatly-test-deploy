"use client"; // บอก Next.js ว่าคอมโพเนนต์นี้รันฝั่ง client

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

// ใช้ supabase โดยตรง ไม่พึ่ง useAuth context
import { supabase } from "@/lib/supabaseClient";

// /**
//  * Responsive Navbar
//  * - Desktop: 1440x100, shows logo, nav items, and login button/user menu
//  * - Mobile: 375x48, shows logo and hamburger, menu slides out on click
//  * - Hamburger: 3 bars, only on mobile
//  * - Login button: orange (#F47A1F)
//  * - Uses TailwindCSS
//  * - navItems, loginLabel, logo, etc. are props for flexible rendering
//  */

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

// โหลด displayName + avatar จาก profiles.username (คีย์คือ id = auth.users.id)
// ถ้าไม่มี/อ่านไม่ได้ ให้ fallback เป็น email
async function fetchProfileInfo(user: { id: string; email: string | null }) {
  const fallbackName = user.email ?? ""; // ถ้าไม่มี username ใช้อีเมลแทน
  const fallbackAvatar = "/images/avatar.png"; // รูป default

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("username, profile_image")
      .eq("id", user.id)
      .maybeSingle();

    if (error) return { displayName: fallbackName, avatarUrl: fallbackAvatar };

    const username = (data?.username ?? "").toString().trim();
    const profileImage = (data?.profile_image ?? "").toString().trim();

    return {
      displayName: username || fallbackName, // ถ้าusernameมีค่า จะใช้usernameแสดง
      avatarUrl: profileImage || fallbackAvatar, // แต่ถ้ามีรูปจะใช้รูปแสดง
    };
  } catch {
    return { displayName: fallbackName, avatarUrl: fallbackAvatar };
  }
}

// UserMenu component (inline) ใช้ supabase โดยตรง
function UserMenu() {
  const [user, setUser] = useState<null | { id: string; email: string | null }>(
    null
  );
  const [displayName, setDisplayName] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("/images/avatar.png");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // โหลดสถานะผู้ใช้
  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      const u = data?.user
        ? { id: data.user.id, email: (data.user.email as string) ?? null }
        : null;
      setUser(u);
      setLoading(false);
    })();

    // Subscribe การเปลี่ยนแปลงสถานะ auth (เช่น login/logout)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user
        ? { id: session.user.id, email: (session.user.email as string) ?? null }
        : null;
      setUser(u);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe(); // cleanup subscription
    };
  }, []);

  // ดึงชื่อ กับ รูปprofile
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user) {
        if (!cancelled) {
          setDisplayName("");
          setAvatarUrl("/images/avatar.png");
        }
        return;
      }
      const { displayName, avatarUrl } = await fetchProfileInfo(user);
      if (!cancelled) {
        setDisplayName(displayName);
        setAvatarUrl(avatarUrl);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.email]);

  // ปิด dropdown ถ้าคลิกนอกเมนู
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  // ใช้suppabase เพื่อlogout
  const handleLogout = async () => {
    try {
      setOpen(false);
      await supabase.auth.signOut();
    } finally {
      // redirect ไปหน้า http://localhost:3000/ หลัง logout
      window.location.replace("http://localhost:3000/");
    }
  };

  if (loading) {
    // กำลังโหลด session → กันจอว่าง
    return <span className="text-gray-400 text-sm">Loading...</span>;
  }

  if (!user) {
    // ยังไม่ล็อกอิน → แสดงปุ่ม Log in
    return (
      <Link
        href="/customer/login"
        className="text-[#F47A1F] text-sm font-semibold hover:underline"
      >
        Log in
      </Link>
    );
  }

  // ล็อกอินแล้ว → แสดงเมนูผู้ใช้
  // แก้ให้ขึ้น username แทน email
  // displayName จะเป็น username จาก profiles เสมอ (ถ้าไม่มี username จะ fallback เป็น email)
  const userDisplayName = displayName;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 text-[#F47A1F] w-6-sm font-semibold hover:underline"
      >
        <Image
          width={800}
          height={600}
          src={avatarUrl}
          className="w-7 h-7 rounded-full object-cover"
          alt="User avatar"
        />
        <span className="hidden md:inline">{userDisplayName}</span>
        <svg
          className="w-3 h-3"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden
        >
          <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.146l3.71-3.916a.75.75 0 111.08 1.04l-4.24 4.48a.75.75 0 01-1.08 0l-4.24-4.48a.75.75 0 01.02-1.06z" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-lg border bg-white shadow-md z-50">
          <Link
            href="/customer/profile"
            className="block px-4 py-2 hover:bg-gray-50"
          >
            Account
          </Link>
          <Link
            href="/customer/settings"
            className="block px-4 py-2 hover:bg-gray-50"
          >
            Settings
          </Link>
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
}

// Mobile user menu for hamburger (when logged in)
function MobileUserMenu({
  user,
  onLogout,
}: {
  user: { id: string; email: string | null };
  onLogout: () => void;
}) {
  const [name, setName] = useState<string>("");
  const [avatar, setAvatar] = useState<string>("/images/avatar.png");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user?.id) {
        if (!cancelled) {
          setName("");
          setAvatar("/images/avatar.png");
        }
        return;
      }
      const { displayName, avatarUrl } = await fetchProfileInfo(user);
      if (!cancelled) {
        setName(displayName);
        setAvatar(avatarUrl);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.email]);

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center gap-3 px-2 pt-4 pb-2">
        <Image
          width={800}
          height={600}
          src={avatar}
          alt="User avatar"
          className="w-10 h-10 rounded-full object-cover"
        />
        {/* แก้ให้ขึ้น username แทน email */}
        <span className="font-medium text-[#222] text-sm">{name}</span>
      </div>
      <hr className="my-2 border-t border-gray-200" />
      <nav className="flex flex-col gap-2">
        <Link
          href="/customer/profile"
          className="flex items-center gap-2 px-2 py-2 text-[#222] text-sm hover:text-[#F47A1F]"
        >
          Profile
        </Link>
        <Link
          href="/customer/payment"
          className="flex items-center gap-2 px-2 py-2 text-[#222] text-sm hover:text-[#F47A1F]"
        >
          Payment Method
        </Link>
        <Link
          href="/customer/booking-history"
          className="flex items-center gap-2 px-2 py-2 text-[#222] text-sm hover:text-[#F47A1F]"
        >
          Booking History
        </Link>
      </nav>
      <hr className="my-2 border-t border-gray-200" />
      <button
        onClick={onLogout}
        className="flex items-center gap-2 px-2 py-2 text-[#222] text-sm hover:text-[#F47A1F] text-left"
      >
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
  if (!el) return;
  const yOffset = window.innerWidth >= 768 ? -100 : -80; // กันชนกับ navbar
  const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
  window.scrollTo({ top: y, behavior: "smooth" });
}

const Navbar = ({
  navItems = defaultNavItems,
  loginLabel = "Log in",
  logo = defaultLogo,
}: NavbarProps) => {
  const [open, setOpen] = useState(false); // mobile drawer
  const [user, setUser] = useState<null | { id: string; email: string | null }>(
    null
  );
  const [loading, setLoading] = useState(true);

  // Fetch user for mobile menu
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      const u = data?.user
        ? { id: data.user.id, email: (data.user.email as string) ?? null }
        : null;
      setUser(u);
      setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user
        ? { id: session.user.id, email: (session.user.email as string) ?? null }
        : null;
      setUser(u);
    });

    return () => {
      mounted = false;
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
      />
      <span
        className={`block w-6 h-0.5 bg-[#4B5755] mb-1 rounded transition-all duration-300 ${
          open ? "opacity-0" : ""
        }`}
      />
      <span
        className={`block w-6 h-0.5 bg-[#4B5755] rounded transition-all duration-300 ${
          open ? "-rotate-45 -translate-y-2" : ""
        }`}
      />
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
      <div
        className="flex items-center px-4 py-3 border-b"
        style={{ height: 48 }}
      >
        <div
          className="flex-shrink-0 cursor-pointer"
          onClick={() => {
            setOpen(false);
            window.location.href = "/";
          }}
        >
          {logo}
        </div>
        <div className="ml-auto">{Hamburger}</div>
      </div>
      <nav className="flex flex-col px-4 pt-6">
        {/* ถ้ายังไม่ได้login จะแสดงรายการเมนู และ ปุ่มlogin */}
        {!user ? (
          <>
            {navItems.map((item) => (
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
            <Link
              href="/customer/login"
              className="block text-[#F47A1F] text-sm font-semibold hover:underline py-2"
              onClick={() => setOpen(false)}
            >
              {loginLabel}
            </Link>
          </>
        ) : (
          // แสดงเมนูของuserบนมือถือ เมื่อuser loginอยู่
          <MobileUserMenu
            // ส่งข้อมูลuser เพื่อใช้แสดงusername, email หรือรูปprofile
            user={user}
            // เมื่อuser กดปุ่มlogin ในเมนู
            onLogout={async () => {
              setOpen(false);
              // เรียกคำสั่ง logout ของ supabase เพื่อลบ session และ token
              await supabase.auth.signOut();
              // เปลี่ยนหน้าไปยังหน้า http://localhost:3000/
              window.location.replace("http://localhost:3000/");
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
          style={{ maxWidth: 1440, height: 100 }}
        >
          {/* Logo clickable */}
          <div
            className="flex-shrink-0 cursor-pointer"
            onClick={() => {
              window.location.href = "/";
            }}
          >
            {logo}
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center space-x-2">
            {renderNavItems()}
          </nav>

          {/* Desktop: user menu (ชื่อ+รูปจาก profiles) */}
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
