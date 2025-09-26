import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import Otherroompage from "@/components/customer/room-section/Otherroom"
type RoomDetail = {
  id: string | number
  name?: string
  room_type?: string
  price?: number
  promotion_price?: number
  guests?: number
  room_size?: number
  description?: string
  amenities?: string[] | string
  bed_type?: string
  main_image_url?: string
  image?: string
  gallery_images?: string[]
}

function Roomdetailpage() {
  const router = useRouter()
  const { id } = router.query
  const [room, setRoom] = useState<RoomDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!router.isReady || !id) return
    const fetchDetail = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/rooms/${id}`)
        if (!res.ok) throw new Error("Failed to fetch room detail")
        const data = await res.json()
        // API returns { success, data }
        const r = data?.data ?? null
        // normalize name and image for rendering
        if (r) {
          setRoom({
            ...r,
            name: r.name || r.room_type,
            image: r.image || r.main_image_url,
            gallery_images: Array.isArray(r.gallery_images)
              ? r.gallery_images
              : typeof r.gallery_images === "string" && r.gallery_images
              ? r.gallery_images.split(",").map((s: string) => s.trim()).filter(Boolean)
              : [],
          })
        } else {
          setRoom(null)
        }
      } catch (e: any) {
        setError(e?.message || "Error fetching room detail")
      } finally {
        setLoading(false)
      }
    }
    fetchDetail()
  }, [router.isReady, id])

  // derive amenities list (string or array → array)
  const amenities: string[] = (() => {
    if (!room?.amenities) return []
    if (Array.isArray(room.amenities)) return room.amenities
    return room.amenities.split(",").map((s) => s.trim()).filter(Boolean)
  })()

  return (
    <div className="bg-[#F7F7FA] min-h-screen">
      <Navbar />
      <div className="max-w-[1100px] mx-auto px-4 py-10">
        {loading ? (
          <div className="text-center text-gray-500 py-20">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-20">{error}</div>
        ) : !room ? (
          <div className="text-center text-gray-500 py-20">Room not found</div>
        ) : (
          <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
            {/* Image gallery layout: left thumbnail, big center image, right thumbnail */}
            <div className="w-full grid grid-cols-6 gap-2 p-2 md:p-4 bg-white">
              <div className="relative col-span-1 h-[110px] md:h-[180px] rounded-md overflow-hidden bg-gray-100">
                {room.gallery_images && room.gallery_images[0] ? (
                  <Image src={room.gallery_images[0]} alt="thumb-left" fill sizes="200px" style={{ objectFit: "cover" }} />
                ) : null}
              </div>
              <div className="relative col-span-4 h-[220px] md:h-[380px] rounded-md overflow-hidden bg-gray-100">
                {room.image ? (
                  <Image src={room.image} alt={room.name || "Room"} fill sizes="900px" style={{ objectFit: "cover" }} />
                ) : null}
              </div>
              <div className="relative col-span-1 h-[110px] md:h-[180px] rounded-md overflow-hidden bg-gray-100">
                {room.gallery_images && room.gallery_images[1] ? (
                  <Image src={room.gallery_images[1]} alt="thumb-right" fill sizes="200px" style={{ objectFit: "cover" }} />
                ) : null}
              </div>
            </div>

            <div className="px-6 md:px-12 pb-10">
              {/* Title and Price Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="md:col-span-2">
                  <h1 className="font-serif text-[#2F3E35] text-[28px] md:text-[40px] leading-tight mb-3">
                    {room.name}
                  </h1>
                  {room.description ? (
                    <p className="text-[#4B5755] text-sm md:text-[13px] leading-6 max-w-[580px]">
                      {room.description}
                    </p>
                  ) : null}
                  <div className="flex items-center gap-4 text-xs text-gray-600 mt-5">
                    {room.guests ? <span>{room.guests} Person</span> : null}
                    {room.bed_type ? (
                      <>
                        <span className="w-[1px] h-3 bg-gray-300" />
                        <span>{room.bed_type}</span>
                      </>
                    ) : null}
                    {room.room_size ? (
                      <>
                        <span className="w-[1px] h-3 bg-gray-300" />
                        <span>{room.room_size} sqm</span>
                      </>
                    ) : null}
                  </div>
                </div>
                <div className="md:col-span-1 flex md:justify-end">
                  <div className="flex flex-col items-start md:items-end">
                    {room.promotion_price ? (
                      <>
                        <span className="text-[11px] text-gray-400 line-through mb-1">THB {room.price?.toLocaleString()}</span>
                        <span className="text-[#2F3E35] text-sm">THB <span className="text-base md:text-lg font-semibold">{room.promotion_price.toLocaleString()}</span></span>
                      </>
                    ) : (
                      <span className="text-[#2F3E35] text-sm">THB <span className="text-base md:text-lg font-semibold">{room.price?.toLocaleString()}</span></span>
                    )}
                    <button className="mt-3 bg-[#F47A1F] text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-[#d96a1a] transition">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              {amenities.length > 0 ? (
                <div className="mt-10">
                  <h3 className="text-[#2F3E35] font-semibold text-sm mb-4">Room Amenities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[13px] text-[#4B5755]">
                    <ul className="list-disc pl-5 space-y-1">
                      {amenities.filter((_, i) => i % 2 === 0).map((a) => (
                        <li key={a}>{a}</li>
                      ))}
                    </ul>
                    <ul className="list-disc pl-5 space-y-1">
                      {amenities.filter((_, i) => i % 2 === 1).map((a) => (
                        <li key={a}>{a}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
      <Otherroompage />
      <Footer />
    </div>
  )
}

export default Roomdetailpage
