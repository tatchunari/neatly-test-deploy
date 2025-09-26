import React from "react";

const rooms = [
  {
    name: "Deluxe",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    link: "#",
  },
  {
    name: "Superior",
    image:
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80",
    link: "#",
  },
  {
    name: "Suite",
    image:
      "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80",
    link: "#",
  },
];

export default function Otherroompage() {
  return (
    <section className="w-full bg-[#F7F7FA] py-10 md:py-16">
      <div className="max-w-[1200px] mx-auto px-4">
        <h2 className="text-center font-serif text-[#2F3E35] text-[28px] md:text-[32px] font-semibold mb-10">
          Other Rooms
        </h2>
        <div className="flex flex-col md:flex-row gap-6 justify-center items-center md:items-stretch">
          {rooms.map((room) => (
            <div
              key={room.name}
              className="relative rounded-xl overflow-hidden shadow bg-white group transition-all duration-200"
              style={{
                width: "309px",
                height: "206px",
                maxWidth: "100%",
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  width: "100%",
                  height: "100%",
                }}
              >
                <img
                  src={room.image}
                  alt={room.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  style={{
                    width: "100%",
                    height: "100%",
                  }}
                  sizes="(max-width: 768px) 309px, 548px"
                />
                <div className="absolute inset-0 bg-black/30" />
              </div>
              <div className="absolute left-0 bottom-0 w-full px-6 pb-6 pt-10 flex flex-col justify-end z-10">
                <span className="text-white font-serif text-[24px] md:text-[28px] font-semibold drop-shadow">
                  {room.name}
                </span>
                <a
                  href={room.link}
                  className="mt-2 inline-block text-white text-[15px] font-medium underline underline-offset-4 hover:text-[#E2B16A] transition"
                >
                  Explore Room &nbsp; &rarr;
                </a>
              </div>
            </div>
          ))}
        </div>
        {/* Pagination Dots */}
        <div className="flex justify-center gap-4 mt-10">
          <button
            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center bg-white hover:bg-gray-100 transition"
            aria-label="Previous"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 4l-4 4 4 4" />
            </svg>
          </button>
          <button
            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center bg-white hover:bg-gray-100 transition"
            aria-label="Next"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 12l4-4-4-4" />
            </svg>
          </button>
        </div>
      </div>
      <style jsx>{`
        @media (min-width: 768px) {
          section > div > div.flex > div {
            width: 548px !important;
            height: 340px !important;
            min-width: 0;
          }
        }
        @media (max-width: 767px) {
          section > div > div.flex > div {
            width: 309px !important;
            height: 206px !important;
            min-width: 0;
          }
        }
      `}</style>
    </section>
  );
}
