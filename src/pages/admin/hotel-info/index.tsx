import Layout from "@/components/admin/Layout";
import { useState, useEffect } from "react";
import { useHotelInfo } from "@/context/HotelInfoContext";

export default function HotelInfoPage() {
  const { hotelInfo, loading, error, updateHotelInfo } = useHotelInfo();
  const [hotelName, setHotelName] = useState("");
  const [hotelDescription, setHotelDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");

  // อัปเดต state เมื่อ hotelInfo เปลี่ยน
  useEffect(() => {
    setHotelName(hotelInfo.name);
    setHotelDescription(hotelInfo.description);
    setLogoUrl(hotelInfo.logoUrl);
  }, [hotelInfo]);

  // ฟังก์ชันจัดการการอัปเดต
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateMessage("");

    const success = await updateHotelInfo({
      name: hotelName,
      description: hotelDescription,
      logoUrl: logoUrl
    });

    if (success) {
      setUpdateMessage("Hotel information updated successfully!");
      // ลบข้อความหลังจาก 3 วินาที
      setTimeout(() => setUpdateMessage(""), 3000);
    } else {
      setUpdateMessage("Failed to update hotel information. Please try again.");
    }

    setIsUpdating(false);
  };

  return (
    <Layout>
      {/* Header */}
      <div
        className="border border-gray-200 rounded-lg bg-white px-10 py-6 mb-8 flex items-center justify-between"
        style={{ width: 1200, minHeight: 80 }}
      >
        <span className="text-xl font-semibold">Hotel Information</span>
        <button
          type="submit"
          form="hotel-info-form"
          disabled={isUpdating || loading}
          className={`${
            isUpdating || loading 
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-[#B35023] hover:bg-[#a03f18]"
          } text-white rounded px-8 py-3 text-base font-medium transition-colors`}
          style={{ width: 121, height: 48 }}
        >
          {isUpdating ? "Updating..." : "Update"}
        </button>
      </div>

      {/* Form Card */}
      <div
        className="bg-gray-100 rounded-lg px-12 py-10 ml-16"
        style={{ width: 1080, minHeight: 747 }}
      >
        <form id="hotel-info-form" className="flex flex-col gap-8 h-full" onSubmit={handleSubmit}>
          {/* Status Messages */}
          {updateMessage && (
            <div className={`p-3 rounded-md ${
              updateMessage.includes("successfully") 
                ? "bg-green-100 text-green-700 border border-green-200" 
                : "bg-red-100 text-red-700 border border-red-200"
            }`}>
              {updateMessage}
            </div>
          )}
          
          {error && (
            <div className="p-3 rounded-md bg-red-100 text-red-700 border border-red-200">
              Error: {error}
            </div>
          )}

          {/* Hotel Name */}
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-2"
              htmlFor="hotel-name"
            >
              Hotel name <span className="text-red-500">*</span>
            </label>
            <input
              id="hotel-name"
              name="hotel-name"
              type="text"
              value={hotelName}
              onChange={e => setHotelName(e.target.value)}
              className="border border-gray-300 rounded px-4 py-2 w-full text-base focus:outline-none focus:ring-2 focus:ring-[#B35023] bg-white"
              style={{ height: 40 }}
            />
          </div>

          {/* Hotel Description */}
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-2"
              htmlFor="hotel-description"
            >
              Hotel description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="hotel-description"
              name="hotel-description"
              rows={6}
              value={hotelDescription}
              onChange={e => setHotelDescription(e.target.value)}
              className="border border-gray-300 rounded px-4 py-2 w-full text-base focus:outline-none focus:ring-2 focus:ring-[#B35023] resize-none bg-white"
              style={{ minHeight: 160 }}
            />
          </div>

          {/* Hotel Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hotel logo <span className="text-red-500">*</span>
            </label>
            <div className="relative w-36 h-24">
              <img
                src={logoUrl}
                alt="Hotel Logo"
                className="w-full h-full object-contain rounded bg-white border border-gray-200"
              />
              <button
                type="button"
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow hover:bg-red-600"
                aria-label="Remove logo"
                onClick={() => setLogoUrl("")}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M3 3L9 9M9 3L3 9" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
           
          </div>
        </form>
      </div>
    </Layout>
  );
}
