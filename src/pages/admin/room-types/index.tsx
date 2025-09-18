import Layout from "@/components/admin/Layout"

import { useState, useEffect } from "react";

export default function index() {

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState("");
  
  // Pagination settings
  const roomsPerPage = 6;
  const totalPages = Math.ceil(rooms.length / roomsPerPage);
  
  // Calculate which rooms to display
  const startIndex = (currentPage - 1) * roomsPerPage;
  const endIndex = startIndex + roomsPerPage;
  const currentRooms = rooms.slice(startIndex, endIndex);

  useEffect(() => {
    fetchRooms();
  }, []);

  // fetch data from mockData
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/mock-rooms');
      const data = await response.json();
      setRooms(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch rooms data');
      setLoading(false);
    }
  };

  // Handle page navigation
  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
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
        <div className="flex items-center justify-center min-h-96">
          <div className="text-gray-600">Loading rooms...</div>
        </div>
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
        <div className="flex flex-row justify-between mt-10 mx-10">
          <p className="text-xl font-semibold">Room & Property</p>
          <div className="flex flex-row gap-3">
            <div className="flex items-center border pl-3 gap-2 bg-white border-gray-500/30 h-[46px] rounded-md overflow-hidden max-w-md w-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 30 30" fill="#6B7280">
                <path d="M13 3C7.489 3 3 7.489 3 13s4.489 10 10 10a9.95 9.95 0 0 0 6.322-2.264l5.971 5.971a1 1 0 1 0 1.414-1.414l-5.97-5.97A9.95 9.95 0 0 0 23 13c0-5.511-4.489-10-10-10m0 2c4.43 0 8 3.57 8 8s-3.57 8-8 8-8-3.57-8-8 3.57-8 8-8"/>
              </svg>
              <input type="text" placeholder="Search..." className="w-full h-full outline-none text-gray-500 placeholder-gray-500 text-sm"/>
            </div>
            <button className="text-white font-semibold w-64 bg-orange-600 rounded-sm">+ Create Room</button>
          </div>
        </div>

        {/* Room Lists */}
        <div className="max-w-7xl mt-10 mx-auto p-6 bg-gray-50 min-h-screen min-w-3">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-7 gap-4 p-4 bg-gray-300 font-medium text-sm text-gray-700">
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
              <div key={room.id} className="grid grid-cols-7 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors items-center">
                {/* Image */}
                <div className="w-20 h-16 rounded-lg overflow-hidden bg-gray-200">
                  <img 
                    src={room.imageUrl} 
                    alt={room.roomType}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Room Type */}
                <div className="text-sm text-gray-900 font-medium">{room.roomType}</div>

                {/* Price */}
                <div className="text-sm text-gray-900">{room.price}</div>

                {/* Promotion Price */}
                <div className="text-sm text-gray-900">{room.promotionPrice}</div>

                {/* Guests */}
                <div className="text-sm text-gray-900">{room.guest}</div>

                {/* Bed Type */}
                <div className="text-sm text-gray-900">{room.bedType}</div>

                {/* Room Size */}
                <div className="text-sm text-gray-900">{room.roomSize}</div>
              </div>
            ))}

            {/* Show message if no rooms on current page */}
            {currentRooms.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No rooms found for this page.
              </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-center p-6 border-t bg-gray-50">
              <div className="flex items-center space-x-2">
                <button
                  className="p-2 rounded-md hover:bg-gray-200 disabled:opacity-50"
                  disabled={currentPage === 1}
                  onClick={handlePreviousPage}
                >
                  <img className="w-2" src="/assets/arrow-left.png" alt="Previous" />
                </button>
                
                {getPageNumbers().map((page) => (
                  <button
                    key={page}
                    className={`px-3 py-1 rounded-md text-sm ${
                      page === currentPage
                        ? 'bg-white text-gray-700 border border-gray-600'
                        : 'text-gray-700 hover:bg-gray-200'
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
                  <img className="w-2" src="/assets/arrow-right.png" alt="Next" />
                </button>
              </div>
              
              {/* Page info */}
              <div className="ml-4 text-sm text-gray-600">
                Showing {startIndex + 1}-{Math.min(endIndex, rooms.length)} of {rooms.length} rooms
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}