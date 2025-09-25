import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";

const Aboutsection = () => {
  // Carousel images
  const images = [
    { src: "/image/deluxe.jpg", alt: "Deluxe" },
    { src: "/image/premiersea.jpg", alt: "Premier Sea View" },
    { src: "/image/suite.jpg", alt: "Suite" },
    { src: "/image/superior.jpg", alt: "Superior" },
    { src: "/image/superiorgarden.jpg", alt: "Superior Garden View" },
    { src: "/image/supreme.jpg", alt: "Supreme" },
  ];

  // Responsive: 6 images on desktop, 1 on mobile
  const [slidesToShow, setSlidesToShow] = useState(1);
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1024) setSlidesToShow(6);
      else setSlidesToShow(1);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto play (Image Carousel)
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [images.length]);

  // Manual navigation
  function goLeft() {
    setCurrent((prev) => (prev - 1 + images.length) % images.length);
  }
  function goRight() {
    setCurrent((prev) => (prev + 1) % images.length);
  }

  // For desktop, show 6 images in a row, highlight current
  // For mobile, show only current image
  function getVisibleImages() {
    if (slidesToShow === 1) {
      return [images[current]];
    } else {
      // Show 6 images, current in the middle if possible
      let start = current - Math.floor(slidesToShow / 2);
      if (start < 0) start = 0;
      if (start > images.length - slidesToShow) start = images.length - slidesToShow;
      if (images.length <= slidesToShow) start = 0;
      return images.slice(start, start + slidesToShow);
    }
  }

  const visibleImages = getVisibleImages();

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
        {/* Left Button */}
        <button
          aria-label="Previous"
          onClick={goLeft}
          className={`
            absolute left-2 md:left-0 top-1/2 -translate-y-1/2 z-20
            bg-white/80 hover:bg-white text-[#2F3E35] rounded-full shadow
            w-10 h-10 md:w-12 md:h-12 flex items-center justify-center
            border border-gray-200
            transition
            flex
          `}
          style={{ outline: "none" }}
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 20 20" className="md:w-6 md:h-6">
            <path d="M13 16l-5-6 5-6" stroke="#2F3E35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {/* Right Button */}
        <button
          aria-label="Next"
          onClick={goRight}
          className={`
            absolute right-2 md:right-0 top-1/2 -translate-y-1/2 z-20
            bg-white/80 hover:bg-white text-[#2F3E35] rounded-full shadow
            w-10 h-10 md:w-12 md:h-12 flex items-center justify-center
            border border-gray-200
            transition
            flex
          `}
          style={{ outline: "none" }}
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 20 20" className="md:w-6 md:h-6">
            <path d="M7 4l5 6-5 6" stroke="#2F3E35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {/* Carousel Images */}
        <div
          className={`
            flex items-center justify-center
            w-full h-full bg-[#F7F7FA]
            relative
            overflow-hidden
          `}
          style={{
            height: "500px",
            minHeight: "500px",
            maxWidth: "1440px",
            marginTop: "0px",
            marginBottom: "0px",
          }}
        >
          {slidesToShow === 1 ? (
            // Mobile: show only current image
            <div
              className="flex-shrink-0 relative"
              style={{
                width: "100vw",
                maxWidth: "100vw",
                minWidth: "100vw",
                height: "500px",
                border: "none",
                background: "#f7f7fa",
                margin: "0",
                overflow: "hidden",
                borderRadius: 0,
                transition: "all 0.5s",
              }}
            >
              <Image
                src={images[current].src}
                alt={images[current].alt}
                fill
                style={{ objectFit: "cover" }}
                sizes="100vw"
                priority
              />
            </div>
          ) : (
            // Desktop: show 6 images, highlight current
            visibleImages.map((img, idx) => {
              // Find the index in the original images array
              let imgIdx = images.findIndex((i) => i.alt === img.alt);
              const isActive = imgIdx === current;
              return (
                <div
                  key={img.alt}
                  className="flex-shrink-0 relative"
                  style={{
                    width: "400px",
                    maxWidth: "400px",
                    minWidth: "400px",
                    height: "500px",
                    border: isActive ? "4px solid #F47A1F" : "none",
                    background: "#f7f7fa",
                    margin: "0",
                    overflow: "hidden",
                    borderRadius: isActive ? "12px" : 0,
                    boxShadow: isActive ? "0 4px 24px 0 rgba(244,122,31,0.10)" : "none",
                    opacity: isActive ? 1 : 0.7,
                    transition: "all 0.3s",
                  }}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="400px"
                    priority={imgIdx === 0}
                  />
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

export default Aboutsection;
