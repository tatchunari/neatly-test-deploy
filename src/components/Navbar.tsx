"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";

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
  const router = useRouter();

  // Scroll to section function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Render nav items
  const renderNavItems = (onClick?: () => void) =>
    navItems.map((item) => (
      <button
        key={item.label}
        className="text-[#4B5755] text-sm font-medium px-3 py-2 hover:text-[#F47A1F] transition-colors"
        onClick={() => {
          if (item.path.startsWith('#')) {
            const sectionId = item.path.substring(1);
            scrollToSection(sectionId);
          } else {
            router.push(item.path);
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
        <button
          className="mt-4 text-white font-semibold rounded px-4 py-2"
          style={{ background: "#F47A1F" }}
          onClick={() => {
            router.push("/login");
            setOpen(false);
          }}
        >
          {loginLabel}
        </button>
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
          {/* Desktop login button */}
          <button
            className="hidden md:inline-block text-[#F47A1F] font-semibold px-4 py-2 rounded transition-colors hover:bg-[#F47A1F]/10"
            onClick={() => router.push("/login")}
          >
            {loginLabel}
          </button>
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
