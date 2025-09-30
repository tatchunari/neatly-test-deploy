import Image from "next/image";

const Footer = () => {
  return (
    <footer
      className="w-full bg-[#384B3F] text-white"
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
        <div className="md:w-1/2 w-full flex flex-col items-center">
          {/* CONTACT Header */}
          <div className="mb-6 font-semibold text-base tracking-wide text-white w-full text-left md:text-left">
            CONTACT
          </div>
          <div className="space-y-6 w-full">
            <div className="flex items-center gap-3 text-base text-[#ffffff]">
              <span className="inline-block text-[#ffffff]">
                <Image
                  src="/icons/phone.png"
                  alt="Phone"
                  width={24}
                  height={24}
                  style={{ minWidth: 24, minHeight: 24 }}
                />
              </span>
              <span className="font-normal text-[#ffffff]">+66 99 999 9999</span>
            </div>
            <div className="flex items-center gap-3 text-base text-[#ffffff]">
              <span className="inline-block text-[#ffffff]">
                <Image
                  src="/icons/email.png"
                  alt="Mail"
                  width={24}
                  height={24}
                  style={{ minWidth: 24, minHeight: 24 }}
                />
              </span>
              <span className="font-normal text-[#ffffff]">contact@neatlyhotel.com</span>
            </div>
            <div className="flex items-start gap-3 text-base text-[#ffffff]">
              <span className="inline-block pt-0.5 text-[#ffffff]">
                <Image
                  src="/icons/location.png"
                  alt="Location"
                  width={24}
                  height={24}
                  style={{ minWidth: 24, minHeight: 24 }}
                />
              </span>
              <span className="font-normal text-[#ffffff] leading-snug">
                188 Phaya Thai Rd, Thung Phaya Thai,<br />
                Ratchathewi, Bangkok 10400
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Divider */}
      <div className="border-t border-[#465C50] w-full max-w-[1440px] mx-auto my-6" />
      {/* Social & Copyright */}
      <div className="flex flex-col md:flex-row justify-between items-center max-w-[1440px] mx-auto px-6 md:px-12 pb-6">
        <div className="flex items-center space-x-4 mb-4 md:mb-0">
          {/* Social icons */}
          <a href="https://www.facebook.com/" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
            <Image
              src="/icons/facebook.png"
              alt="Facebook"
              width={18}
              height={18}
              style={{ minWidth: 18, minHeight: 18 }}
            />
          </a>
          <a href="https://www.instagram.com/" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
            <Image
              src="/icons/instagram.png"
              alt="Instagram"
              width={18}
              height={18}
              style={{ minWidth: 18, minHeight: 18 }}
            />
          </a>
          <a href="https://x.com/" aria-label="Twitter" target="_blank" rel="noopener noreferrer">
            <Image
              src="/icons/twitter.png"
              alt="Twitter"
              width={18}
              height={18}
              style={{ minWidth: 18, minHeight: 18 }}
            />
          </a>
        </div>
        <div className="text-xm text-gray-400">
          Copyright © 2022 Neatly Hotel
        </div>
      </div>
    </footer>
  );
};

export default Footer;
