import Image from "next/image";

const Aboutsection = () => {
  return (
    <section
      id="about"
      className="w-full flex flex-col items-center bg-[#F7F7F8] py-10 md:py-20"
      style={{ minHeight: "824px" }}
    >
      {/* Title & Description Layout */}
      <div
        className="
          w-full
          flex flex-col md:items-start items-center
          md:pl-[120px]
          md:pr-[120px]
          md:pb-0
          pb-8
          box-border
        "
        style={{
          maxWidth: "1440px",
          margin: "0 auto",
        }}
      >
        {/* Title */}
        <h2
          className="
            font-serif
            text-[#2F3E35]
            text-[32px] md:text-[40px]
            leading-[48px] md:leading-[56px]
            font-normal
            mb-6
            text-left
            w-full
            md:w-auto
          "
          style={{
            marginTop: 0,
            marginBottom: 0,
          }}
        >
          Neatly Hotel
        </h2>
        {/* Description */}
        <div
          className="
            text-[#4B5755]
            text-[10px] md:text-[14px]
            leading-[16px] md:leading-[22px]
            font-normal
            text-left
            w-full
            md:w-[700px]
            max-w-full
            space-y-4
          "
        >
          <p>
            Set in Bangkok, Thailand, Neatly Hotel offers 5-star accommodation with an outdoor pool, kids club, sports facilities and a fitness center. There is also a spa, an indoor pool and sauna.
          </p>
          <p>
            All units at the hotel are equipped with a seating area, a flat-screen TV with satellite channels, a dining area and a private bathroom with free toiletries, a bathtub and a hairdryer. Every room in Neatly Hotel features a furnished balcony. Some rooms are equipped with a coffee machine.
          </p>
          <p>
            Free WiFi and entertainment facilities are available at property and bike rentals are provided to explore the area.
          </p>
        </div>
      </div>
      {/* Image Slider */}
      <div
        className="
          w-[343px] md:w-[1320px]
          h-[192px] md:h-[384px]
          flex
          justify-center
          items-center
          overflow-hidden
          rounded-xl
          shadow
        "
        style={{
          margin: "0 auto",
        }}
      >
        <Image
          src="/slider.png"
          alt="Neatly Hotel Slider"
          width={1320}
          height={384}
          className="object-cover w-full h-full"
          priority
        />
      </div>
    </section>
  );
};

export default Aboutsection;
