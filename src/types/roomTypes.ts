export interface RoomType {
  id: string;
  name: string;
  description: string;
  base_price: number;
  promo_price?: number;
  guests: number;
  room_size: number;
  bed_type: string;
  amenities: string[]; // JSON/array
  main_image: string;
  gallery_images: string[]; // JSON/array
}
