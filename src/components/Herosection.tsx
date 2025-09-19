import { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";

export default function Herosection() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [price, setPrice] = useState([1000, 5000]);
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const router = useRouter();

  // Price filter popover/modal
  const PriceFilter = (
    <div
      className="absolute left-1/2 -translate-x-1/2 top-full mt-4 z-30 bg-white rounded-xl shadow-lg p-6 flex flex-col gap-4 w-80"
      style={{ minWidth: 280 }}
    >
      <label className="text-gray-700 font-medium mb-2">Price Range (THB)</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          max={price[1]}
          value={price[0]}
          onChange={e => setPrice([Number(e.target.value), price[1]])}
          className="border rounded px-3 py-2 w-24 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
        <span className="mx-2 text-gray-400">-</span>
        <input
          type="number"
          min={price[0]}
          value={price[1]}
          onChange={e => setPrice([price[0], Number(e.target.value)])}
          className="border rounded px-3 py-2 w-24 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
      </div>
      <button
        className="bg-[#F47A1F] text-white rounded px-4 py-2 font-semibold mt-2"
        onClick={() => setShowPriceFilter(false)}
      >
        OK
      </button>
    </div>
  );

  return (
    <section
      id="hero"
      className="
        relative flex flex-col overflow-hidden
      "
      style={{
        width: "100%",
        minWidth: "375px",
        maxWidth: "1440px",
        minHeight: "500px",
        height: "600px",
        maxHeight: "600px",
        position: "relative",
        margin: "0 auto",
        border: "none", // Remove any border
        boxShadow: "none", // Remove any box-shadow
      }}
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/herosection.jpg"
          alt="Hero Section"
          fill
          style={{
            objectFit: "cover",
            objectPosition: "center",
          }}
          priority
          sizes="(max-width: 1440px) 100vw, 1440px"
        />
      </div>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 z-10" />
      {/* Centered content */}
      <div className="relative z-20 flex flex-col items-center w-full h-full">
        <div
          className="flex flex-col items-center justify-center w-full h-full"
          style={{
            marginTop: "0",
          }}
        >
          <h1
            className="text-white text-center font-serif font-medium"
            style={{
              fontSize: "clamp(2.2rem, 6vw, 56px)",
              lineHeight: "clamp(2.5rem, 7vw, 68px)",
              marginTop: "0",
              marginBottom: "32px",
              textShadow: "0 2px 16px rgba(0,0,0,0.25)",
              letterSpacing: 0.5,
              fontWeight: 500,
              maxWidth: 700,
              width: "100%",
              display: "block",
            }}
          >
            A Best Place for Your<br />Neatly Experience
          </h1>
          {/* Search Box */}
          <div
            className={`
              bg-white rounded-xl shadow-lg
              flex flex-col md:flex-row items-center
              px-4 md:px-8 py-6 gap-4 md:gap-0
              relative
              w-full
              max-w-[900px]
              min-h-[80px]
            `}
            style={{
              margin: "0 auto",
              minWidth: 320,
              maxWidth: 900,
              minHeight: 80,
              height: "auto",
              border: "none", // Remove any border
              boxShadow: "0 4px 24px rgba(0,0,0,0.10)", // Soft shadow only for the search box
            }}
          >
            {/* Check In */}
            <div className="flex flex-col flex-1 min-w-[120px] md:min-w-[180px] w-full md:w-auto md:mr-4">
              <label className="text-gray-500 text-xs mb-1 font-medium">Check In</label>
              <input
                type="date"
                className="border rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300 w-full"
                value={checkIn}
                onChange={e => setCheckIn(e.target.value)}
                placeholder="Check In"
              />
            </div>
            {/* Check Out */}
            <div className="flex flex-col flex-1 min-w-[120px] md:min-w-[180px] w-full md:w-auto md:mr-4">
              <label className="text-gray-500 text-xs mb-1 font-medium">Check Out</label>
              <input
                type="date"
                className="border rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300 w-full"
                value={checkOut}
                onChange={e => setCheckOut(e.target.value)}
                placeholder="Check Out"
              />
            </div>
            {/* Rooms & Guests */}
            <div className="flex flex-col flex-1 min-w-[140px] md:min-w-[200px] w-full md:w-auto md:mr-4">
              <label className="text-gray-500 text-xs mb-1 font-medium">Rooms & Guests</label>
              <div className="flex gap-2">
                <select
                  className="border rounded px-2 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300 w-full"
                  value={rooms}
                  onChange={e => setRooms(Number(e.target.value))}
                >
                  {[1,2,3,4,5].map(n => (
                    <option key={n} value={n}>{n} Room{n > 1 ? "s" : ""}</option>
                  ))}
                </select>
                <select
                  className="border rounded px-2 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300 w-full"
                  value={guests}
                  onChange={e => setGuests(Number(e.target.value))}
                >
                  {[1,2,3,4,5,6].map(n => (
                    <option key={n} value={n}>{n} Guest{n > 1 ? "s" : ""}</option>
                  ))}
                </select>
              </div>
            </div>
            {/* Search Button */}
            <div className="flex flex-col justify-end w-full md:w-auto mt-4 md:mt-0">
              <button
                className="bg-[#F47A1F] text-white font-semibold rounded px-6 py-2 w-full md:w-[110px] h-[40px] transition hover:bg-orange-600"
                style={{
                  minWidth: 100,
                  height: 40,
                }}
                onClick={() => {
                  router.push("/customer/search-result");
                }}
              >
                Search 
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
