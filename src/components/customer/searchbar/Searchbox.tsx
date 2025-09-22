import React, { useState } from "react";

// Room options for the dropdown
const roomOptions = [
  { value: "1-2", label: "1 room, 2 guests" },
  { value: "2-4", label: "2 rooms, 4 guests" },
  { value: "3-6", label: "3 rooms, 6 guests" },
];

// Helper to get today's date in yyyy-mm-dd format
function getTodayDateString() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function SearchBox() {
  const [checkIn, setCheckIn] = useState<string>(getTodayDateString());
  const [checkOut, setCheckOut] = useState<string>(getTodayDateString());
  const [room, setRoom] = useState(roomOptions[0].value);

  return (
    <div
      className={`
        w-full
        bg-white
        rounded-xl
        shadow
        flex flex-col md:flex-row
        items-center
        justify-center
        mx-auto
        px-4 md:px-0
        gap-4 md:gap-6
      `}
      style={{
        maxWidth: "1440px",
        height: "364px",
        maxHeight: "364px",
      }}
    >
      <div
        className="
          flex flex-col flex-1 min-w-[180px]
          md:min-w-[240px]
          md:max-w-[320px]
          w-full
        "
      >
        <label className="text-xs text-gray-500 mb-1" htmlFor="checkin">
          Check In
        </label>
        <div className="relative">
          <input
            id="checkin"
            type="date"
            className="w-full border border-gray-200 rounded-md py-2 px-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            value={checkIn}
            min={getTodayDateString()}
            onChange={(e) => setCheckIn(e.target.value)}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <rect width="18" height="18" x="3" y="3" fill="none" rx="2" stroke="#BDBDBD" strokeWidth="1.5"/>
              <path d="M7 7V5M17 7V5" stroke="#BDBDBD" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M3 9.5h18" stroke="#BDBDBD" strokeWidth="1.5"/>
            </svg>
          </span>
        </div>
      </div>
      <div
        className="
          flex flex-col flex-1 min-w-[180px]
          md:min-w-[240px]
          md:max-w-[320px]
          w-full
        "
      >
        <label className="text-xs text-gray-500 mb-1" htmlFor="checkout">
          Check Out
        </label>
        <div className="relative">
          <input
            id="checkout"
            type="date"
            className="w-full border border-gray-200 rounded-md py-2 px-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            value={checkOut}
            min={checkIn}
            onChange={(e) => setCheckOut(e.target.value)}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <rect width="18" height="18" x="3" y="3" fill="none" rx="2" stroke="#BDBDBD" strokeWidth="1.5"/>
              <path d="M7 7V5M17 7V5" stroke="#BDBDBD" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M3 9.5h18" stroke="#BDBDBD" strokeWidth="1.5"/>
            </svg>
          </span>
        </div>
      </div>
      <div
        className="
          flex flex-col flex-1 min-w-[180px]
          md:min-w-[240px]
          md:max-w-[320px]
          w-full
        "
      >
        <label className="text-xs text-gray-500 mb-1" htmlFor="room">
          Rooms & Guests
        </label>
        <div className="relative">
          <select
            id="room"
            className="w-full border border-gray-200 rounded-md py-2 px-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 appearance-none"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          >
            {roomOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <svg width="16" height="16" fill="none" viewBox="0 0 20 20">
              <path d="M6 8l4 4 4-4" stroke="#BDBDBD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </div>
      </div>
      <div className="flex flex-col justify-end h-full pt-6 md:pt-0">
        <button
          className="
            border border-orange-400 text-orange-400
            rounded-md px-6 py-2 text-sm font-medium
            hover:bg-orange-400 hover:text-white transition
            min-w-[100px]
          "
          style={{ height: "40px" }}
        >
          Search
        </button>
      </div>
    </div>
  );
}
