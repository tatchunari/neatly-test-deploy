// ===== BOOKING CONSTANTS =====
import { BookingPolicies, SpecialRequest } from "@/types/ิbooking";

// ===== ERROR CODES =====
export const BOOKING_ERROR_CODES = {
  INVALID_PROMO_CODE: "INVALID_PROMO_CODE",
  PROMO_CODE_EXPIRED: "PROMO_CODE_EXPIRED",
  PROMO_CODE_USAGE_LIMIT_REACHED: "PROMO_CODE_USAGE_LIMIT_REACHED",
  PAYMENT_FAILED: "PAYMENT_FAILED",
  ROOM_NOT_AVAILABLE: "ROOM_NOT_AVAILABLE",
  INVALID_DATE_RANGE: "INVALID_DATE_RANGE",
  INVALID_GUEST_COUNT: "INVALID_GUEST_COUNT",
  BOOKING_EXPIRED: "BOOKING_EXPIRED",
  INVALID_CARD_DETAILS: "INVALID_CARD_DETAILS",
  NETWORK_ERROR: "NETWORK_ERROR",
} as const;

// ===== STATUS CONSTANTS =====
export const BOOKING_STATUSES = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
} as const;

export const PAYMENT_STATUSES = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
  REFUNDED: "refunded",
} as const;

// ===== PAYMENT CONSTANTS =====
export const PAYMENT_METHODS = {
  CREDIT_CARD: "credit_card",
  CASH: "cash",
  BANK_TRANSFER: "bank_transfer",
  PROMPTPAY: "promptpay",
} as const;

// ===== PROMOTION CONSTANTS =====
export const DISCOUNT_TYPES = {
  PERCENTAGE: "percentage",
  FIXED: "fixed",
} as const;

// ===== GENERAL CONSTANTS =====
export const CURRENCY = "THB";

// ===== BOOKING POLICIES =====
export const BOOKING_POLICIES: BookingPolicies = {
  cancellation_hours: 24,
  change_hours: 24,
  refund_policy:
    "Cancel booking will get full refund if the cancellation occurs before 24 hours of the check-in date.",
  change_policy:
    "Able to change check-in or check-out date booking within 24 hours of the booking date",
  check_in_time: "After 2:00 PM",
  check_out_time: "Before 12:00 PM",
};

// ===== SPECIAL REQUESTS =====
export const SPECIAL_REQUESTS: SpecialRequest[] = [
  // Standard Requests
  {
    id: "early_checkin",
    type: "standard",
    name: "Early check-in",
    selected: false,
  },
  {
    id: "late_checkout",
    type: "standard",
    name: "Late check-out",
    selected: false,
  },
  {
    id: "non_smoking",
    type: "standard",
    name: "Non-smoking room",
    selected: false,
  },
  {
    id: "high_floor",
    type: "standard",
    name: "A room on the high floor",
    selected: false,
  },
  { id: "quiet_room", type: "standard", name: "A quiet room", selected: false },

  // Special Requests (มีค่าใช้จ่าย)
  {
    id: "baby_cot",
    type: "special",
    name: "Baby cot",
    price: 400,
    selected: false,
  },
  {
    id: "airport_transfer",
    type: "special",
    name: "Airport transfer",
    price: 200,
    selected: false,
  },
  {
    id: "extra_bed",
    type: "special",
    name: "Extra bed",
    price: 500,
    selected: false,
  },
  {
    id: "extra_pillows",
    type: "special",
    name: "Extra pillows",
    price: 100,
    selected: false,
  },
  {
    id: "chargers",
    type: "special",
    name: "Phone chargers and adapters",
    price: 100,
    selected: false,
  },
  {
    id: "breakfast",
    type: "special",
    name: "Breakfast",
    price: 150,
    selected: false,
  },
];
