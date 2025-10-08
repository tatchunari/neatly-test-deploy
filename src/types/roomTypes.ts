export interface RoomType {
  id: number; // room_types.id (int4) - เปลี่ยนเป็น number
  name: string;
  description: string;
  base_price: number;
  promo_price?: number;
  guests: number;
  room_size: number;
  bed_type: string;
  amenities: string[];
  main_image: string;
  gallery_images: string[];
}
