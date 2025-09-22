import { useState } from "react";
import Image from "next/image";
import UserMenu from "./UserMenu";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const logo = (
    <a href="/customer/login" className="block w-[167px] h-[45px]">
      <Image
        src="/images/logo.png"
        alt="Logo"
        width={167}
        height={45}
        className="w-[167px] h-[45px] object-contain"
        priority
      />
    </a>
  );

  const renderNavItems = (onItemClick?: () => void) => (
    <>
      <a
        href="/about"
        onClick={onItemClick}
        className="text-black text-[14px] font-inter leading-[16px]"
      >
        About Neatly
      </a>
      <a
        href="/services"
        onClick={onItemClick}
        className="text-black text-[14px] font-inter leading-[16px]"
      >
        Service & Facilities
      </a>
      <a
        href="/rooms"
        onClick={onItemClick}
        className="text-black text-[14px] font-inter leading-[16px]"
      >
        Rooms & Suits
      </a>
    </>
  );

  return (
    <nav className="bg-white border-b border-gray-300 flex justify-center items-center h-12 md:h-[100px] ">
      {/* === TOP BAR === */}

      <div className=" max-w-[1440px] mx-auto flex justify-between items-center w-full px-[160px] ">
        {/* ซ้าย: โลโก้ + เมนูเดสก์ท็อป */}
        <div className="flex justify-between gap-[48px] w-auto h-full md:w-[659px] md:h-[100px]">
          <div className="flex items-center justify-center">
            <div className="flex items-center w-[167px] h-[45px] shrink-0">
              {logo}
            </div>
          </div>

          {/* เมนูเดสก์ท็อป (ซ่อนบนมือถือ) */}
          <div className="hidden md:flex w-[444px] items-center gap-6">
            {renderNavItems()}
          </div>
        </div>

        {/* ขวา: UserMenu เดสก์ท็อป */}
        <div className="hidden md:flex items-center justify-end px-[24px] py-[20px]">
          <UserMenu />
        </div>

        {/* ปุ่ม Hamburger (มือถือเท่านั้น) */}
        <button
          type="button"
          className="md:hidden inline-flex flex-col items-center justify-center w-9 h-9 rounded hover:bg-gray-100"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
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
      </div>

      {/* Overlay คลิกปิดได้ */}
      <div
        className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 md:hidden ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Drawer เมนูมือถือ */}
      <div
        className={`fixed top-0 left-0 h-full w-[260px] z-50 bg-white shadow-lg transition-transform duration-300 md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center px-6 py-4 border-b">{logo}</div>
        <nav className="flex flex-col px-6 py-4 space-y-3">
          {renderNavItems(() => setOpen(false))}
          <div className="pt-2 border-t">
            <UserMenu />
          </div>
        </nav>
      </div>
    </nav>
  );
}
