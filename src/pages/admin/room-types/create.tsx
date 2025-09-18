import Layout from "@/components/admin/Layout";

import { useRouter } from "next/router";
import { useState } from "react";

export default function create() {
  const [hasPromotion, setHasPromotion] = useState(false);
  const router = useRouter();

  return (
    <Layout>
      <div className="flex-1">
        {/* Header */}
        <div className="flex flex-row justify-between border-b border-gray-400 pb-5 mt-10 mx-10">
          <p className="text-xl font-semibold">Create New Room</p>
          <div className="flex justify-end gap-2 h-[46px] rounded-md overflow-hidden max-w-md w-full">
            <button
              className="text-orange-500 border px-8 border-orange-500 rounded-sm font-medium"
              onClick={() => router.push("/admin/room-types")}
            >
              Cancel
            </button>
            <button
              className="text-white font-medium w-30 bg-orange-600 rounded-sm"
              type="button"
            >
              Create Room
            </button>
          </div>
        </div>

        {/* Create Form */}
        <div className="max-w-2xl mx-auto p-6 bg-white">
          <div className="space-y-8 flex justify-center items-center flex-col">
            {/* Basic Information Section */}
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-700 border-b border-gray-200 pb-2">
                Basic Information
              </h2>

              {/* Room Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Type <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-200 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter room type"
                />
              </div>

              {/* Room Size and Bed Type - Side by Side */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room size(sqm) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter room size"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bed type <span className="text-red-500">*</span>
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="Single bed">Single bed</option>
                    <option value="Double bed">Double bed</option>
                    <option value="Queen bed">Queen bed</option>
                    <option value="King bed">King bed</option>
                    <option value="Twin beds">Twin beds</option>
                  </select>
                </div>
              </div>

              {/* Guest Count */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Guest(s) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  max="10"
                />
              </div>

              {/* Price and Promotion Price - Side by Side */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price per Night (THB){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter price"
                    step="0.01"
                  />
                </div>

                <div>
                  {/* Promotion Price */}
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Promotion Price
                  </label>
                  <div className="flex flex-row gap-5">
                    <div className="flex items-center space-x-3">
                      {/* ✅ Checkbox to enable/disable promotion price */}
                      <input
                        type="checkbox"
                        checked={hasPromotion}
                        onChange={(e) => setHasPromotion(e.target.checked)}
                      />
                      <span className="text-sm text-gray-600">
                        Promotion price
                      </span>
                    </div>

                    <div className="relative mt-2">
                      <input
                        type="number"
                        disabled={!hasPromotion} // 🔑 disables until checked
                        className={`w-60 px-3 py-2 border border-gray-300 rounded-md focus:outline-none pr-20 ${
                          hasPromotion
                            ? "focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            : "bg-gray-100 cursor-not-allowed"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Room Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    className="w-200 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Enter room description"
                  />
                </div>
              </div>

              {/* Room Image Section */}
              <div className="space-y-6">
                <h2 className="text-lg font-medium text-gray-700 border-b border-gray-200 pb-2">
                  Room Image
                </h2>

                {/* Main Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Main Image <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    <label className="w-60 h-60 border-gray-300 rounded-md flex flex-col items-center justify-center bg-[#F1F2F6] hover:bg-gray-100 cursor-pointer transition-colors">
                      <p className="text-2xl text-orange-500">+</p>
                      <p className="text-sm text-orange-500">Upload Image</p>
                      <input type="file" accept="image/*" className="hidden" />
                    </label>
                  </div>
                </div>

                {/* Image Gallery */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image Gallery(At least 4 pictures){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    <label className="w-42 h-42 rounded-md flex flex-col items-center justify-center bg-[#F1F2F6] hover:bg-gray-100 cursor-pointer transition-colors">
                      <p className="text-2xl text-orange-500">+</p>
                      <p className="text-xs text-orange-500">Upload Photo</p>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
              <div className="space-y-6 mt-5">
                <h2 className="text-lg font-medium text-gray-700 border-b border-gray-200 pb-2">
                  Room Amenities
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amenity <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-3 mb-4">
                    <img src="/assets/drag-icon.png" alt="drag-icon" className="w-4" />
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter amenity"
                    />
                    {/* Delete Amenity Button */}
                    <button className="text-gray-600">Delete</button>
                  </div>

                  <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 text-orange-600 border border-orange-600 rounded-md hover:bg-orange-50 transition-colors disabled:opacity-50"
                  >
                    + Add Amenity
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
