import Navbar from "@/components/Navbar"
import SearchBox from "@/components/customer/searchbar/Searchbox"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import Image from "next/image"
import Footer from "@/components/Footer"

function SearchResultPage() {
  const router = useRouter()
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ดึงข้อมูลห้องพักจาก API
  const fetchRooms = async () => {
    try {
      setLoading(true)
      setError(null)
      // read query params for filtering
      const { checkIn, checkOut, room, guests } = router.query as { [key: string]: string }
      const searchParams = new URLSearchParams()
      if (checkIn) searchParams.set("checkIn", checkIn)
      if (checkOut) searchParams.set("checkOut", checkOut)
      if (room) searchParams.set("room", room)
      if (guests) searchParams.set("guests", guests)
      const qs = searchParams.toString()
      const response = await fetch(`/api/rooms${qs ? `?${qs}` : ""}`)
      if (!response.ok) {
        throw new Error("Failed to fetch rooms")
      }
      const data = await response.json()
      // สมมติว่า API ส่ง { data: [...] }
      const list = Array.isArray(data?.data) ? data.data : []
      setRooms(list)
    } catch (error: any) {
      setError(error?.message || "Error fetching rooms")
      setRooms([])
    } finally {
      setLoading(false)
    }
  }

  // refetch whenever query changes
  useEffect(() => {
    if (!router.isReady) return
    fetchRooms()
  }, [router.isReady, router.query])

  return (
    <div className="bg-[#F7F7FA] min-h-screen">
      <Navbar />
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="pt-6 pb-2">
          <SearchBox
            defaultValues={{
              checkIn: (router.query.checkIn as string) || undefined,
              checkOut: (router.query.checkOut as string) || undefined,
              room: (router.query.room as string) || undefined,
              guests: (router.query.guests as string) || undefined,
            }}
            onSearch={(params) => {
              const q = new URLSearchParams(params as any).toString()
              router.push(`/customer/search-result?${q}`)
            }}
          />
        </div>
        {loading ? (
          <div className="text-center py-10 text-gray-500 text-lg">Loading rooms...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-500 text-lg">{error}</div>
        ) : (
          <div className="flex flex-col gap-6 mt-4">
            {rooms.length === 0 ? (
              <div className="text-center text-gray-500 py-10">No rooms found.</div>
            ) : (
              rooms.map((room: any, index: number) => (
                <div
                  key={room.id ?? index}
                  className="flex bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
                  style={{
                    minHeight: 180,
                    maxWidth: 900,
                    margin: "0 auto",
                    width: "100%",
                  }}
                >
                  {/* Room Image */}
                  <div className="relative w-[260px] h-[170px] flex-shrink-0 m-6 mr-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                    {room.image ? (
                      <Image
                        src={room.image}
                        alt={room.name || "Room image"}
                        fill
                        style={{ objectFit: "cover" }}
                        sizes="260px"
                        className="rounded-lg"
                        priority={index < 2}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-100">
                        No Image
                      </div>
                    )}
                  </div>
                  {/* Room Info */}
                  <div className="flex flex-1 flex-col md:flex-row p-6 pl-6 gap-4">
                    <div className="flex flex-col flex-1 min-w-0">
                      <h2 className="text-base font-semibold text-[#2F3E35] mb-1">{room.name}</h2>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <span>
                          {room.guests ?? 2} {room.guests > 1 ? "Guests" : "Guest"}
                        </span>
                        <span className="mx-1">·</span>
                        <span>
                          {room.beds ?? 1} {room.beds > 1 ? "Beds" : "Bed"}
                        </span>
                        <span className="mx-1">·</span>
                        <span>
                          {room.size ? `${room.size} sqm` : "32 sqm"}
                        </span>
                        {room.view && (
                          <>
                            <span className="mx-1">·</span>
                            <span>{room.view}</span>
                          </>
                        )}
                      </div>
                      <div className="text-gray-500 text-xs mb-4 line-clamp-2">
                        {room.description || "Elegant modern decor with garden or city view. Includes balcony, bathtub, and free WiFi."}
                      </div>
                      <div className="flex gap-2 mt-auto">
                        <button className="text-[#F47A1F] border border-[#F47A1F] bg-white px-4 py-1.5 rounded-md font-medium text-xs hover:bg-[#f7e7d7] transition">
                          Room Detail
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between min-w-[160px]">
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-gray-400 line-through mb-1">
                          {room.price_before_discount ? `THB ${room.price_before_discount.toLocaleString()}` : ""}
                        </span>
                        <span className="text-xl font-bold text-[#F47A1F] mb-1">
                          {room.price ? `THB ${room.price.toLocaleString()}` : "THB 0"}
                        </span>
                        <span className="text-xs text-gray-400">Per Night</span>
                        <span className="text-xs text-gray-400">Including Taxes & Fees</span>
                      </div>
                      <button className="bg-[#F47A1F] text-white px-6 py-2 rounded-lg font-semibold text-sm mt-4 hover:bg-[#d96a1a] transition">
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default SearchResultPage