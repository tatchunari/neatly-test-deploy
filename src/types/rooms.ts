// types/room.ts
export interface RoomFormData {
  roomType: string;
  roomSize: number;
  bedType: string;
  guests: number;
  pricePerNight: number;
  promotionPrice?: number;
  description: string;
  mainImageUrl: string;
  galleryImages: string[];
  amenities: string[];
}

export interface ImageFile {
  file: File;
  url: string;
  id: string;
}

export interface AmenityItem {
  id: string;
  value: string;
}

export type BedType =
  | "Single bed"
  | "Double bed"
  | "Queen bed"
  | "King bed"
  | "Twin beds";

export interface RoomFormValues {
  roomType: string;
  roomSize: number | string;
  bedType: string;
  guests: number | string;
  pricePerNight: number | string;
  promotionPrice?: number | string | null;
  description: string;
  mainImgUrl: string;
  galleryImageUrls: string[];
  amenities?: string[];
}
export interface Room {
  id: string;
  room_type: string;
  room_size: number;
  bed_type: string;
  guests: number;
  price: number;
  promotion_price?: number | null;
  description: string;
  main_image_url: string[];
  gallery_images: string[];
  amenities: string[];
  status?: string;
}

export interface RoomCreatePayload {
  name: string;
  room_type: string;
  price: number;
  promotion_price?: number;
  guests: number;
  room_size: number;
  description: string;
  amenities: string[] | string;
  bed_type: string;
  main_image_url?: string;
  gallery_images?: string[];
}

export interface RoomUpdatePayload extends Partial<RoomCreatePayload> {
  id: string | number;
}

export interface FormValues {
  roomType: string;
  roomSize: number;
  bedType: string;
  guests: number;
  pricePerNight: number;
  promotionPrice?: number;
  description: string;
  mainImageUrl: string;
  galleryImages: string[];
  amenities: string[];
}
