// constants/room.ts
import { BedType } from '@/types/rooms';

export const BED_TYPE_OPTIONS: { value: BedType; label: string }[] = [
  { value: 'Single bed', label: 'Single bed' },
  { value: 'Double bed', label: 'Double bed' },
  { value: 'Queen bed', label: 'Queen bed' },
  { value: 'King bed', label: 'King bed' },
  { value: 'Twin beds', label: 'Twin beds' },
];

export const VALIDATION_RULES = {
  ROOM_SIZE: {
    MIN: 1,
    MAX: 1000,
  },
  GUESTS: {
    MIN: 1,
    MAX: 10,
  },
  PRICE: {
    MIN: 0,
    MAX: 100000,
  },
  DESCRIPTION: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 1000,
  },
  GALLERY_IMAGES: {
    MIN_COUNT: 4,
    MAX_COUNT: 10,
  },
  IMAGE_FILE: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  },
} as const;

export const STORAGE_CONFIG = {
  BUCKET_NAME: 'room-images',
  FOLDER_PREFIX: 'rooms',
} as const;

export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_NUMBER: 'Please enter a valid number',
  MIN_LENGTH: (min: number) => `Must be at least ${min} characters`,
  MAX_LENGTH: (max: number) => `Must be no more than ${max} characters`,
  MIN_VALUE: (min: number) => `Must be at least ${min}`,
  MAX_VALUE: (max: number) => `Must be no more than ${max}`,
  INVALID_FILE_TYPE: 'Only JPEG, PNG, and WebP images are allowed',
  FILE_TOO_LARGE: (maxSize: string) => `File size must be less than ${maxSize}`,
  PROMOTION_PRICE_INVALID: 'Promotion price must be less than regular price',
  MIN_GALLERY_IMAGES: (min: number) => `At least ${min} gallery images are required`,
} as const;