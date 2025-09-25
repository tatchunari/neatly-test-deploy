"use client";

import Image from "next/image";

const rooms = [
  {
    name: "Superior Garden View",
    image: "/image/superiorgarden.jpg",
    link: "#",
  },
  {
    name: "Deluxe",
    image: "/image/deluxe.jpg",
    link: "#",
  },
  {
    name: "Superior",
    image: "/image/superior.jpg",
    link: "#",
  },
  {
    name: "Premier Sea View",
    image: "/image/premiersea.jpg",
    link: "#",
  },
  {
    name: "Supreme",
    image: "/image/supreme.jpg",
    link: "#",
  },
  {
    name: "Suite",
    image: "/image/suite.jpg",
    link: "#",
  },
];

const Roomwrapper = () => {
  return (
    <section
      id="rooms"
      className="
        bg-[#F7F7FA]
        w-full
        flex flex-col items-center
        py-10 md:py-20
      "
      style={{
        minHeight: "1755px",
        maxWidth: "100vw",
      }}
    >
      <h2
        className="
          text-[#2D5A27]
          text-[28px] md:text-[36px]
          font-Noto
          text-center
          mb-8 md:mb-14
        "
      >
        Rooms &amp; Suites
      </h2>
      <div
        className="
          w-full max-w-[359px] md:max-w-[1200px]
          grid
          grid-cols-1
          md:grid-cols-2
          gap-4 md:gap-6
          px-4 md:px-0
        "
        style={{
          minHeight: "1440px",
          maxWidth: "100vw",
        }}
      >
        {/* First row: 1 big image */}
        <div className="col-span-1 md:col-span-2 relative h-[250px] md:h-[400px] rounded-xl overflow-hidden shadow">
          <Image
            src={rooms[0].image}
            alt={rooms[0].name}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 1200px"
          />
          <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-4 md:p-6">
            <span className="text-white text-lg md:text-2xl font-Noto mb-2 drop-shadow">
              {rooms[0].name}
            </span>
            <a
              href={rooms[0].link}
              className="text-white text-sm underline underline-offset-2"
            >
              Explore Room &rarr;
            </a>
          </div>
        </div>
        {/* Second row: 2 images */}
        <div className="relative h-[180px] md:h-[220px] rounded-xl overflow-hidden shadow">
          <Image
            src={rooms[1].image}
            alt={rooms[1].name}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 588px"
          />
          <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-4 md:p-6">
            <span className="text-white text-base md:text-xl font-Noto mb-2 drop-shadow">
              {rooms[1].name}
            </span>
            <a
              href={rooms[1].link}
              className="text-white text-xs underline underline-offset-2"
            >
              Explore Room &rarr;
            </a>
          </div>
        </div>
        <div className="relative h-[180px] md:h-[220px] rounded-xl overflow-hidden shadow">
          <Image
            src={rooms[2].image}
            alt={rooms[2].name}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 588px"
          />
          <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-4 md:p-6">
            <span className="text-white text-base md:text-xl font-Noto mb-2 drop-shadow">
              {rooms[2].name}
            </span>
            <a
              href={rooms[2].link}
              className="text-white text-xs underline underline-offset-2"
            >
              Explore Room &rarr;
            </a>
          </div>
        </div>
        {/* Third row: 3 images (Premier Sea View, Supreme, Suite) */}
        <div className="col-span-1 md:col-span-1 relative h-[180px] md:h-[220px] rounded-xl overflow-hidden shadow">
          <Image
            src={rooms[3].image}
            alt={rooms[3].name}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 588px"
          />
          <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-4 md:p-6">
            <span className="text-white text-base md:text-xl font-Noto mb-2 drop-shadow">
              {rooms[3].name}
            </span>
            <a
              href={rooms[3].link}
              className="text-white text-xs underline underline-offset-2"
            >
              Explore Room &rarr;
            </a>
          </div>
        </div>
        <div className="col-span-1 md:col-span-1 relative h-[180px] md:h-[220px] rounded-xl overflow-hidden shadow">
          <Image
            src={rooms[4].image}
            alt={rooms[4].name}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 588px"
          />
          <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-4 md:p-6">
            <span className="text-white text-base md:text-xl font-Noto mb-2 drop-shadow">
              {rooms[4].name}
            </span>
            <a
              href={rooms[4].link}
              className="text-white text-xs underline underline-offset-2"
            >
              Explore Stays &rarr;
            </a>
          </div>
        </div>
        <div className="col-span-1 md:col-span-2 relative h-[180px] md:h-[220px] rounded-xl overflow-hidden shadow">
          <Image
            src={rooms[5].image}
            alt={rooms[5].name}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 1200px"
          />
          <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-4 md:p-6">
            <span className="text-white text-base md:text-xl font-Noto mb-2 drop-shadow">
              {rooms[5].name}
            </span>
            <a
              href={rooms[5].link}
              className="text-white text-xs underline underline-offset-2"
            >
              Explore Room &rarr;
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Roomwrapper;
