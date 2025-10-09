import Layout from "@/components/admin/Layout";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

// เชื่อมต่อกับ database table ชื่อ hotel_information โดยตรงผ่าน API
// (สมมติว่ามี API endpoint ที่เชื่อมกับ table นี้แล้ว เช่น /api/hotel-information)

interface HotelInformation {
  name: string;
  description: string;
  logo_url: string;
}

export default function HotelInfoPage() {
  const [hotelInfo, setHotelInfo] = useState<HotelInformation>({
    name: "",
    description: "",
    logo_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State to track if logo is removed (for upload UI)
  const [logoRemoved, setLogoRemoved] = useState(false);

  // โหลดข้อมูลจาก database table hotel_information
  useEffect(() => {
    const fetchHotelInfo = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/hotel-info");
        const data = await res.json();
        if (res.ok && data.success) {
          setHotelInfo({
            name: data.data.name,
            description: data.data.description,
            logo_url: data.data.logo_url,
          });
          setLogoRemoved(!data.data.logo_url); // ถ้าไม่มีโลโก้ ให้ขึ้นอัพโหลด
        } else {
          setError(data.message || "Failed to fetch hotel information");
        }
      } catch (err) {
        setError("Network error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchHotelInfo();
  }, []);

  // ฟังก์ชันจัดการการอัปเดตข้อมูลใน table hotel_information
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateMessage("");
    setError(null);

    try {
      const res = await fetch("/api/hotel-info", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: hotelInfo.name,
          description: hotelInfo.description,
          logo_url: logoRemoved ? "" : hotelInfo.logo_url,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUpdateMessage("Hotel information updated successfully!");
        setHotelInfo({
          name: data.data.name,
          description: data.data.description,
          logo_url: data.data.logo_url,
        });
        setLogoRemoved(!data.data.logo_url);
        setTimeout(() => setUpdateMessage(""), 3000);
      } else {
        setUpdateMessage(
          "Failed to update hotel information. Please try again."
        );
      }
    } catch (err) {
      setUpdateMessage("Failed to update hotel information. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  // ฟังก์ชันเมื่อคลิกกากบาท ให้รูปหาย แล้วขึ้นให้อัพโหลด
  const handleRemoveLogo = () => {
    setHotelInfo((prev) => ({ ...prev, logo_url: "" }));
    setLogoRemoved(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ฟังก์ชันเมื่อเลือกไฟล์ใหม่
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setHotelInfo((prev) => ({
          ...prev,
          logo_url: ev.target?.result as string,
        }));
        setLogoRemoved(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Layout>
      <main className="flex flex-1 flex-col bg-[#F6F7FC] items-center justify-center">
        {/* Header */}
        <div className="border border-gray-200 bg-white px-10 py-6 mb-8 flex items-center justify-between w-full">
          <span className="text-xl font-semibold">Hotel Information</span>
          <button
            type="submit"
            form="hotel-info-form"
            disabled={isUpdating || loading}
            className={`${
              isUpdating || loading
                ? "bg-orange-600 cursor-not-allowed"
                : "bg-orange-600 hover:bg-[#a03f18]"
            } text-white rounded px-8 py-3 text-base font-medium transition-colors`}
            style={{ width: 121, height: 48 }}
          >
            {isUpdating ? "Updating..." : "Update"}
          </button>
        </div>

        {/* Form Card */}
        <div
          className="bg-gray-100 rounded-lg max-w-[1080px] w-full flex items-center justify-center"
          style={{ minHeight: 747 }}
        >
          <form
            id="hotel-info-form"
            className="flex flex-col gap-8 h-full"
            onSubmit={handleSubmit}
          >
            {/* Status Messages */}
            {updateMessage && (
              <div
                className={`p-3 rounded-md ${
                  updateMessage.includes("successfully")
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-red-100 text-red-700 border border-red-200"
                }`}
              >
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
                value={hotelInfo.name}
                onChange={(e) =>
                  setHotelInfo((prev) => ({ ...prev, name: e.target.value }))
                }
                className="border border-gray-300 rounded px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#B35023] bg-white"
                style={{
                  width: 920,
                  height: 48,
                  minWidth: 920,
                  maxWidth: 920,
                  minHeight: 48,
                  maxHeight: 48,
                }}
                disabled={loading}
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
                value={hotelInfo.description}
                onChange={(e) =>
                  setHotelInfo((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="border border-gray-300 rounded px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#B35023] resize-none bg-white"
                style={{
                  width: 920,
                  height: 264,
                  minWidth: 920,
                  minHeight: 264,
                  maxWidth: 920,
                  maxHeight: 264,
                }}
                disabled={loading}
              />
            </div>

            {/* Hotel Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hotel logo <span className="text-red-500">*</span>
              </label>
              <div
                className="relative"
                style={{
                  width: 167,
                  height: 167,
                  minWidth: 167,
                  minHeight: 167,
                  maxWidth: 167,
                  maxHeight: 167,
                }}
              >
                {/* ถ้าไม่มีโลโก้หรือถูกลบ ให้แสดงปุ่มอัพโหลด */}
                {logoRemoved || !hotelInfo.logo_url ? (
                  <div
                    className="w-full h-full flex flex-col items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded cursor-pointer transition hover:bg-gray-200"
                    style={{
                      width: 167,
                      height: 167,
                      minWidth: 167,
                      minHeight: 167,
                      maxWidth: 167,
                      maxHeight: 167,
                    }}
                    onClick={() => !loading && fileInputRef.current?.click()}
                    tabIndex={0}
                    role="button"
                    aria-label="Upload logo"
                    onKeyDown={(e) => {
                      if ((e.key === "Enter" || e.key === " ") && !loading) {
                        fileInputRef.current?.click();
                      }
                    }}
                  >
                    <span className="text-3xl text-[#B35023] mb-1">+</span>
                    <span className="text-[#B35023] text-sm font-medium">
                      Upload photo
                    </span>
                  </div>
                ) : (
                  <>
                    <Image
                      width={80}
                      height={60}
                      src={hotelInfo.logo_url}
                      alt="Hotel Logo"
                      className="object-contain rounded bg-white border border-gray-200"
                      style={{
                        width: 167,
                        height: 167,
                        minWidth: 167,
                        minHeight: 167,
                        maxWidth: 167,
                        maxHeight: 167,
                      }}
                    />
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow hover:bg-red-600"
                      aria-label="Remove logo"
                      onClick={handleRemoveLogo}
                      disabled={loading}
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path
                          d="M3 3L9 9M9 3L3 9"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                    {/* คลิกที่รูปเพื่ออัปโหลด */}
                    <div
                      className="absolute inset-0 cursor-pointer"
                      style={{ zIndex: 10 }}
                      onClick={() => !loading && fileInputRef.current?.click()}
                      aria-label="Upload logo"
                      tabIndex={0}
                      role="button"
                      onKeyDown={(e) => {
                        if ((e.key === "Enter" || e.key === " ") && !loading) {
                          fileInputRef.current?.click();
                        }
                      }}
                    />
                  </>
                )}
                {/* ปุ่มอัปโหลดรูปใหม่ */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleLogoChange}
                  disabled={loading}
                />
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Allowed: PNG, JPG, JPEG, GIF
              </div>
            </div>
          </form>
        </div>
      </main>
    </Layout>
  );
}
