import Layout from "@/components/admin/Layout";
import { RoomListSkeleton } from "@/components/admin/RoomListSkeleton";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function index() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter rooms based on search query
  const filteredRooms = rooms.filter((room) => {
    if (!searchQuery) return true; // Show all rooms if no search query

    const query = searchQuery.toLowerCase();

    // Helper function to safely convert to string and check
    const safeStringIncludes = (value) => {
      return value && value.toString().toLowerCase().includes(query);
    };

    return (
      safeStringIncludes(room.room_type) ||
      safeStringIncludes(room.bed_type) ||
      safeStringIncludes(room.room_size) ||
      safeStringIncludes(room.price) ||
      safeStringIncludes(room.promotionPrice)
    );
  });

  // Pagination settings - USE FILTERED ROOMS
  const roomsPerPage = 6;
  const totalPages = Math.ceil(filteredRooms.length / roomsPerPage);

  // Calculate which rooms to display - USE FILTERED ROOMS
  const startIndex = (currentPage - 1) * roomsPerPage;
  const endIndex = startIndex + roomsPerPage;
  const currentRooms = filteredRooms.slice(startIndex, endIndex);

  useEffect(() => {
    fetchRooms();
  }, []);

  // fetch rooms from database
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/rooms"); // use the real API

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to fetch rooms");
      }

      const data = await response.json();

      if (data.success) {
        setRooms(data.data); // your rooms array
      } else {
        throw new Error(data.message || "Failed to fetch rooms");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch rooms data");
    } finally {
      setLoading(false);
    }
  };

  // Handle search input
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle page navigation
  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first few pages, current page area, and last pages
      if (currentPage <= 3) {
        // Show first 5 pages
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        // Show last 5 pages
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show current page and 2 pages on each side
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }

    return pages;
  };

  if (loading) {
    return (
      <Layout>
        <RoomListSkeleton/>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-red-600">{error}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1">
        {/* Header */}
        <div className="flex flex-row justify-between border-b border-gray-400 pb-5 mt-10 mx-10">
          <p className="text-xl font-semibold">Room & Property</p>
          <div className="flex flex-row gap-3">
            <div className="flex items-center border pl-3 gap-2 bg-white border-gray-500/30 h-[46px] rounded-md overflow-hidden max-w-md w-full">
              <img src="/assets/search.png" className="w-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search rooms..."
                className="w-full h-full outline-none text-gray-500 placeholder-gray-500 text-sm"
              />
            </div>
            <button className="text-white font-medium w-64 bg-orange-600 cursor-pointer rounded-sm">
              <Link href="/admin/room-types/create">+ Create Room</Link>
            </button>
          </div>
        </div>

        {/* Room Lists */}
        <div className="max-w-7xl mt-10 mx-auto p-6 bg-gray-50 min-h-screen min-w-3">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-7 gap-5 p-4 bg-gray-300 font-medium text-sm text-gray-700">
              <div>Image</div>
              <div>Room type</div>
              <div>Price</div>
              <div>Promotion Price</div>
              <div>Guest(s)</div>
              <div>Bed Type</div>
              <div>Room Size</div>
            </div>

            {/* Room Rows - Show only current page rooms */}
            {currentRooms.map((room) => (
              <div key={room.id}>
                <Link href={`/admin/room-types/${room.id}/edit`}>
              <div>
              <div
                key={room.id}
                className="grid grid-cols-7 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors items-center"
              >
                {/* Image */}
                <div className="w-28 h-16 rounded-md overflow-hidden bg-gray-200">
                  <img
                    src={room.main_image_url}
                    alt={room.room_type}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Room Type */}
                <div className="text-sm text-gray-900 font-medium">
                  {room.room_type}
                </div>

                {/* Price */}
                <div className="text-sm text-gray-900">
                  {Number(room.price).toFixed(2)}
                </div>

                {/* Promotion Price */}
                <div className="text-sm text-gray-900">
                  {Number(room.promotion_price).toFixed(2)}
                </div>

                {/* Guests */}
                <div className="text-sm text-gray-900">{room.guests}</div>

                {/* Bed Type */}
                <div className="text-sm text-gray-900">{room.bed_type}</div>

                {/* Room Size */}
                <div className="text-sm text-gray-900">
                  {room.room_size} sqm
                </div>
              </div>
              </div>
              </Link>
              </div>
            ))}

            {/* Show message if no rooms found */}
            {currentRooms.length === 0 && !loading && (
              <div className="p-8 text-center text-gray-500">
                {searchQuery
                  ? `No rooms found matching "${searchQuery}"`
                  : "No rooms found."}
              </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-center p-6 border-t border-gray-400 bg-gray-50">
              <div className="flex items-center space-x-2">
                <button
                  className="p-2 rounded-md hover:bg-gray-200 disabled:opacity-50"
                  disabled={currentPage === 1}
                  onClick={handlePreviousPage}
                >
                  <img
                    className="w-2"
                    src="/assets/arrow-left.png"
                    alt="Previous"
                  />
                </button>

                {getPageNumbers().map((page) => (
                  <button
                    key={page}
                    className={`px-3 py-1 rounded-md text-sm ${
                      page === currentPage
                        ? "bg-white text-gray-700 border border-gray-600"
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                    onClick={() => handlePageClick(page)}
                  >
                    {page}
                  </button>
                ))}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <span className="text-gray-400">...</span>
                )}

                <button
                  className="p-2 rounded-md hover:bg-gray-200 disabled:opacity-50"
                  disabled={currentPage === totalPages}
                  onClick={handleNextPage}
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
    </Layout>
  );
}
