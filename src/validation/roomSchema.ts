import { z } from 'zod';

// Define the bed type enum for type safety
export const BedTypeEnum = z.enum([
  'Single bed',
  'Double bed', 
  'King bed',
  'Twin beds'
]);

// Main room validation schema
export const roomSchema = z.object({
  // Basic Information
  roomType: z
    .string()
    .min(1, "Room type is required")
    .min(2, "Room type must be at least 2 characters")
    .max(100, "Room type cannot exceed 100 characters")
    .trim(),

  roomSize: z
    .number({
      required_error: "Room size is required",
      invalid_type_error: "Room size must be a number"
    })
    .positive("Room size must be greater than 0")
    .max(1000, "Room size cannot exceed 1000 sqm")
    .int("Room size must be a whole number"),

  bedType: BedTypeEnum.refine(
    (value) => value !== undefined,
    "Please select a bed type"
  ),

  guests: z
    .number({
      required_error: "Number of guests is required",
      invalid_type_error: "Number of guests must be a number"
    })
    .int("Number of guests must be a whole number")
    .min(1, "Must accommodate at least 1 guest")
    .max(10, "Cannot accommodate more than 10 guests"),

  // Pricing
  pricePerNight: z
    .number({
      required_error: "Price per night is required",
      invalid_type_error: "Price must be a number"
    })
    .positive("Price must be greater than 0")
    .max(100000, "Price cannot exceed 100,000 THB")
    .multipleOf(0.01, "Price can have at most 2 decimal places"),

  promotionPrice: z
    .number({
      invalid_type_error: "Promotion price must be a number"
    })
    .positive("Promotion price must be greater than 0")
    .max(100000, "Promotion price cannot exceed 100,000 THB")
    .multipleOf(0.01, "Promotion price can have at most 2 decimal places")
    .nullable()
    .optional(),

  description: z
    .string()
    .min(1, "Room description is required")
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description cannot exceed 1000 characters")
    .trim(),

  // Images
  mainImgUrl: z
    .string()
    .min(1, "Main image is required")
    .url("Main image must be a valid URL"),

  galleryImages: z
    .array(z.string().url("Gallery image must be a valid URL"))
    .min(4, "At least 4 gallery images are required")
    .max(20, "Cannot have more than 20 gallery images"),

  // Amenities
  amenities: z
    .array(z.string().min(1, "Amenity cannot be empty").trim())
    .min(1, "At least one amenity is required")
    .max(20, "Cannot have more than 20 amenities")
}).refine(
  (data) => {
    // Custom validation: promotion price should be less than regular price
    if (data.promotionPrice && data.promotionPrice >= data.pricePerNight) {
      return false;
    }
    return true;
  },
  {
    message: "Promotion price must be less than regular price",
    path: ["promotionPrice"]
  }
);

// Type inference for TypeScript
export type RoomFormValues = z.infer<typeof roomSchema>;

// Individual field schemas for real-time validation
export const fieldSchemas = {
  roomType: roomSchema.shape.roomType,
  roomSize: roomSchema.shape.roomSize,
  bedType: roomSchema.shape.bedType,
  guests: roomSchema.shape.guests,
  pricePerNight: roomSchema.shape.pricePerNight,
  promotionPrice: roomSchema.shape.promotionPrice,
  description: roomSchema.shape.description,
  mainImgUrl: roomSchema.shape.mainImgUrl,
  galleryImages: roomSchema.shape.galleryImages,
  amenities: roomSchema.shape.amenities,
};

// Helper function to validate individual fields
export const validateField = (fieldName: keyof typeof fieldSchemas, value: any) => {
  try {
    fieldSchemas[fieldName].parse(value);
    return { success: true, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.errors[0]?.message || 'Validation failed' 
      };
    }
    return { success: false, error: 'Unknown validation error' };
  }
};

// Helper function to format Zod errors for display
export const formatZodErrors = (error: z.ZodError): string => {
  return error.errors.map(err => {
    const path = err.path.length > 0 ? `${err.path.join('.')}: ` : '';
    return `${path}${err.message}`;
  }).join('\n');
};