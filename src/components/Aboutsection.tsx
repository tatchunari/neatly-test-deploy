"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const images = [
  { src: "/image/deluxe.jpg", alt: "Deluxe" },
  { src: "/image/premiersea.jpg", alt: "Premier Sea View" },
  { src: "/image/suite.jpg", alt: "Suite" },
  { src: "/image/superior.jpg", alt: "Superior" },
  { src: "/image/superiorgarden.jpg", alt: "Superior Garden View" },
  { src: "/image/supreme.jpg", alt: "Supreme" },
];

export default function Aboutsection() {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ฟังก์ชันเปลี่ยนภาพ
  const goToPrev = () => {
    setIndex((prev) => (prev - 1 + images.length) % images.length);
    resetTimer();
  };

  const goToNext = () => {
    setIndex((prev) => (prev + 1) % images.length);
    resetTimer();
  };

  // รีเซ็ต timer เมื่อกดปุ่ม
  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 8000);
  };

  // เปลี่ยนภาพทุก 8 วิ
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 8000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line
  }, []);

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
      {/* Image Carousel */}
      <div
        className="relative w-full flex flex-col items-center"
        style={{
          maxWidth: "1440px",
          margin: "0 auto",
          marginTop: "48px",
          height: "500px",
        }}
      >
        <div className="relative w-full h-[500px] overflow-hidden rounded-2xl shadow-lg bg-[#F7F7FA]">
          {/* ปุ่มเลื่อนซ้าย */}
          <button
            aria-label="Previous image"
            onClick={goToPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-gray-700 rounded-full shadow p-2 transition-colors"
            style={{ outline: "none", border: "none" }}
          >
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
              <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {/* ปุ่มเลื่อนขวา */}
          <button
            aria-label="Next image"
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-gray-700 rounded-full shadow p-2 transition-colors"
            style={{ outline: "none", border: "none" }}
          >
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <AnimatePresence>
            <motion.img
              key={images[index].src}
              src={images[index].src}
              alt={images[index].alt}
              className="w-full h-full object-cover absolute"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.8 }}
              style={{ minHeight: "500px", maxHeight: "500px" }}
            />
          </AnimatePresence>
          {/* จุดบอกตำแหน่ง (Indicators) */}
          <div className="absolute bottom-4 w-full flex justify-center gap-2 z-10">
            {images.map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  i === index ? "bg-white" : "bg-gray-400"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
