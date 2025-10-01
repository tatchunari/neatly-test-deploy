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
        minHeight: "100vh",
        width: "100vw",
        maxWidth: "100vw",
        marginLeft: "calc(50% - 50vw)",
        marginRight: "calc(50% - 50vw)",
      }}
    >
      <h2
        className="
          text-[#2D5A27]
          text-[30px] md:text-[48px]
          font-serif
          text-center
          mb-8 md:mb-14
        "
      >
        Rooms &amp; Suites
      </h2>
      <div
        className="
          w-full md:max-w-[1120px]
          flex flex-col gap-4 md:gap-6
          px-0 md:px-0
        "
        style={{
          width: "100vw",
          maxWidth: "100vw",
        }}
      >
        {/* Row 1: Superior Garden View */}
        <div
          className="relative rounded-xl overflow-hidden shadow mx-auto superior-garden-image"
          style={{
            width: "100%",
            minWidth: "0",
            maxWidth: "100%",
            height: "250px",
            minHeight: "250px",
            maxHeight: "250px",
          }}
        >
          <Image
            src={rooms[0].image}
            alt={rooms[0].name}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 767px) 100vw, (min-width: 768px) 1120px"
            style={{
              objectFit: "cover",
            }}
          />
          <style>
            {`
              @media (min-width: 768px) {
                .superior-garden-image {
                  width: 1120px !important;
                  min-width: 1120px !important;
                  max-width: 1120px !important;
                  height: 540px !important;
                  min-height: 540px !important;
                  max-height: 540px !important;
                }
              }
              @media (max-width: 767px) {
                .superior-garden-image {
                  width: 100% !important;
                  min-width: 0 !important;
                  max-width: 100% !important;
                  height: 250px !important;
                  min-height: 250px !important;
                  max-height: 250px !important;
                }
              }
            `}
          </style>
          <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-4 md:p-6">
            <span className="text-white text-lg md:text-2xl font-serif mb-2 drop-shadow">
              {rooms[0].name}
            </span>
            <a
              href={rooms[0].link}
              className="text-white text-sm"
              style={{ textDecoration: "none" }}
            >
              Explore Room &rarr;
            </a>
          </div>
        </div>
        {/* Row 2: Deluxe and Superior */}
        <div className="flex flex-col md:flex-row md:justify-center gap-4 md:gap-6 w-full">
          {/* Deluxe */}
          <div
            className="relative rounded-xl overflow-hidden shadow room-deluxe-image"
            style={{
              width: "100%",
              minWidth: "0",
              maxWidth: "100%",
              height: "250px",
              minHeight: "250px",
              maxHeight: "250px",
            }}
          >
            <Image
              src={rooms[1].image}
              alt={rooms[1].name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 767px) 100vw, (min-width: 768px) 643px"
              style={{
                objectFit: "cover",
              }}
            />
            <style>
              {`
                @media (min-width: 768px) {
                  .room-deluxe-image {
                    width: 643px !important;
                    min-width: 643px !important;
                    max-width: 643px !important;
                    height: 400px !important;
                    min-height: 400px !important;
                    max-height: 400px !important;
                  }
                }
                @media (max-width: 767px) {
                  .room-deluxe-image {
                    width: 100% !important;
                    min-width: 0 !important;
                    max-width: 100% !important;
                    height: 250px !important;
                    min-height: 250px !important;
                    max-height: 250px !important;
                  }
                }
              `}
            </style>
            <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-4 md:p-6">
              <span className="text-white text-base md:text-xl font-serif mb-2 drop-shadow">
                {rooms[1].name}
              </span>
              <a
                href={rooms[1].link}
                className="text-white text-xs"
                style={{ textDecoration: "none" }}
              >
                Explore Room &rarr;
              </a>
            </div>
          </div>
          {/* Superior */}
          <div
            className="relative rounded-xl overflow-hidden shadow room-superior-image"
            style={{
              width: "100%",
              minWidth: "0",
              maxWidth: "100%",
              height: "250px",
              minHeight: "250px",
              maxHeight: "250px",
            }}
          >
            <Image
              src={rooms[2].image}
              alt={rooms[2].name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 767px) 100vw, (min-width: 768px) 453px"
              style={{
                objectFit: "cover",
              }}
            />
            <style>
              {`
                @media (min-width: 768px) {
                  .room-superior-image {
                    width: 453px !important;
                    min-width: 453px !important;
                    max-width: 453px !important;
                    height: 400px !important;
                    min-height: 400px !important;
                    max-height: 400px !important;
                  }
                }
                @media (max-width: 767px) {
                  .room-superior-image {
                    width: 100% !important;
                    min-width: 0 !important;
                    max-width: 100% !important;
                    height: 250px !important;
                    min-height: 250px !important;
                    max-height: 250px !important;
                  }
                }
              `}
            </style>
            <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-4 md:p-6">
              <span className="text-white text-base md:text-xl font-serif mb-2 drop-shadow">
                {rooms[2].name}
              </span>
              <a
                href={rooms[2].link}
                className="text-white text-xs"
                style={{ textDecoration: "none" }}
              >
                Explore Room &rarr;
              </a>
            </div>
          </div>
        </div>
        {/* Row 3: Premier Sea View (left tall) and right column with Supreme + Suite */}
        <div className="flex flex-col md:flex-row md:justify-center gap-4 md:gap-6 w-full">
          {/* Left: Premier Sea View (tall) */}
          <div
            className="relative rounded-xl overflow-hidden shadow room-premiersea-image"
            style={{
              width: "100%",
              minWidth: "0",
              maxWidth: "100%",
              height: "250px",
              minHeight: "250px",
              maxHeight: "250px",
            }}
          >
            <Image
              src={rooms[3].image}
              alt={rooms[3].name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 767px) 100vw, (min-width: 768px) 453px"
              style={{
                objectFit: "cover",
              }}
            />
            <style>
              {`
                @media (min-width: 768px) {
                  .room-premiersea-image {
                    width: 453px !important;
                    min-width: 453px !important;
                    max-width: 453px !important;
                    height: 700px !important;
                    min-height: 700px !important;
                    max-height: 700px !important;
                  }
                }
                @media (max-width: 767px) {
                  .room-premiersea-image {
                    width: 100% !important;
                    min-width: 0 !important;
                    max-width: 100% !important;
                    height: 250px !important;
                    min-height: 250px !important;
                    max-height: 250px !important;
                  }
                }
              `}
            </style>
            <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-4 md:p-6">
              <span className="text-white text-base md:text-xl font-serif mb-2 drop-shadow">
                {rooms[3].name}
              </span>
              <a
                href={rooms[3].link}
                className="text-white text-xs"
                style={{ textDecoration: "none" }}
              >
                Explore Room &rarr;
              </a>
            </div>
          </div>
          {/* Right column: Supreme + Suite stacked */}
          <div className="flex flex-col gap-4 md:gap-6 room-right-column"
            style={{
              width: "100%",
              minWidth: "0",
              maxWidth: "100%",
            }}
          >
            <style>
              {`
                @media (min-width: 768px) {
                  .room-right-column {
                    width: 643px !important;
                    min-width: 643px !important;
                    max-width: 643px !important;
                  }
                }
              `}
            </style>
            {/* Supreme */}
            <div
              className="relative rounded-xl overflow-hidden shadow room-supreme-image"
              style={{
                width: "100%",
                minWidth: "0",
                maxWidth: "100%",
                height: "250px",
                minHeight: "250px",
                maxHeight: "250px",
              }}
            >
              <Image
                src={rooms[4].image}
                alt={rooms[4].name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 767px) 100vw, (min-width: 768px) 643px"
                style={{
                  objectFit: "cover",
                }}
              />
              <style>
                {`
                  @media (min-width: 768px) {
                    .room-supreme-image {
                      width: 643px !important;
                      min-width: 643px !important;
                      max-width: 643px !important;
                      height: 338px !important;
                      min-height: 338px !important;
                      max-height: 338px !important;
                    }
                  }
                  @media (max-width: 767px) {
                    .room-supreme-image {
                      width: 100% !important;
                      min-width: 0 !important;
                      max-width: 100% !important;
                      height: 250px !important;
                      min-height: 250px !important;
                      max-height: 250px !important;
                    }
                  }
                `}
              </style>
              <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-4 md:p-6">
                <span className="text-white text-base md:text-xl font-serif mb-2 drop-shadow">
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
            {/* Suite */}
            <div
              className="relative rounded-xl overflow-hidden shadow room-suite-image"
              style={{
                width: "100%",
                minWidth: "0",
                maxWidth: "100%",
                height: "250px",
                minHeight: "250px",
                maxHeight: "250px",
              }}
            >
              <Image
                src={rooms[5].image}
                alt={rooms[5].name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 767px) 100vw, (min-width: 768px) 643px"
                style={{
                  objectFit: "cover",
                }}
              />
              <style>
                {`
                  @media (min-width: 768px) {
                    .room-suite-image {
                      width: 643px !important;
                      min-width: 643px !important;
                      max-width: 643px !important;
                      height: 338px !important;
                      min-height: 338px !important;
                      max-height: 338px !important;
                    }
                  }
                  @media (max-width: 767px) {
                    .room-suite-image {
                      width: 100% !important;
                      min-width: 0 !important;
                      max-width: 100% !important;
                      height: 250px !important;
                      min-height: 250px !important;
                      max-height: 250px !important;
                    }
                  }
                `}
              </style>
              <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-4 md:p-6">
                <span className="text-white text-base md:text-xl font-serif mb-2 drop-shadow">
                  {rooms[5].name}
                </span>
                <a
                  href={rooms[5].link}
                  className="text-white text-xs"
                  style={{ textDecoration: "none" }}
                >
                  Explore Room &rarr;
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Roomwrapper;
