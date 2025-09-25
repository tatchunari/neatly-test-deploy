// services/roomService.ts
import { buildRoomPayload } from "@/utils/roomPayload";

export async function updateRoom(roomId: string, formData: any, hasPromotion: boolean) {
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
export async function createRoom(formData: any, hasPromotion: boolean) {
  const payload = buildRoomPayload(formData, hasPromotion);

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
