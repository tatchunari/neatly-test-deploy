import { RoomFormData } from "@/schemas/roomSchema";

export const buildRoomPayload = (
  formData: RoomFormData, // Change from RoomFormValues to RoomFormData
  hasPromotion: boolean
) => ({
  room_type: formData.roomType,
  room_size: formData.roomSize,
  bed_type: formData.bedType,
  guests: formData.guests,
  price: formData.pricePerNight,
  promotion_price:
    hasPromotion && formData.promotionPrice !== null
      ? formData.promotionPrice
      : null,
  description: formData.description,
  main_image_url: formData.mainImgUrl ? [formData.mainImgUrl] : [],
  gallery_images: formData.galleryImageUrls,
  amenities: formData.amenities ?? [],
});
