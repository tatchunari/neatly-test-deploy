import Image from "next/image";
import SearchBox from "./customer/searchbar/Searchbox";
import { useRouter } from "next/router";

export default function Herosection() {
  const router = useRouter();

  const handleSearch = (params: { checkIn: string; checkOut: string; room: string }) => {
    const query = new URLSearchParams(params).toString();
    router.push(`/customer/search-result?${query}`);
  };

  return (
    <section
      id="hero"
      className="fixed top-0 left-0 w-screen h-screen min-h-[600px] max-h-none z-0 flex flex-col overflow-hidden"
      style={{
        minWidth: "100vw",
        width: "100vw",
        maxWidth: "100vw",
        minHeight: "600px",
        height: "100vh",
        maxHeight: "none",
        position: "relative", // Ensure fixed positioning
        top: 0,
        left: 0,
        margin: "0",
        marginLeft: "calc(50% - 50vw)",
        marginRight: "calc(50% - 50vw)",
        border: "none",
        boxShadow: "none",
        padding: "0",
        background: "transparent", // Remove any background that could cause a white bar
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
          sizes="100vw"
        />
      </div>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 z-10" />
      {/* Centered content */}
      <div className="relative z-20 flex flex-col items-center w-full h-full">
        <div className="flex flex-col items-center justify-center w-full h-full">
          <h1
            className="text-white text-center font-serif"
            style={{
              fontSize: "clamp(2.5rem, 6vw, 56px)",
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
          <div style={{ height: 40 }} />
          {/* Search Box */}
          <div
            className={`
              w-full
              max-w-[900px]
              min-h-[80px]
              flex
              justify-center
              items-center
            `}
            style={{
              margin: "0 auto",
              minWidth: 320,
              maxWidth: 900,
              minHeight: 80,
              height: "auto",
            }}
          >
<<<<<<< HEAD
            <SearchBox onSearch={handleSearch} />
=======
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
                  router.push("/pages/customer/search-result");
                }}
              >
                Search 
              </button>
            </div>
>>>>>>> d6ec971 (move image)
          </div>
        </div>
      </div>
    </section>
  );
}
