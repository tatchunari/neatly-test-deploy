import Layout from "@/components/admin/Layout";
import { ReorderableItem } from "@/components/admin/ReorderableItem";
import { Reorder } from "motion/react";
import { AmenityItem } from "@/components/admin/ReorderableItem";

import { useRouter } from "next/router";
import { useState, useRef } from "react";

export default function create() {
  const [hasPromotion, setHasPromotion] = useState(false);
  
  const router = useRouter();

  const [amenities, setAmenities] = useState<AmenityItem[]>([
    { id: crypto.randomUUID(), value: "" },
  ]);

  const handleEditAmenity = (id: string, value: string) => {
    setAmenities((prev) =>
      prev.map((item) => (item.id === id ? { ...item, value } : item))
    );
  };

  const handleAddAmenity = () => {
    setAmenities((prev) => [...prev, { id: crypto.randomUUID(), value: "" }]);
  };

  const handleDeleteAmenity = (id: string) => {
    if (amenities.length > 1) {
      setAmenities((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // Set state for each field
  const [roomType, setRoomType] = useState("");
  const [roomSize, setRoomSize] = useState("");
  const [bedType, setBedType] = useState("Single bed");
  const [guests, setGuests] = useState("");
  const [pricePerNight, setPricePerNight] = useState("");
  const [promotionPrice, setPromotionPrice] = useState("");
  const [description, setDescription] = useState("");

  // State for Single Main Img
  const [mainImgName, setMainImgName] = useState<string | null>(null);
  const [mainImg, setMainImg] = useState<File | null>(null);
  const [mainImgUrl, setMainImgUrl] = useState<string | null>(null);

  // State for Multiple Gallery Image
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [galleryFileNames, setGalleryFileNames] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  // Handle Single Img file input
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setMainImg(file);
  setMainImgName(file.name);

  // Automatically upload the image
  const formData = new FormData();
  formData.append("mainImage", file);

  try {
    const res = await fetch("/api/upload-room-image", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    if (res.ok && data.success) {
      console.log("Uploaded image URL:", data.url);
      setMainImgUrl(data.url); // store URL in state for later use in form submission
    } else {
      throw new Error(data.error || data.message || "Upload failed");
    }
  } catch (err: any) {
    alert(`Image upload error: ${err.message}`);
    removeFile(); // optional: clear file if upload failed
  }
};

  const removeFile = () => {
    setMainImgName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // ✅ reset the input
    }
    setMainImg(null);
  };

  // Handle Multiple Image
  const handleGalleryFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Start handle change:", galleryFiles)
  const files = e.target.files;
  if (!files) return;

  const newFiles = Array.from(files);
  setGalleryFiles((prev) => [...prev, ...newFiles]);
  setGalleryFileNames((prev) => [...prev, ...newFiles.map(f => f.name)]);

  console.log(`Upload file with newFiles:`, newFiles);


  // Automatically upload each image
  for (const file of newFiles) {
    const formData = new FormData();
    formData.append("galleryImages", file);
    console.log("galleryImages:", file)
    console.log(formData)

    try {
      const res = await fetch("/api/upload-multiple-images", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        console.log("Uploaded image URLs:", data);
        setGalleryUrls((prev) => [...prev, data.url]);
      } else {
        throw new Error(data.error || data.message || "Upload failed");
      }
    } catch (err: any) {
      alert(`Image upload error: ${err.message}`);
      }
    }
    console.log("End handle change:", galleryFiles)
  };

const removeGalleryFile = (index: number) => {
  setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
  setGalleryUrls((prev) => prev.filter((_, i) => i !== index));
  setGalleryFileNames((prev) => prev.filter((_, i) => i !== index));
};

  // Submit handler
  const handleSubmit = async () => {
  // Basic validation
  if (!roomType || !roomSize || !bedType || !guests || !pricePerNight || !description) {
    alert("Please fill in all required fields.");
    setIsLoading(false);
    return;
  }

  if (!mainImgUrl) {
    alert("Please upload a main image first.");
    return;
  }

  const payload = {
    room_type: roomType,
    room_size: Number(roomSize),
    bed_type: bedType,
    guests: Number(guests),
    price: Number(pricePerNight),
    promotion_price: hasPromotion ? Number(promotionPrice) : null,
    description,
    amenities: amenities.map((a) => a.value).filter((v) => v.trim() !== ""), 
    main_image_url: [mainImgUrl], // use the uploaded image URL here
    gallery_images: galleryUrls,
  };

  try {
    const response = await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      alert("Room created successfully!");
      router.push("/admin/room-types");
    } else {
      throw new Error(data.error || data.message || "Failed to create room");
    }
  } catch (err: any) {
    alert(`Error: ${err.message}`);
  } finally {
    setIsLoading(false);
  }
};

// console.log("Gallery URLs:",galleryUrls);


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
              className="text-white font-medium w-30 cursor-pointer bg-orange-600 rounded-sm"
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading && (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
              )}
               {isLoading ? "Creating..." : "Create Room"}
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
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
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
                    value={roomSize}
                    onChange={(e) => setRoomSize(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter room size"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bed type <span className="text-red-500">*</span>
                  </label>
                  <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={bedType}
                  onChange={(e) => setBedType(e.target.value)}
                  >
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
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
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
                    value={pricePerNight}
                    onChange={(e) => setPricePerNight(e.target.value)}
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
                        value={promotionPrice}
                        onChange={(e) => setPromotionPrice(e.target.value)}
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
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
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
                  <div className="relative w-60 h-60">
                    {/* Uploaded file preview (on top if exists) */}
                    {mainImgName && (
                      <div className="absolute inset-0 z-10 border border-gray-300 rounded-md flex items-center justify-center bg-white shadow">
                        {mainImgUrl && mainImgUrl.trim() !== "" && (
                          <img src={mainImgUrl} alt="uploaded image" />
                        )}
                        <button
                          onClick={removeFile}
                          className="absolute top-2 right-3 text-red-500 font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    )}

                    {/* File input box */}
                    <label className={`w-60 h-60 border-gray-300 rounded-md flex flex-col items-center justify-center bg-[#F1F2F6] hover:bg-gray-100 cursor-pointer transition-colors ${mainImgName ? "opacity-50" : ""}`}>
                      <p className="text-2xl text-orange-500">+</p>
                      <p className="text-sm text-orange-500">Upload Image</p>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                      />
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
                  {/* Grid of uploaded images */}
                  <div className="grid grid-cols-5 gap-x-25">
                    {galleryUrls.map((url, index) => (
                      <div
                        key={index}
                        className="w-42 h-42 rounded-md flex items-center justify-center relative bg-[#F1F2F6]"
                      >
                        {/* Remove button */}
                        <div
                          className="absolute rounded-full text-orange-600 font-bold top-1 right-1 px-1 cursor-pointer"
                          onClick={() => removeGalleryFile(index)}
                        >
                          ✕
                        </div>
                        <img src={url} alt="hotel-images"/>
                        {/* File name */}
                      </div>
                    ))}
                  </div>

                  {/* File input */}
                  <label className="w-42 h-42 rounded-md flex flex-col items-center justify-center bg-[#F1F2F6] hover:bg-gray-100 cursor-pointer transition-colors">
                    <p className="text-2xl text-orange-500">+</p>
                    <p className="text-xs text-orange-500">Upload Photo</p>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleGalleryFilesChange}
                    />
                  </label>
                </div>
                </div>
              </div>
              <div className="space-y-6 mt-5">
                <h2 className="text-lg font-medium text-gray-700 border-t pt-5 border-gray-200 pb-2">
                  Room Amenities
                </h2>

                {/* Amenity */}
                <div className="bg-white">
                  <Reorder.Group
                    axis="y"
                    values={amenities}
                    onReorder={setAmenities}
                    className="space-y-2"
                  >
                    {amenities.map((amenity) => (
                      <ReorderableItem
                        key={amenity.id} // Use unique ID as key
                        item={amenity}
                        onChange={handleEditAmenity}
                        onDelete={handleDeleteAmenity}
                        disableDelete={amenities.length === 1}
                        label="Amenity"
                      />
                    ))}
                  </Reorder.Group>
                </div>

                {/* Add Amenity Button */}
                <button
                  type="button"
                  onClick={handleAddAmenity}
                  className="mt-3 flex items-center gap-2 px-4 py-2 
                   text-orange-600 border border-orange-600 rounded-md 
                   hover:bg-orange-50 transition-colors"
                >
                  + Add Amenity
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}