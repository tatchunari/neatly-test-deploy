import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";

const Aboutsection = () => {
  // Slider logic
  const images = [
    { src: "/image/deluxe.jpg", alt: "Deluxe" },
    { src: "/image/premiersea.jpg", alt: "Premier Sea View" },
    { src: "/image/suite.jpg", alt: "Suite" },
    { src: "/image/superior.jpg", alt: "Superior" },
    { src: "/image/superiorgarden.jpg", alt: "Superior Garden View" },
    { src: "/image/supreme.jpg", alt: "Supreme" },
  ];
  const [current, setCurrent] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Always show 5 images on desktop (per design), 1 on mobile
  const [slidesToShow, setSlidesToShow] = useState(1);
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1024) setSlidesToShow(5);
      else setSlidesToShow(1);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ปิดการเลื่อนอัตโนมัติเพื่อไม่ให้หน้าเลื่อนเองโดยไม่ตั้งใจ
  // หากต้องการเปิดอีกครั้ง ให้เพิ่ม effect ที่ตั้ง interval กลับเข้าไป

  function goLeft() {
    setCurrent((prev) => {
      if (prev === 0) {
        // วนไปภาพขวาสุด
        return images.length - slidesToShow;
      }
      return prev - 1;
    });
  }
  function goRight() {
    setCurrent((prev) => {
      if (prev >= images.length - slidesToShow) {
        // วนกลับไปภาพแรก
        return 0;
      }
      return prev + 1;
    });
  }

  // เลื่อนภายในสไลเดอร์ในแนวนอนเท่านั้น เพื่อป้องกันการเลื่อนทั้งหน้า
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const child = container.children[current] as HTMLElement | undefined;
    if (!child) return;
    const left = child.offsetLeft;
    container.scrollTo({ left, behavior: "smooth" });
  }, [current, slidesToShow]);

  return (
    <section
      id="about"
      className="w-full flex flex-col items-center bg-white"
      style={{
        minWidth: "100vw",
        maxWidth: "100vw",
        minHeight: "auto",
        margin: "0 auto",
        paddingTop: "0",
        paddingBottom: "0",
      }}
    >
      {/* Title & Description */}
      <div
        className="w-full flex flex-col items-center"
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          marginTop: "64px",
          paddingLeft: 0,
          paddingRight: 0,
        }}
      >
        <h2
          className="font-serif text-[#2F3E35] text-[40px] md:text-[48px] leading-[48px] md:leading-[56px] font-Noto mb-6 text-center"
          style={{
            marginTop: 0,
            marginBottom: 0,
            letterSpacing: 0,
          }}
        >
          Neatly Hotel
        </h2>
        <div
          className="text-[#4B5755] text-[16px] md:text-[18px] leading-[26px] md:leading-[30px] font-Noto text-center w-full max-w-[700px] mb-0"
          style={{
            marginTop: 0,
            marginBottom: 0,
          }}
        >
          <p className="mb-2 md:mb-4">
            Set in Bangkok, Thailand, Neatly Hotel offers 5-star accommodation with an outdoor pool, kids' club, sports facilities and a fitness center. There is also a spa, an indoor pool and sauna.
          </p>
          <p className="mb-2 md:mb-4">
            All units at the hotel are equipped with a seating area, a flat-screen TV with satellite channels, a dining area and a private bathroom with free toiletries, a bathtub and a hairdryer. Every room in Neatly Hotel features a furnished balcony. Some rooms are equipped with a coffee machine.
          </p>
          <p>
            Free WiFi and entertainment facilities are available at property and also rentals are provided to explore the area.
          </p>
        </div>
      </div>
      {/* Image Row (Slider) */}
      <div
        className="relative w-full flex flex-col items-center"
        style={{
          maxWidth: "100vw",
          margin: "0 auto",
          marginTop: "48px",
        }}
      >
        {/* Left Button */}
        <button
          aria-label="Previous"
          onClick={goLeft}
          disabled={current === 0}
          className={`
            absolute left-[-32px] top-1/2 -translate-y-1/2 z-10
            bg-white/80 hover:bg-white text-[#2F3E35] rounded-full shadow
            w-10 h-10 flex items-center justify-center
            border border-gray-200
            transition
            ${current === 0 ? "opacity-50 cursor-not-allowed" : ""}
            hidden lg:flex
          `}
          style={{ outline: "none" }}
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
            <path d="M13 16l-5-6 5-6" stroke="#2F3E35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {/* Right Button */}
        <button
          aria-label="Next"
          onClick={goRight}
          disabled={current >= images.length - slidesToShow}
          className={`
            absolute right-[-32px] top-1/2 -translate-y-1/2 z-10
            bg-white/80 hover:bg-white text-[#2F3E35] rounded-full shadow
            w-10 h-10 flex items-center justify-center
            border border-gray-200
            transition
            ${current >= images.length - slidesToShow ? "opacity-50 cursor-not-allowed" : ""}
            hidden lg:flex
          `}
          style={{ outline: "none" }}
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
            <path d="M7 4l5 6-5 6" stroke="#2F3E35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {/* Slider */}
        <div
          ref={containerRef}
          className={`
            flex items-center overflow-x-auto overflow-y-hidden
            gap-0
            scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent
            scroll-smooth
            rounded-none
            shadow-none
            px-0
            w-full
            bg-[#F7F7FA]
          `}
          style={{
            WebkitOverflowScrolling: "touch",
            scrollBehavior: "smooth",
            height: "260px",
            minHeight: "260px",
            marginTop: "0px",
            marginBottom: "0px",
            justifyContent: "center",
          }}
        >
          {images.map((img, idx) => (
            <div
              key={img.alt}
              className="flex-shrink-0 relative"
              style={{
                width: slidesToShow > 1 ? "20vw" : "100vw",
                maxWidth: slidesToShow > 1 ? "272px" : "100vw",
                minWidth: slidesToShow > 1 ? "200px" : "100vw",
                height: "260px",
                border: "none",
                background: "#f7f7fa",
                margin: "0",
                overflow: "hidden",
                borderRadius: 0,
              }}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                style={{ objectFit: "cover" }}
                sizes="(min-width: 1024px) 20vw, 100vw"
                priority={idx === 0}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Aboutsection;
