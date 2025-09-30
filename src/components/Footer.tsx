import Image from "next/image";

const Footer = () => {
  return (
    <footer
      className="w-full bg-[#2F3E35] text-white"
      style={{ maxWidth: "1440px", margin: "0 auto" }}
    >
      <div
        className="
          flex flex-col md:flex-row
          justify-between
          items-start
          max-w-[1440px] mx-auto
          px-6 md:px-12
          pt-12
          pb-8
          gap-10 md:gap-0
        "
      >
        {/* Left: Logo & Description */}
        <div className="flex flex-col items-start md:w-1/2 w-full">
          <div className="flex items-center mb-6">
            <Image
              src="/logo-white.png"
              alt="Neatly Logo"
              width={120}
              height={32}
              className="object-contain"
              priority
            />
          </div>
          <div className="mb-2 font-semibold text-base">Neatly Hotel</div>
          <div className="text-xs text-gray-200">
            The best hotel for living your experience
          </div>
        </div>

        {/* Right: Contact Info */}
        <div className="md:w-1/2 flex flex-col items-start md:items-end w-full">
          <div className="mb-6 font-semibold text-base tracking-wide">CONTACT</div>
          <ul className="text-xs text-gray-200 space-y-4 mb-0 md:mb-0">
            <li className="flex items-center gap-3">
              <span className="inline-block">
                <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
                  <path d="M3.5 2.5A1.5 1.5 0 0 1 5 1h2A1.5 1.5 0 0 1 8.5 2.5V3A1.5 1.5 0 0 1 7 4.5H5A1.5 1.5 0 0 1 3.5 3V2.5ZM3.5 2.5V3A1.5 1.5 0 0 0 5 4.5h2A1.5 1.5 0 0 0 8.5 3V2.5M3.5 2.5h11A1.5 1.5 0 0 1 16 4v10a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 2 14V4A1.5 1.5 0 0 1 3.5 2.5Z" stroke="#D6E1DB" strokeWidth="1.2"/>
                </svg>
              </span>
              <span>+66 99 999 9999</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="inline-block">
                <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
                  <path d="M2.25 4.5A2.25 2.25 0 0 1 4.5 2.25h9A2.25 2.25 0 0 1 15.75 4.5v9A2.25 2.25 0 0 1 13.5 15.75h-9A2.25 2.25 0 0 1 2.25 13.5v-9Z" stroke="#D6E1DB" strokeWidth="1.2"/>
                  <path d="M3.75 5.25 9 9.75l5.25-4.5" stroke="#D6E1DB" strokeWidth="1.2"/>
                </svg>
              </span>
              <span>contact@neatlyhotel.com</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="inline-block pt-1">
                <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
                  <path d="M9 16.5s6-4.5 6-9A6 6 0 1 0 3 7.5c0 4.5 6 9 6 9Z" stroke="#D6E1DB" strokeWidth="1.2"/>
                  <circle cx="9" cy="7.5" r="2" stroke="#D6E1DB" strokeWidth="1.2"/>
                </svg>
              </span>
              <span>
                188 Phaya Thai Rd, Thung Phaya Thai,<br />
                Ratchathewi, Bangkok 10400
              </span>
            </li>
          </ul>
        </div>
      </div>
      {/* Divider */}
      <div className="border-t border-[#465C50] w-full max-w-[1440px] mx-auto my-6" />
      {/* Social & Copyright */}
      <div className="flex flex-col md:flex-row justify-between items-center max-w-[1440px] mx-auto px-6 md:px-12 pb-6">
        <div className="flex items-center space-x-4 mb-4 md:mb-0">
          {/* Social icons */}
          <a href="#" aria-label="Facebook">
            <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
              <circle cx="9" cy="9" r="9" fill="#F7F7FA" />
              <path d="M10.5 9.75h1.125l.187-1.5H10.5V7.5c0-.435.09-.75.75-.75h.563V5.438A7.5 7.5 0 0 0 10.688 5.25c-1.125 0-1.688.675-1.688 1.688V8.25H7.875v1.5h1.125V13.5h1.5V9.75Z" fill="#2F3E35"/>
            </svg>
          </a>
          <a href="#" aria-label="YouTube">
            <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
              <circle cx="9" cy="9" r="9" fill="#F7F7FA" />
              <path d="M12.75 7.5c0-.825-.675-1.5-1.5-1.5h-3c-.825 0-1.5.675-1.5 1.5v3c0 .825.675 1.5 1.5 1.5h3c.825 0 1.5-.675 1.5-1.5v-3Zm-4.125 2.25V8.25l2.25 0-2.25 1.5Z" fill="#2F3E35"/>
            </svg>
          </a>
          <a href="#" aria-label="Twitter">
            <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
              <circle cx="9" cy="9" r="9" fill="#F7F7FA" />
              <path d="M13.5 7.125c-.3.15-.6.225-.9.3.3-.15.525-.45.6-.825-.3.15-.675.3-1.05.375-.3-.3-.75-.45-1.125-.45-.825 0-1.5.675-1.5 1.5 0 .15 0 .3.075.45-1.2-.075-2.25-.6-2.925-1.425-.15.225-.225.45-.225.75 0 .525.3.975.75 1.2-.225 0-.45-.075-.6-.15v.075c0 .75.525 1.35 1.2 1.5-.15.075-.3.075-.45.075-.075 0-.15 0-.225-.075.15.525.675.9 1.275.9-.525.375-1.125.6-1.8.6-.15 0-.3 0-.45-.075.6.375 1.35.6 2.1.6 2.55 0 3.975-2.1 3.975-3.975v-.15c.3-.225.6-.525.825-.825Z" fill="#2F3E35"/>
            </svg>
          </a>
        </div>
        <div className="text-xs text-gray-400">
          Copyright © 2022 Neatly Hotel
        </div>
      </div>
    </footer>
  );
};

export default Footer;
