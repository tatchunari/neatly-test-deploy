import { RoomFormValues } from "@/types/rooms";


export const buildRoomPayload = (
  formData: RoomFormValues,
  hasPromotion: boolean
) => ({
  room_type: formData.roomType,
  room_size: Number(formData.roomSize),
  bed_type: formData.bedType,
  guests: Number(formData.guests),
  price: Number(formData.pricePerNight),
  promotion_price: hasPromotion ? Number(formData.promotionPrice) : null,
  description: formData.description,
  main_image_url: [formData.mainImgUrl],
  gallery_images: formData.galleryImageUrls,
  amenities: formData.amenities || [],
});
