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
            <SearchBox onSearch={handleSearch} />
          </div>
        </div>
      </div>
    </section>
  );
}
