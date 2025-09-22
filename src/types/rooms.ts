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

export interface Room {
  id: string;
  room_type: string;
  room_size: number;
  bed_type: string;
  guests: number;
  price_per_night: number;
  promotion_price?: number;
  description: string;
  main_image_url: string;
  gallery_images: string[];
  amenities: string[];
  created_at: string;
  updated_at: string;
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

export type BedType = 'Single bed' | 'Double bed' | 'Queen bed' | 'King bed' | 'Twin beds';

export interface RoomCreatePayload {
  room_type: string;
  room_size: number;
  bed_type: BedType;
  guests: number;
  price: number;
  promotion_price?: number;
  description: string;
  main_image_url: string[];
  gallery_images: string[];
  amenities: string[];
}