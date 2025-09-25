"use client"
import Layout from "@/components/admin/Layout";
import { ArrowLeft } from "lucide-react";

import { useRouter } from "next/router";
import { useState, useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { updateRoom, deleteRoom } from "@/services/roomService";

import { RoomMainImage } from "@/components/admin/roomForm/RoomMainImage";
import { RoomGalleryImages } from "@/components/admin/roomForm/RoomGalleryImages";
import { AmenityItems } from "@/components/admin/roomForm/AmenityItems";
import { Button } from "@/components/admin/ui/Button";
import { TextInput } from "@/components/admin/ui/TextInput";
import { DropdownInput } from "@/components/admin/ui/SelectInput";
import { TextArea } from "@/components/admin/ui/TextArea";
import { ConfirmDeleteModal } from "../ui/ConfirmDeleteModal";
import { toast } from 'sonner';


export function EditRoomForm({ room }) {
  const router = useRouter();
  const roomId = router.query.id as string;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [hasPromotion, setHasPromotion] = useState(!!room.promotion_price);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);


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
    },
  });

  const { register, handleSubmit } = methods;

  // console.log("Gallery Image:", room.gallery_images);

  const onSubmit = async (formData) => {
    setIsLoading(true);
    try {
      await updateRoom(roomId, formData, hasPromotion);
      toast.success(`Room "${formData.roomType}" updated successfully!`);
      setTimeout(() => {
        router.push("/admin/room-types");
      }, 1000);
    } catch (err: any) {
      toast.error(`Failed to update room: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Delete Room
  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteRoom(roomId);
      alert("Room deleted successfully!");
      router.push("/admin/room-types");
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <Layout>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1">
          {/* Header */}
          <div className="flex flex-row justify-between border-b border-gray-400 pb-5 mt-10 mx-10">
            <div className="text-xl gap-3 font-semibold flex flex-row">
              <ArrowLeft
                className="w-5 mt-1 cursor-pointer"
                onClick={() => router.push("/admin/room-types")}
              />
              <p>{room.room_type}</p>
            </div>
            <div className="flex justify-end gap-2 h-[46px] rounded-md overflow-hidden max-w-md w-full">
              <Button
                loading={isLoading}
                text={isLoading ? "Updating..." : "Update"}
                type="submit"
                className=" text-white bg-orange-600 hover:bg-orange-700"
              />
              <Button
                loading={isLoading}
                text="Delete"
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className=" text-orange-600 border border-orange-600 hover:bg-orange-700 hover:text-white"
              />
              {/* Confirm Delete Alert */}
              <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                roomType={room?.room_type}
              />
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
                <TextInput
                  label="Room Type"
                  required
                  placeholder="Enter room type"
                  register={register("roomType")}
                />

                {/* Room Size and Bed Type - Side by Side */}
                <div className="grid grid-cols-2 gap-4">
                  <TextInput
                    label="Room size(sqm)"
                    required
                    type="number"
                    placeholder="Enter room size"
                    register={register("roomSize")}
                  />

                  <DropdownInput
                    label="Bed Type"
                    required
                    options={[
                      "Single bed",
                      "Double bed",
                      "King bed",
                      "Twin beds",
                    ]}
                    register={register("bedType")}
                    defaultValue={room?.bed_type}
                  />
                </div>

                {/* Guest Count */}
                <TextInput
                  label="Guest(s)"
                  type="number"
                  register={register("guests")}
                  className="w-60"
                />

                {/* Price and Promotion Price - Side by Side */}
                <div className="grid grid-cols-2 gap-4">
                  <TextInput
                    label="Price per Night (THB)"
                    type="number"
                    placeholder="Enter price"
                    register={register("pricePerNight")}
                    className="w-full"
                  />

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

                      <TextInput
                        type="number"
                        register={register("promotionPrice")}
                        disabled={!hasPromotion}
                        className={`w-60 ${
                          hasPromotion
                            ? "focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            : "bg-gray-100 cursor-not-allowed"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Room Description */}
                  <TextArea
                    label="Room Description"
                    required
                    placeholder="Enter room description"
                    register={register("description")}
                    className="w-180"
                  />
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