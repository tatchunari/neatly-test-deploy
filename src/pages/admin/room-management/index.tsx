import Layout from "@/components/admin/Layout"
import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
// Using internal API to read from Supabase to avoid client-side RLS/env pitfalls

type RoomRecord = {
  id: string | number
  name?: string | null
  room_type?: string | null
  bed_type?: string | null
  status?: string | null
}

const STATUSES = [
  { label: "Vacant", className: "bg-emerald-50 text-emerald-700" },
  { label: "Occupied", className: "bg-blue-100 text-blue-600" },
  { label: "Assign Clean", className: "bg-emerald-100 text-emerald-600" },
  { label: "Assign Dirty", className: "bg-red-100 text-red-600" },
  { label: "Vacant Clean", className: "bg-green-100 text-green-700" },
  { label: "Vacant Clean Inspected", className: "bg-yellow-100 text-yellow-700" },
  { label: "Vacant Clean Pick Up", className: "bg-teal-100 text-teal-600" },
  { label: "Occupied Clean", className: "bg-sky-100 text-sky-700" },
  { label: "Occupied Clean Inspected", className: "bg-yellow-100 text-yellow-700" },
  { label: "Occupied Dirty", className: "bg-rose-100 text-rose-600" },
  { label: "Out of Order", className: "bg-gray-100 text-gray-600" },
  { label: "Out of Service", className: "bg-gray-100 text-gray-600" },
  { label: "Out of Inventory", className: "bg-gray-100 text-gray-600" },
]

