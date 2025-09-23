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

interface SearchBoxProps {
  onSearch?: () => void;
}

export default function SearchBox({ onSearch }: SearchBoxProps) {
  const [checkIn, setCheckIn] = useState<string>(getTodayDateString());
  const [checkOut, setCheckOut] = useState<string>(getTodayDateString());
  const [room, setRoom] = useState(roomOptions[0].value);

  return (
    <div
      className={`
        bg-white
        rounded-xl
        shadow
        mx-auto
        flex
        items-center
        justify-center
        px-4 md:px-0
        relative
        z-10
      `}
      style={{
        maxWidth: "1440px",
        width: "100%",
        marginTop: "0",
      }}
    >
      <style>
        {`
          @media (max-width: 767px) {
            .searchbox-mobile-size {
              width: 343px !important;
              min-width: 343px !important;
              max-width: 343px !important;
              height: 364px !important;
              min-height: 364px !important;
              max-height: 364px !important;
              padding-left: 0 !important;
              padding-right: 0 !important;
              flex-direction: column !important;
              gap: 16px !important;
            }
            .searchbox-field {
              width: 343px !important;
              min-width: 343px !important;
              max-width: 343px !important;
              height: 48px !important;
              min-height: 48px !important;
              max-height: 48px !important;
            }
            .searchbox-btn {
              width: 144px !important;
              min-width: 144px !important;
              max-width: 144px !important;
              height: 48px !important;
              min-height: 48px !important;
              max-height: 48px !important;
              align-self: flex-end !important;
            }
            .searchbox-input,
            .searchbox-select {
              width: 343px !important;
              min-width: 343px !important;
              max-width: 343px !important;
              height: 48px !important;
              min-height: 48px !important;
              max-height: 48px !important;
            }
          }
        `}
      </style>
      <form
        className={`
          searchbox-mobile-size
          flex flex-row
          items-center
          justify-center
          gap-4
          w-full
          py-8 md:py-0
        `}
        style={{
          width: "100%",
        }}
        onSubmit={e => { 
          e.preventDefault(); 
          if (onSearch) {
            onSearch();
          }
        }}
      >
        {/* Check In */}
        <div
          className={`
            searchbox-field
            flex flex-col
            justify-end
          `}
          style={{
            width: "446px",
            maxWidth: "446px",
            minWidth: "200px",
            height: "48px",
          }}
        >
          <label className="text-xs text-gray-500 mb-1" htmlFor="checkin">
            Check In
          </label>
          <div className="relative h-full">
            <input
              id="checkin"
              type="date"
              className="searchbox-input w-full h-[48px] border border-gray-200 rounded-md px-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              value={checkIn}
              min={getTodayDateString()}
              onChange={(e) => setCheckIn(e.target.value)}
              style={{
                height: "48px",
                minHeight: "48px",
                maxHeight: "48px",
              }}
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
        {/* Check Out */}
        <div
          className={`
            searchbox-field
            flex flex-col
            justify-end
          `}
          style={{
            width: "446px",
            maxWidth: "446px",
            minWidth: "200px",
            height: "48px",
          }}
        >
          <label className="text-xs text-gray-500 mb-1" htmlFor="checkout">
            Check Out
          </label>
          <div className="relative h-full">
            <input
              id="checkout"
              type="date"
              className="searchbox-input w-full h-[48px] border border-gray-200 rounded-md px-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              value={checkOut}
              min={
                checkIn
                  ? (() => {
                      const d = new Date(checkIn);
                      d.setDate(d.getDate() + 1);
                      return d.toISOString().split("T")[0];
                    })()
                  : getTodayDateString()
              }
              onChange={(e) => setCheckOut(e.target.value)}
              style={{
                height: "48px",
                minHeight: "48px",
                maxHeight: "48px",
              }}
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
        {/* Rooms & Guests */}
        <div
          className={`
            searchbox-field
            flex flex-col
            justify-end
          `}
          style={{
            width: "446px",
            maxWidth: "446px",
            minWidth: "200px",
            height: "48px",
          }}
        >
          <label className="text-xs text-gray-500 mb-1" htmlFor="room">
            Rooms & Guests
          </label>
          <div className="relative h-full">
            <select
              id="room"
              className="searchbox-select w-full h-[48px] border border-gray-200 rounded-md px-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 appearance-none"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              style={{
                height: "48px",
                minHeight: "48px",
                maxHeight: "48px",
              }}
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
        {/* Search Button */}
        <div
          className={`
            searchbox-btn
            flex flex-row
            justify-end
            items-end
          `}
          style={{
            minWidth: "144px",
            maxWidth: "144px",
            width: "144px",
            height: "48px",
          }}
        >
          <button
            type="submit"
            className={`
              border border-orange-400 text-orange-400
              rounded-md text-sm font-medium
              hover:bg-orange-400 hover:text-white transition
              w-full
              h-[48px]
              focus:outline-none
            `}
            style={{
              minWidth: "144px",
              maxWidth: "144px",
              width: "144px",
              height: "48px",
            }}
          >
            Search
          </button>
        </div>
      </form>
    </div>
  );
}
