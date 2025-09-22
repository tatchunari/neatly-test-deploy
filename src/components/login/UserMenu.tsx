import { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";

export default function UserMenu() {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
        className="text-orange-500 text-sm font-semibold hover:underline"
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
        onClick={() => setOpen(v => !v)}
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
}

