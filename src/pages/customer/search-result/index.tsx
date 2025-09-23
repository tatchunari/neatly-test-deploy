import Navbar from "@/components/Navbar"
import SearchBox from "@/components/customer/searchbar/Searchbox"
import { useEffect, useState } from "react"
import Image from "next/image"

function SearchResultPage() {
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ดึงข้อมูลห้องพักจาก API
  const fetchRooms = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/rooms")
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

  useEffect(() => {
    fetchRooms()
  }, [])

  return (
    <div className="bg-[#F7F7FA] min-h-screen">
      <Navbar />
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="pt-6 pb-2">
          <SearchBox />
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
                  className="flex bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100"
                  style={{ minHeight: 180 }}
                >
                  {/* Room Image */}
                  <div className="relative w-[220px] h-[160px] flex-shrink-0 m-6 mr-0 rounded-lg overflow-hidden bg-gray-100">
                    {room.image ? (
                      <Image
                        src={room.image}
                        alt={room.name || "Room image"}
                        fill
                        style={{ objectFit: "cover" }}
                        sizes="220px"
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
                  <div className="flex flex-col flex-1 p-6 pl-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <h2 className="text-lg font-semibold text-[#2F3E35] mb-2 md:mb-0">{room.name}</h2>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>
                          {room.guests ?? 2} Guests
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
                    </div>
                    <div className="text-gray-500 text-sm mt-2 mb-4 line-clamp-2">
                      {room.description || "Elegant modern decor with garden or city view. Includes balcony, bathtub, and free WiFi."}
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-auto">
                      <div className="flex flex-col mb-2 md:mb-0">
                        <span className="text-xs text-gray-400 line-through">
                          {room.price_before_discount ? `THB ${room.price_before_discount.toLocaleString()}` : ""}
                        </span>
                        <span className="text-xl font-bold text-[#F47A1F]">
                          {room.price ? `THB ${room.price.toLocaleString()}` : "THB 0"}
                        </span>
                      </div>
                      <div>
                        <button className="bg-[#F47A1F] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#d96a1a] transition">
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchResultPage