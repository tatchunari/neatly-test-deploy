import Layout from "@/components/admin/Layout";
import { ArrowLeft } from 'lucide-react';

import { useRouter } from "next/router";
import { useState, useRef, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import LoadingScreen from "@/components/admin/LoadingScreen";
import { useQuery } from "@/hooks/useQuery";

import { RoomMainImage } from "@/components/admin/roomForm/RoomMainImage";
import { RoomGalleryImages } from "@/components/admin/roomForm/RoomGalleryImages";
import { AmenityItems } from "@/components/admin/roomForm/AmenityItems";


export default function EditRoomRoute() {
   const router = useRouter(); 
  const roomId = router.query.id;

  if (!roomId) {
    return (
      <Layout>
        <LoadingScreen/>
      </Layout>
    );
  }

  return (
    <EditRoomPage id={roomId} />
  )

}

function EditRoomPage({ id }) {
  const { data: roomResponse, error, loading } = useQuery(`/api/rooms/${id}`);
   if (loading) {
    return (
      <Layout>
        <LoadingScreen/>
      </Layout>
    );
  }

  return (
    <EditRoomForm
      room={roomResponse?.data}
     />
  )
}

function EditRoomForm({ room }) {

  const router = useRouter();
  const roomId = router.query.id;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Gallery Image State
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryFileNames, setGalleryFileNames] = useState<string[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);

  const [hasPromotion, setHasPromotion] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);


  const methods = useForm({
    defaultValues: {
      roomType: room.room_type,
      roomSize: room.room_size,
      bedType: room.bed_type,
      guests: room.guests,
      pricePerNight: room.price,
      promotionPrice: room.promotion_price || null,
      description: room.description,
      mainImgUrl: room.main_image_url[0],
      galleryImageUrls: room.gallery_images || [],
    }
  });

  const { register, handleSubmit } = methods;

// Upload Gallery Image Handler
const handleGalleryFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files) return;

  const newFiles = Array.from(files);
  const uploadedItems: GalleryItem[] = [];

  for (const file of newFiles) {
    const formData = new FormData();
    formData.append("galleryImages", file);

    try {
      const res = await fetch("/api/upload-multiple-images", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // data.url should be your uploaded image URL
        uploadedItems.push({ id: crypto.randomUUID(), url: data.url });
        setGalleryUrls((prev) => [...prev, data.url]);
      } else {
        throw new Error(data.error || data.message || "Upload failed");
      }
    } catch (err: any) {
      alert(`Image upload error: ${err.message}`);
    }
  }

  // Add successfully uploaded images to gallery state
  setGalleryItems((prev) => [...prev, ...uploadedItems]);
  setGalleryFiles((prev) => [...prev, ...newFiles]);
  setGalleryFileNames((prev) => [...prev, ...newFiles.map((f) => f.name)]);

  // Reset file input so user can re-upload same file if needed
  if (fileInputRef.current) fileInputRef.current.value = "";
};       

console.log("Gallery Image:", room.gallery_images)


  const onSubmit = async (hookFormData) => {
      console.log("Form data:", hookFormData); // 👀 check what you actually get
    const {roomType, roomSize, bedType, guests, mainImgUrl, pricePerNight, description, promotionPrice, galleryImageUrls, amenities } = hookFormData;
    if (!roomType || !roomSize || !bedType || !guests || !pricePerNight || !description || !mainImgUrl) {
    alert("Please fill in all required fields.");
    return;
  }
  setIsLoading(true);

  const payload = {
    room_type: roomType,
    room_size: Number(roomSize),
    bed_type: bedType,
    guests: Number(guests),
    price: Number(pricePerNight),
    promotion_price: hasPromotion ? Number(promotionPrice) : null,
    description,
    main_image_url: [mainImgUrl],
    gallery_images: galleryImageUrls,
    amenities: amenities || [],
  };

  console.log("Payload: ",payload);

  try {
    const response = await fetch(`/api/rooms/${roomId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    console.log("Response: ", response)

    const data = await response.json();

    console.log("Data:" , data);

    if (response.ok && data.success) {
      alert("Room updated successfully!");
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

  return (
    <Layout>
      <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex-1">
        {/* Header */}
        <div className="flex flex-row justify-between border-b border-gray-400 pb-5 mt-10 mx-10">
          
          <div className="text-xl gap-3 font-semibold flex flex-row">
             <ArrowLeft className="w-5 mt-1 cursor-pointer" onClick={() => router.push('/admin/room-types')}/> 
              <p>{room.room_type}</p>
             </div>
          <div className="flex justify-end gap-2 h-[46px] rounded-md overflow-hidden max-w-md w-full">
            <button
              className="text-white font-medium w-30 cursor-pointer bg-orange-600 rounded-sm"
              type="submit"
              disabled={isLoading}
            >
              {isLoading && (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
              )}
               {isLoading ? "Updating..." : "Update"}
            </button>
            <button
              className="text-orange-600 font-medium w-30 cursor-pointer border-1 border-orange-600 rounded-sm"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
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
                  {...register("roomType")}
                  type="text"
                  className="w-200 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                    {...register("roomSize")}
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter room size"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bed type <span className="text-red-500">*</span>
                  </label>
                  <select 
                  {...register("bedType")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="Single bed">Single bed</option>
                    <option value="Double bed">Double bed</option>
                    <option value="King bed">Double bed (King size)</option>
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
                  {...register("guests")}
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                  {...register("pricePerNight")}
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                      {...register("promotionPrice")}
                        type="number"
                        disabled={!hasPromotion} // 🔑 disables until checked
                        className={`w-60 px-3 py-2 border border-gray-300 rounded-md focus:outline-none ${
                          hasPromotion
                            ? "focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                  {...register("description")}
                  name="description"
                    rows={4}
                    className="w-200 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
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
                <RoomMainImage
                    name="mainImgUrl"
                    value={room?.main_image_url && room.main_image_url[0]}
                 />

                {/* Image Gallery */}
               <RoomGalleryImages
                  name="galleryImageUrls"
                  value={room?.gallery_images}
                />

              </div>
              <div className="space-y-6 mt-5">
                <h2 className="text-lg font-medium text-gray-700 border-t pt-5 border-gray-200 pb-2">
                  Room Amenities
                </h2>

                {/* Amenity */}
                <AmenityItems name="amenities" value={room?.amenities} />
              </div>
            </div>
          </div>
        </div>
      </form>
      </FormProvider>
    </Layout>
  );
}