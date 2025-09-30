import React, { useState, useRef } from "react";

// Helper to get today's date in yyyy-mm-dd format
function getTodayDateString() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Helper to format date as "Thu, 19 Oct 2022"
function formatDateString(dateStr: string) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface SearchParams {
  checkIn: string;
  checkOut: string;
  room: string; // number of rooms
  guests: string; // number of guests
}

interface SearchBoxProps {
  onSearch?: (params: SearchParams) => void;
  defaultValues?: Partial<SearchParams>;
}

export default function SearchBox({ onSearch, defaultValues }: SearchBoxProps) {
  // Parse default values
  const defaultRoom = defaultValues?.room ? Number(defaultValues.room) : 1;
  const defaultGuest = defaultValues?.guests ? Number(defaultValues.guests) : 2;

  const [checkIn, setCheckIn] = useState<string>(defaultValues?.checkIn || getTodayDateString());
  const [checkOut, setCheckOut] = useState<string>(defaultValues?.checkOut || getTodayDateString());
  const [room, setRoom] = useState<number>(defaultRoom);
  const [guest, setGuest] = useState<number>(defaultGuest);

  // For dropdown
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownButtonRef = useRef<HTMLDivElement>(null);
  const dropdownPanelRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownButtonRef.current &&
        !dropdownButtonRef.current.contains(event.target as Node) &&
        dropdownPanelRef.current &&
        !dropdownPanelRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  // Label for the selector
  const roomGuestLabel = `${room} room${room > 1 ? "s" : ""}, ${guest} guest${guest > 1 ? "s" : ""}`;

  // Minimums
  const minRoom = 1;
  const minGuest = 1;

  // Maximums (arbitrary, can adjust)
  const maxRoom = 10;
  const maxGuest = 20;

  // Calendar SVG
  const calendarIcon = (
    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
      <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
        <rect x="3" y="5" width="14" height="12" rx="2" stroke="#BDBDBD" strokeWidth="1.2" />
        <path d="M7 3v2M13 3v2" stroke="#BDBDBD" strokeWidth="1.2" strokeLinecap="round" />
        <rect x="7" y="9" width="2" height="2" rx="1" fill="#BDBDBD" />
        <rect x="11" y="9" width="2" height="2" rx="1" fill="#BDBDBD" />
      </svg>
    </span>
  );

  return (
    <div
      className={`
        flex
        items-center
        justify-center
        px-4 md:px-0
        relative
        z-10
      `}
      style={{
        maxWidth: "100vw",
        width: "100%",
        marginTop: "0",
      }}
    >
      <style>
        {`
          @media (max-width: 767px) {
            .searchbox-outer-border {
              width: 343px !important;
              min-width: 343px !important;
              max-width: 343px !important;
              height: 396px !important;
              min-height: 396px !important;
              max-height: 396px !important;
              border: 6px solid #fff;
              border-radius: 1.25rem;
              box-sizing: border-box;
              background: #fff;
              box-shadow: 0 6px 32px 0 rgba(0,0,0,0.08);
              padding: 0.5rem;
              display: flex;
              justify-content: center;
              align-items: center;
            }
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
              width: 343px !important;
              min-width: 343px !important;
              max-width: 343px !important;
              height: 48px !important;
              min-height: 48px !important;
              max-height: 48px !important;
              align-self: flex-end !important;
            }
            .searchbox-input {
              width: 343px !important;
              min-width: 343px !important;
              max-width: 343px !important;
              height: 48px !important;
              min-height: 48px !important;
              max-height: 48px !important;
            }
            .searchbox-btn button {
              width: 343px !important;
              min-width: 343px !important;
              max-width: 343px !important;
              height: 48px !important;
              min-height: 48px !important;
              max-height: 48px !important;
            }
          }
          @media (min-width: 768px) {
            .searchbox-outer-border {
              width: 1120px !important;
              min-width: 1120px !important;
              max-width: 1120px !important;
              height: 196px !important;
              min-height: 196px !important;
              max-height: 196px !important;
              border: 6px solid #fff;
              border-radius: 1.25rem; /* 20px */
              box-sizing: border-box;
              background: #fff;
              box-shadow: 0 6px 32px 0 rgba(0,0,0,0.08);
              padding: 0.5rem;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            .searchbox-mobile-size {
              width: 100%;
              height: 100%;
              flex-direction: row !important;
              gap: 24px !important;
              padding-left: 0 !important;
              padding-right: 0 !important;
              align-items: center !important;
              position: relative;
            }
            .searchbox-field {
              width: 260px !important;
              min-width: 200px !important;
              max-width: 320px !important;
              height: 48px !important;
              min-height: 48px !important;
              max-height: 48px !important;
            }
            .searchbox-btn {
              min-width: 144px !important;
              max-width: 144px !important;
              width: 144px !important;
              height: 48px !important;
              min-height: 48px !important;
              max-height: 48px !important;
              align-self: center !important;
            }
            .searchbox-input {
              width: 100% !important;
              min-width: 0 !important;
              max-width: 100% !important;
              height: 48px !important;
              min-height: 48px !important;
              max-height: 48px !important;
            }
            .searchbox-btn button {
              min-width: 144px !important;
              max-width: 144px !important;
              width: 144px !important;
              height: 48px !important;
              min-height: 48px !important;
              max-height: 48px !important;
            }
          }
        `}
      </style>
      <div className="searchbox-outer-border flex justify-center items-center">
        <div
          className={`
            bg-white
            rounded-xl
            shadow
            mx-auto
            flex
            items-center
            justify-center
            px-0
            relative
            z-10
            w-full
            h-full
          `}
          style={{
            width: "100%",
            height: "100%",
            marginTop: "0",
          }}
        >
          <form
            className={`
              searchbox-mobile-size
              flex
              items-center
              justify-center
              w-full
              h-full
              py-0
            `}
            style={{
              width: "100%",
              height: "100%",
            }}
            onSubmit={e => { 
              e.preventDefault(); 
              if (onSearch) {
                onSearch({ checkIn, checkOut, room: room.toString(), guests: guest.toString() });
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
            >
              <label className="text-xs text-black-500 mb-1" htmlFor="checkin">
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
                {/* Calendar icon removed */}
              </div>
            </div>
            {/* Check Out */}
            <div
              className={`
                searchbox-field
                flex flex-col
                justify-end
              `}
            >
              <label className="text-xs text-black-500 mb-1" htmlFor="checkout">
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
                {/* Calendar icon removed */}
              </div>
            </div>
            {/* Rooms & Guests */}
            <div
              className={`
                searchbox-field
                flex flex-col
                justify-end
                relative
              `}
              ref={dropdownButtonRef}
            >
              <label className="text-xs text-black-500 mb-1" htmlFor="roomguest">
                Rooms & Guests
              </label>
              <div className="relative h-full">
                <button
                  id="roomguest"
                  type="button"
                  className="searchbox-select w-full h-[48px] border border-gray-200 rounded-md px-3 pr-8 text-sm text-left bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 appearance-none flex items-center"
                  style={{
                    height: "48px",
                    minHeight: "48px",
                    maxHeight: "48px",
                  }}
                  onClick={() => setDropdownOpen((v) => !v)}
                  tabIndex={0}
                >
                  {roomGuestLabel}
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <svg width="16" height="16" fill="none" viewBox="0 0 20 20">
                      <path d="M6 8l4 4 4-4" stroke="#BDBDBD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </button>
                {dropdownOpen && (
                  <div
                    className="absolute left-0 top-full mt-2 bg-white rounded-lg shadow-lg py-3 px-4 z-20 w-full min-w-[240px] max-w-[320px]"
                    style={{
                      boxShadow: "0 4px 24px 0 rgba(0,0,0,0.08)",
                    }}
                    ref={dropdownPanelRef}
                  >
                    {/* Room */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-700">Room</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="w-7 h-7 flex items-center justify-center rounded-full border border-orange-400 text-orange-400 hover:bg-orange-50 transition disabled:opacity-50"
                          onClick={() => setRoom((r) => Math.max(minRoom, r - 1))}
                          disabled={room <= minRoom}
                          aria-label="Decrease room"
                        >
                          <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
                            <circle cx="9" cy="9" r="8" stroke="#F47A1F" strokeWidth="1.5" fill="none"/>
                            <rect x="5" y="8.25" width="8" height="1.5" rx="0.75" fill="#F47A1F"/>
                          </svg>
                        </button>
                        <span className="w-5 text-center text-base text-gray-700">{room}</span>
                        <button
                          type="button"
                          className="w-7 h-7 flex items-center justify-center rounded-full border border-orange-400 text-orange-400 hover:bg-orange-50 transition"
                          onClick={() => setRoom((r) => Math.min(maxRoom, r + 1))}
                          aria-label="Increase room"
                        >
                          <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
                            <circle cx="9" cy="9" r="8" stroke="#F47A1F" strokeWidth="1.5" fill="none"/>
                            <rect x="8.25" y="5" width="1.5" height="8" rx="0.75" fill="#F47A1F"/>
                            <rect x="5" y="8.25" width="8" height="1.5" rx="0.75" fill="#F47A1F"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                    {/* Guest */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Guest</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="w-7 h-7 flex items-center justify-center rounded-full border border-orange-400 text-orange-400 hover:bg-orange-50 transition disabled:opacity-50"
                          onClick={() => setGuest((g) => Math.max(minGuest, g - 1))}
                          disabled={guest <= minGuest}
                          aria-label="Decrease guest"
                        >
                          <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
                            <circle cx="9" cy="9" r="8" stroke="#F47A1F" strokeWidth="1.5" fill="none"/>
                            <rect x="5" y="8.25" width="8" height="1.5" rx="0.75" fill="#F47A1F"/>
                          </svg>
                        </button>
                        <span className="w-5 text-center text-base text-gray-700">{guest}</span>
                        <button
                          type="button"
                          className="w-7 h-7 flex items-center justify-center rounded-full border border-orange-400 text-orange-400 hover:bg-orange-50 transition"
                          onClick={() => setGuest((g) => Math.min(maxGuest, g + 1))}
                          aria-label="Increase guest"
                        >
                          <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
                            <circle cx="9" cy="9" r="8" stroke="#F47A1F" strokeWidth="1.5" fill="none"/>
                            <rect x="8.25" y="5" width="1.5" height="8" rx="0.75" fill="#F47A1F"/>
                            <rect x="5" y="8.25" width="8" height="1.5" rx="0.75" fill="#F47A1F"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Search Button */}
            <div
              className={`
                searchbox-btn
                flex flex-row
                justify-center
                items-center
                md:ml-auto
              `}
            >
              <button
                type="submit"
                className={`
                  bg-orange-400 text-white
                  border border-orange-400
                  rounded-md text-sm font-medium
                  hover:bg-orange-500 hover:text-white transition
                  w-full
                  h-[48px]
                  focus:outline-none
                `}
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
