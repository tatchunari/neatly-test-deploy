// /src/schemas/roomSchema.ts
import { z } from "zod";

export const roomSchema = z.object({
  roomType: z.string().min(1, "Room type is required"),
  roomSize: z
    .preprocess((val) => Number(val), z.number().positive("Room size must be greater than 0")),
  bedType: z.string().min(1, "Bed type is required"),
  guests: z.preprocess(
    (val) => Number(val),
    z
      .number()
      .min(1, "Number of guests must be at least 1")
      .max(5, "Number of guests cannot exceed 5")
  ),
  pricePerNight: z
    .preprocess((val) => Number(val), z.number().positive("Price must be greater than 0")),
  promotionPrice: z.preprocess(
      (val) => (val === "" || val === null ? null : Number(val)),
      z.number().positive("Promotion price must be greater than 0").nullable()
    ),
    hasPromotion: z.boolean(),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  mainImgUrl: z.preprocess(
  (val) => (val === null ? "" : val),
  z.string().min(1, "Main image is required").url("Invalid image URL")
  ),
  galleryImageUrls: z
  .preprocess((val) => {
    // ensure it's an array and remove null/empty entries
    if (!Array.isArray(val)) return [];
    return val.filter(Boolean);
  }, z.array(z.string().url())
      .min(4, "Please upload at least 4 images")
      .max(10, "You can upload at most 10 images")
  ),
  amenities: z.preprocess(
  (val) => {
    if (!Array.isArray(val)) return [];
    // Remove empty strings
    return val.filter(Boolean);
  },
  z.array(z.string()).min(1, "Please add at least one amenity") // <- min goes here
),
  })
.refine(
    (data) => {
      // if promotion checkbox is checked, promotionPrice must not be null
      if (data.hasPromotion) {
        return data.promotionPrice !== null && data.promotionPrice !== undefined;
      }
      return true; // skip validation if checkbox is not checked
    },
    {
      message: "Promotion price is required.",
      path: ["promotionPrice"], // attach error to the field
    }
  )

// infer TS type
export type RoomFormData = z.infer<typeof roomSchema>;
