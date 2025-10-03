// ===== BOOKING UTILITY FUNCTIONS =====
import { SpecialRequest, BookingCalculation } from "@/types/booking";

// ===== CALCULATION FUNCTIONS =====
export const calculateBookingTotal = (
  basePrice: number,
  nights: number,
  specialRequests: SpecialRequest[],
  promoDiscount: number = 0
): BookingCalculation => {
  const subtotal = basePrice * nights;
  const specialRequestsTotal = specialRequests
    .filter((req) => req.selected && req.price)
    .reduce((sum, req) => sum + (req.price || 0), 0);

  return {
    basePrice,
    nights,
    subtotal,
    specialRequestsTotal,
    promoDiscount,
    total: subtotal + specialRequestsTotal - promoDiscount,
    currency: "THB",
  };
};

export const calculateNights = (checkIn: string, checkOut: string): number => {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

export const isBookingExpired = (
  createdAt: string,
  expiryMinutes: number = 5
): boolean => {
  const created = new Date(createdAt);
  const now = new Date();
  const diffMinutes = (now.getTime() - created.getTime()) / (1000 * 60);
  return diffMinutes > expiryMinutes;
};

// ===== FORMATTING FUNCTIONS =====
export const formatCurrency = (
  amount: number,
  currency: string = "THB"
): string => {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("th-TH", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
