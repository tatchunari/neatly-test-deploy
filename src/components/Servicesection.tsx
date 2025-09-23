import Image from "next/image";

const services = [
  {
    icon: "/icons/spa.png",
    label: "Spa",
  },
  {
    icon: "/icons/sauna.png",
    label: "Sauna",
  },
  {
    icon: "/icons/fitness.png",
    label: "Fitness",
  },
  {
    icon: "/icons/lounge.png",
    label: "Arrival Lounge",
  },
  {
    icon: "/icons/wifi.png",
    label: "Free WiFi",
  },
  {
    icon: "/icons/parking.png",
    label: "Parking",
  },
  {
    icon: "/icons/24hours.png",
    label: "24 hours operation",
  },
];

const Servicesection = () => {
  return (
    <section
      id="services"
      className="
        w-full
        bg-[#4B5C51]
        flex flex-col
        items-center
        justify-center
        py-12 md:py-0
        min-h-[690px] md:min-h-[480px]
        "
      style={{
        minHeight: "480px",
        height: "480px",
        maxWidth: "1440px",
        margin: "0 auto",
      }}
    >
      {/* Title */}
      <h2
        className="
          font-serif
          text-white
          text-[32px] md:text-[48px]
          leading-[40px] md:leading-[60px]
          font-normal
          mb-12 md:mb-16
          text-center
        "
      >
        Service &amp; Facilities
      </h2>
      {/* Services Icons */}
      <div
        className="
          w-full
          flex flex-wrap
          justify-center
          gap-y-10
          gap-x-6 md:gap-x-16
          px-4 md:px-0
        "
        style={{
          maxWidth: "1100px",
        }}
      >
        {services.map((service) => (
          <div
            key={service.label}
            className="flex flex-col items-center w-1/3 md:w-auto mb-2"
            style={{ minWidth: 90, maxWidth: 140 }}
          >
            <div className="mb-3">
              <Image
                src={service.icon}
                alt={service.label}
                width={48}
                height={48}
                className="object-contain"
                priority
              />
            </div>
            <span className="text-white text-xs md:text-sm text-center font-normal">
              {service.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Servicesection;
