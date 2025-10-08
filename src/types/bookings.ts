export interface Booking {
  id: string | number
  customer_name?: string | null
  customer_id?: string | null
  user_id?: string | null
  profile_id?: string | null
  // common alternative fields that may exist in rows or joins
  first_name?: string | null
  last_name?: string | null
  full_name?: string | null
  username?: string | null
  guests?: number | null
  room_type?: string | null
  amount?: number | null
  bed_type?: string | null
  check_in?: string | null
  check_out?: string | null
  check_in_date?: string | null
  check_out_date?: string | null
  stay_total_nights?: number | null
  booking_date?: string | null
  room_id?: string | null
  price?: number | null
  promotion_price?: number | null
  created_at?: string | null
  updated_at?: string | null
}


