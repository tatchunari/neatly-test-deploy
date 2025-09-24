import Layout from "@/components/admin/Layout";
import { ReorderableItem } from "@/components/admin/ReorderableItem";
import { Reorder } from "motion/react";
import { AmenityItem } from "@/components/admin/ReorderableItem";
import { ArrowLeft } from 'lucide-react';

import { useRouter } from "next/router";
import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import LoadingScreen from "@/components/admin/LoadingScreen";
import { useQuery } from "@/hooks/useQuery";

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

interface RoomMainImageProps {
  name: string;
  value?: string;
}

const RoomMainImage = ({ name, value } : RoomMainImageProps) => {
  const [mainImgName, setMainImgName] = useState<string | null>(null);
  const [mainImg, setMainImg] = useState<File | null>(null);
  const [mainImgUrl, setMainImgUrl] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { register, setValue } = useForm();

  console.log(`RoomMainImage.mainImgUrl: `, mainImgUrl);

  const removeFile = () => {
    setMainImgName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; 
    setMainImg(null);
    setMainImgUrl(null);
    setValue(name, null);
  };
}


    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setMainImg(file);
  setMainImgName(file.name);

  // Automatically upload the image
  const formData = new FormData();
  formData.append("mainImage", file);
  
  // console.log("FormData:", file)

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
  }
};

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Main Image <span className="text-red-500">*</span>
      </label>

          <div>
          <input type="hidden" value={mainImgUrl || ""} {...register(name)}  />
          </div>
      <div className="relative w-60 h-60">
        {/* Uploaded file preview (on top if exists) */}
        {mainImgUrl && (
          <div className="absolute inset-0 z-10 border border-gray-300 rounded-md flex items-center justify-center bg-white shadow">
            {mainImgUrl && mainImgUrl.trim() !== "" && (
              <img src={mainImgUrl} alt="uploaded image" />
            )}
            <button
              type="button"
              onClick={removeFile}
              className="absolute top-2 right-3 text-red-500 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* File input box */}
        <label className='w-60 h-60 border-gray-300 rounded-md flex flex-col items-center justify-center bg-[#F1F2F6] hover:bg-gray-100 cursor-pointer transition-colors'>
          <p className="text-2xl text-orange-500">+</p>
          <p className="text-sm text-orange-500">Upload Image</p>
          <input 
            type="file" 
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
        </label>

      </div>

    </div>
  );
}

interface RoomGalleryImagesProps {
  name: string;
  value: string[];
}

const RoomGalleryImages = ({ name, value } : RoomGalleryImagesProps) => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(value?.map((url, idx) => {
    return { id: idx.toString(), url: url } as GalleryItem
  }) || []);
  const { register } = useForm();
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [galleryFileNames, setGalleryFileNames] = useState<string[]>([]);

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

};

  return (
            <>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image Gallery(At least 4 pictures){" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                {/* Grid of uploaded images */}
                <Reorder.Group
                  axis="x" 
                  values={galleryItems}
                  onReorder={setGalleryItems} 
                  className="flex gap-4 overflow-x-auto py-2"
                >
                
                  {galleryItems.map((item, index) => (
                    <Reorder.Item
                      key={item.id} 
                      value={item}
                      className="w-42 h-42 rounded-md flex items-center justify-center relative bg-[#F1F2F6] cursor-grab"
                    >
                      {/* Remove button */}
                      <div
                        className="absolute rounded-full text-orange-600 font-bold top-1 right-1 px-1 cursor-pointer z-10"
                        onClick={() => setGalleryItems((prev) => prev.filter((_, i) => i !== index))}
                      >
                        ✕
                      </div>
                      <img src={item.url} alt="hotel-images" className="object-contain w-full h-full rounded-md" />
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
                


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
            <div>
              {/* For debugging */}
              {value?.map((url, index) => {
                  return <input key={index} type="hidden" value={url} {...register(name)} />
              })}
            
            </div>
            </>
  );
}
type GalleryItem = { id: string; url: string };

interface AmenitiesItem { name: string; value?: string[] }

type AmenitiesItemsProps = {
  name: string;
  value?: string[]; // ✅ initial values from form
};

const AmenitiesItems = ({ name, value }: AmenitiesItemsProps) => {
  const [amenities, setAmenities] = useState<AmenityItem[]>(
    value?.map((val) => ({
      id: crypto.randomUUID(),
      value: val,
    })) || [{ id: crypto.randomUUID(), value: "" }]
  );

  const { register } = useForm(); 

  const handleEditAmenity = (id: string, newValue: string) => {
    setAmenities((prev) =>
      prev.map((item) => (item.id === id ? { ...item, value: newValue } : item))
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

  return (
    <>
      <div className="bg-white">
        <Reorder.Group
          axis="y"
          values={amenities}
          onReorder={setAmenities}
          className="space-y-2"
        >
          {amenities.map((amenity, index) => (
            <ReorderableItem
              key={amenity.id}
              item={amenity}
              onChange={handleEditAmenity}
              onDelete={handleDeleteAmenity}
              disableDelete={amenities.length === 1}
              label={`Amenity ${index + 1}`}
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

      {/* Hidden inputs so values go into the form */}
      <div>
        {amenities.map((item, index) => (
          <input
            key={item.id}
            type="hidden"
            value={item.value}
            {...register(`${name}.${index}`)}
          />
        ))}
      </div>
    </>
  );
};

function EditRoomForm({ room }) {

  const router = useRouter();
  const roomId = router.query.id;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Gallery Image State
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [galleryFileNames, setGalleryFileNames] = useState<string[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);

  const [hasPromotion, setHasPromotion] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);


  const { register, handleSubmit } = useForm({
    defaultValues: {
      roomType: room.room_type,
      roomSize: room.room_size,
      bedType: room.bed_type,
      guests: room.guests,
      pricePerNight: room.price,
      promotionPrice: room.promotion_price || null,
      description: room.description,
      mainImgUrl: room.main_image_url[0],

    }
  });

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
    alert('on Submit!!');
    const {roomType, roomSize, bedType, guests, mainImgUrl, pricePerNight, description, promotionPrice } = hookFormData;
    if (!roomType || !roomSize || !bedType || !guests || !pricePerNight || !description || !mainImgUrl || !galleryUrls || !amenities) {
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
    amenities: amenities.map((a) => a.value).filter((v) => v.trim() !== ""), 
    main_image_url: [mainImgUrl],
    gallery_images: galleryUrls,
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
                <AmenitiesItems name="amenities" value={room?.amenities} />
              </div>
            </div>
          </div>
        </div>
      </form>
    </Layout>
  );
}