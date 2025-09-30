// services/roomService.ts
import { buildRoomPayload } from "@/utils/roomPayload";
import { RoomFormData } from "@/schemas/roomSchema";

export async function updateRoom(
  roomId: string,
  formData: RoomFormData,
  hasPromotion: boolean
) {
  const payload = buildRoomPayload(formData, hasPromotion);

  try {
    const response = await fetch(`/api/rooms/${roomId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || data.message || "Failed to update room");
    }

    return data;
  } catch (error) {
    throw error;
  }
}

// services/roomService.ts
export async function deleteRoom(roomId: string) {
  try {
    const response = await fetch(`/api/rooms/${roomId}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || data.message || "Failed to delete room");
    }

    return data;
  } catch (error) {
    throw error;
  }
}

// services/roomService.ts
export async function createRoom(
  formData: RoomFormData,
  hasPromotion: boolean
) {
  const payload = {
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
  };

  console.log("Payload being sent:", payload); // Debug log

  try {
    const response = await fetch(`/api/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || data.message || "Failed to create room");
    }
    return data;
  } catch (error) {
    throw error;
  }
}
