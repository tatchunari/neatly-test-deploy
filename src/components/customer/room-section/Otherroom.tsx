import React, { useEffect, useState } from "react";
import Link from "next/link";

type Room = {
  id: string | number;
  name: string;
  main_image_url?: string;
  room_type?: string;
  // add more fields as needed
};

export default function Otherroompage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      setError(null);
      try {
        // fetch from the same API as /customer/search-result
        const response = await fetch("/api/rooms");
        if (!response.ok) {
          throw new Error("Failed to fetch rooms");
        }
        const data = await response.json();
        // สมมติว่า API ส่ง { data: [...] }
        setRooms(Array.isArray(data?.data) ? data.data : []);
      } catch (err: any) {
        setError(err?.message || "Error fetching rooms");
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  // Show only 3 rooms (like original)
  const displayRooms = rooms.slice(0, 3);

  return (
    <section className="w-full bg-[#F7F7FA] py-10 md:py-16">
      <div className="max-w-[1200px] mx-auto px-4">
        <h2 className="text-center font-serif text-[#2F3E35] text-[28px] md:text-[32px] font-semibold mb-10">
          Other Rooms
        </h2>
        {loading ? (
          <div className="text-center text-gray-500 py-10">Loading rooms...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-10">{error}</div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center md:items-stretch">
            {displayRooms.length === 0 ? (
              <div className="text-center text-gray-500 py-10">No rooms found.</div>
            ) : (
              displayRooms.map((room) => (
                <div
                  key={room.id ?? room.name}
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
                    {room.main_image_url ? (
                      <img
                        src={room.main_image_url}
                        alt={room.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        style={{
                          width: "100%",
                          height: "100%",
                        }}
                        sizes="(max-width: 768px) 309px, 548px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-100">
                        No Image
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30" />
                  </div>
                  <div className="absolute left-0 bottom-0 w-full px-6 pb-6 pt-10 flex flex-col justify-end z-10">
                    <span className="text-white font-serif text-[24px] md:text-[28px] font-semibold drop-shadow">
                      {room.name}
                    </span>
                    <Link
                      href={`/customer/search-result/${room.id}`}
                      className="mt-2 inline-block text-white text-[15px] font-medium underline underline-offset-4 hover:text-[#E2B16A] transition"
                    >
                      Explore Room &nbsp; &rarr;
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        {/* Pagination Dots */}
        <div className="flex justify-center gap-4 mt-10">
          <button
            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center bg-white hover:bg-gray-100 transition"
            aria-label="Previous"
            disabled
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 4l-4 4 4 4" />
            </svg>
          </button>
          <button
            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center bg-white hover:bg-gray-100 transition"
            aria-label="Next"
            disabled
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