export default function IndexPage() {
  const [allRooms, setAllRooms] = useState<RoomRecord[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [openId, setOpenId] = useState<string | number | null>(null)
  const [statusSearch, setStatusSearch] = useState("")
  const [updatingId, setUpdatingId] = useState<string | number | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  const pageSize = 10

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/rooms")
        if (!res.ok) throw new Error("Failed to load rooms")
        const json = await res.json()
        const data: RoomRecord[] = Array.isArray(json?.data) ? json.data : []
        setAllRooms(data)
        setTotal(data.length)
      } catch (err) {
        console.error(err)
        setAllRooms([])
        setTotal(0)
      } finally {
        setLoading(false)
      }
    }
    fetchRooms()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!openId) return
      const target = e.target as Node
      if (menuRef.current && !menuRef.current.contains(target)) {
        setOpenId(null)
        setStatusSearch("")
      }
    }
    window.addEventListener("mousedown", onClick)
    return () => window.removeEventListener("mousedown", onClick)
  }, [openId])

  const filteredRooms = useMemo(() => {
    if (!search.trim()) return allRooms
    const q = search.toLowerCase()
    return allRooms.filter((r) => {
      const idText = String(r.id ?? "").toLowerCase()
      const n = String(r.name ?? "").toLowerCase()
      const rt = String(r.room_type ?? "").toLowerCase()
      const bt = String(r.bed_type ?? "").toLowerCase()
      return idText.includes(q) || n.includes(q) || rt.includes(q) || bt.includes(q)
    })
  }, [allRooms, search])
  
  const totalPages = Math.max(1, Math.ceil((filteredRooms?.length || total) / pageSize))
  
  const pagedRooms = useMemo(() => {
    const from = (page - 1) * pageSize
    const to = from + pageSize
    return filteredRooms.slice(from, to)
  }, [filteredRooms, page])

  // Generate page numbers to display (sliding window like room-types)
  const getPageNumbers = () => {
    const pages: number[] = []
    const maxVisiblePages = 5
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 5; i++) pages.push(i)
      } else if (page >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i)
      } else {
        for (let i = page - 2; i <= page + 2; i++) pages.push(i)
      }
    }
    return pages
  }

  return (
    <Layout>
      <main className="flex-1 w-full bg-[#F6F7FC]">
        <div>
          <div className="bg-white border-b border-gray-400">
            <div className="flex flex-row items-center justify-between py-5 mx-10">
              <p className="text-xl font-semibold">Room Management</p>
              <div className="flex flex-row gap-3">
                <div className="flex items-center border pl-3 gap-2 bg-white border-gray-500/30 h-[46px] rounded-md overflow-hidden max-w-md w-full">
                  <img src="/assets/search.png" className="w-4" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="w-full h-full outline-none text-gray-500 placeholder-gray-500 text-sm"
                  />
                </div>
                <button className="text-white font-medium w-64 bg-orange-600 cursor-pointer rounded-sm">
                  <Link href="/admin/room-types/create">+ Create Room</Link>
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mt-10 mx-auto p-6 bg-[#F6F7FC] min-h-screen">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
              <div className="grid grid-cols-4 gap-5 p-4 bg-white font-medium text-sm text-gray-700">
                <div>Room no.</div>
                <div>Room type</div>
                <div>Bed Type</div>
                <div>Status</div>
              </div>

              {/* Rows */}
              <div className="min-h-[600px]">
              {loading ? (
                <div className="p-6 text-center text-gray-500 border-t">Loading...</div>
              ) : filteredRooms.length === 0 ? (
                <div className="p-6 text-center text-gray-500 border-t">No rooms found</div>
              ) : (
                pagedRooms.map((room, idx) => {
                  const displayNo = String((page - 1) * pageSize + idx + 1).padStart(4, "0")
                  return (
                    <div key={room.id} className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors items-center">
                      <div className="text-sm text-gray-900 font-medium">{displayNo}</div>
                      <div className="text-sm text-gray-900">{room.room_type || room.name || "-"}</div>
                      <div className="text-sm text-gray-900">{room.bed_type || "Single Bed"}</div>
                      <div className="text-sm text-gray-900">
                        <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
                          {(() => {
                            const fallbackIndex = (idx + (page - 1) * pageSize) % STATUSES.length
                            const initialIndex = STATUSES.findIndex(s => s.label === (room.status || ""))
                            const selectedIndex = initialIndex >= 0 ? initialIndex : fallbackIndex
                            const current = STATUSES[selectedIndex]
                            return (
                              <button
                                type="button"
                                className={`inline-flex cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium ${current.className}`}
                                onClick={() => {
                                  if (openId === room.id) {
                                    setOpenId(null)
                                  } else {
                                    setOpenId(room.id)
                                    setStatusSearch("")
                                  }
                                }}
                                disabled={updatingId === room.id}
                              >
                                {updatingId === room.id ? "Updating..." : current.label}
                              </button>
                            )
                          })()}

                          {openId === room.id && (
                            <div ref={menuRef} className="absolute z-20 mt-2 w-56 rounded-lg border border-gray-300 bg-white shadow-lg">
                              <div className="p-3">
                                <input
                                  autoFocus
                                  value={statusSearch}
                                  onChange={(e) => setStatusSearch(e.target.value)}
                                  placeholder="Search status..."
                                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-400"
                                />
                              </div>
                              <div className="max-h-64 overflow-auto p-3 space-y-2">
                                {(statusSearch ? STATUSES.filter(s => s.label.toLowerCase().includes(statusSearch.toLowerCase())) : STATUSES).map((s) => (
                                  <button
                                    key={s.label}
                                    type="button"
                                    className={`block w-fit text-left ${s.className} rounded-md px-3 py-1.5 text-xs font-medium`}
                                    onClick={async () => {
                                      try {
                                        setUpdatingId(room.id)
                                        // Optimistic UI update
                                        setAllRooms(prev => prev.map(r => r.id === room.id ? { ...r, status: s.label } : r))
                                        setOpenId(null)
                                        setStatusSearch("")
                                        const res = await fetch(`/api/rooms/${room.id}`, {
                                          method: "PUT",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({ status: s.label }),
                                        })
                                        if (!res.ok) {
                                          throw new Error("Failed to update status")
                                        }
                                      } catch (e) {
                                        console.error(e)
                                        // Revert by refetching minimal data
                                        try {
                                          const res = await fetch("/api/rooms")
                                          if (res.ok) {
                                            const json = await res.json()
                                            const data: RoomRecord[] = Array.isArray(json?.data) ? json.data : []
                                            setAllRooms(data)
                                            setTotal(data.length)
                                          }
                                        } catch {}
                                      } finally {
                                        setUpdatingId(null)
                                      }
                                    }}
                                  >
                                    {s.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              </div>
              <div className="flex items-center justify-center p-6 border-t border-gray-400 bg-gray-50">
                <div className="flex items-center space-x-2">
                  <button
                    className="p-2 rounded-md hover:bg-gray-200 disabled:opacity-50"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <img
                      className="w-2"
                      src="/assets/arrow-left.png"
                      alt="Previous"
                    />
                  </button>

                  {getPageNumbers().map((p) => (
                    <button
                      key={p}
                      className={`px-3 py-1 rounded-md text-sm ${
                        p === page
                          ? "bg-white text-gray-700 border border-gray-600"
                          : "text-gray-700 hover:bg-gray-200"
                      }`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  ))}

                  {totalPages > 5 && page < totalPages - 2 && (
                    <span className="text-gray-400">...</span>
                  )}

                  <button
                    className="p-2 rounded-md hover:bg-gray-200 disabled:opacity-50"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    <img
                      className="w-2"
                      src="/assets/arrow-right.png"
                      alt="Next"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  )
}
