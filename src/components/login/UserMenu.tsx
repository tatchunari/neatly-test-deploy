// src/components/UserMenu.tsx
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("/images/avatar.png");
  const ref = useRef<HTMLDivElement>(null);

  // ปิดดรอปดาวน์เมื่อคลิกนอกเมนู
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  // โหลดข้อมูลผู้ใช้ + อัปเดตเมื่อ session เปลี่ยน
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setDisplayName(""); return; }

      let nameFromTable: string | null = null;
      if (user.email) {
        const { data } = await supabase
          .from("users") // หรือ "profiles"
          .select("username, avatar_url")
          .eq("email", user.email)
          .maybeSingle();

        if (data) {
          if (data.username) nameFromTable = data.username as string;
          if (data.avatar_url) setAvatarUrl(data.avatar_url as string);
        }
      }

      setDisplayName(nameFromTable ?? (user.email as string));

      if (user.user_metadata?.avatar_url && !nameFromTable) {
        setAvatarUrl(user.user_metadata.avatar_url as string);
      }
    };

    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => sub.subscription.unsubscribe();
  }, []);

  // เคลียร์ token ของ Supabase ใน localStorage (ซิงก์)
  const clearSupabaseTokens = () => {
    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("sb-")) keys.push(k); // รวมทุกโปรเจ็กต์ของ supabase
      }
      keys.forEach((k) => localStorage.removeItem(k));
    } catch (e) {
      console.error("clearSupabaseTokens error:", e);
    }
  };

  const logoutHref = "/customer/login?logged_out=1";

  // <a> logout: ให้ default navigation ทำงานเสมอ (ไม่ preventDefault)
  const onLogoutClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    // ปิดเมนูทันที
    setOpen(false);

    // เคลียร์ token ฝั่ง client แบบซิงก์ 
    clearSupabaseTokens();

    // พยายามแจ้ง supabase ด้วย (ไม่ต้อง await — ปล่อยให้เบราเซอร์นำทางตาม href ไปเลย)
    try {
      // ถ้าเวอร์ชันคุณไม่รองรับ scope ก็ใช้ supabase.auth.signOut() เฉยๆ ได้
      // @ts-ignore
      supabase.auth.signOut({ scope: "local" });
    } catch (err) {
      console.error("signOut fire-and-forget error:", err);
    }

  };

  // ยังไม่ล็อกอิน → โชว์ลิงก์ Log in
  if (!displayName) {
    return (
      <a
        href="/customer/login"
        className="text-orange-500 text-[14px] font-semibold leading-[16px] font-inter hover:underline"
      >
        Log in
      </a>
    );
  }

  // ล็อกอินแล้ว → แสดงเมนู
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center gap-2 text-orange-500 text-[14px] font-semibold leading-[16px] font-inter hover:underline"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <img src={avatarUrl} className="w-6 h-6 rounded-full" alt="User avatar" />
        <span className="hidden md:inline">{displayName}</span>
        <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.146l3.71-3.916a.75.75 0 111.08 1.04l-4.24 4.48a.75.75 0 01-1.08 0l-4.24-4.48a.75.75 0 01.02-1.06z"/>
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-44 rounded-lg border bg-white shadow-md z-50"
          onClick={(e) => e.stopPropagation()} // กันเมนูปิดเอง
        >
          <a href="/account" className="block px-4 py-2 hover:bg-gray-50" role="menuitem">
            Account
          </a>
          <a href="/settings" className="block px-4 py-2 hover:bg-gray-50" role="menuitem">
            Settings
          </a>

          {/* Logout: มีทั้ง href (นำทางแน่ๆ) + onClick (ลบ token + signOut) */}
          <a
            href={logoutHref}
            onClick={onLogoutClick}
            role="menuitem"
            className="block px-4 py-2 hover:bg-gray-50 text-red-600"
          >
            Logout
          </a>
        </div>
      )}
    </div>
  );
}
