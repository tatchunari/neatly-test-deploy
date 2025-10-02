import { BookingFormData } from "@/types/ิbooking";

export const validateBookingData = (data: BookingFormData) => {
  const errors: string[] = [];

  // Validate required fields
  if (!data.roomId) errors.push("Room ID is required");
  if (!data.guestInfo) errors.push("Guest info is required");
  if (!data.checkIn) errors.push("Check-in date is required");
  if (!data.checkOut) errors.push("Check-out date is required");

  // Validate guest info
  if (data.guestInfo) {
    if (!data.guestInfo.firstName) errors.push("First name is required");
    if (!data.guestInfo.lastName) errors.push("Last name is required");
    if (!data.guestInfo.email) errors.push("Email is required");
    if (!data.guestInfo.phone) errors.push("Phone is required");
  }

  // Validate dates
  if (data.checkIn && data.checkOut) {
    const checkInDate = new Date(data.checkIn);
    const checkOutDate = new Date(data.checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) errors.push("Check-in date cannot be in the past");
    if (checkOutDate <= checkInDate) errors.push("Check-out date must be after check-in date");
  }

  // Validate guest count
  if (data.guests && data.guests < 1) errors.push("Guest count must be at least 1");

  return {
    isValid: errors.length === 0,
    errors
  };
};