// utils/formValidation.ts
import { RoomFormData, AmenityItem } from '@/types/rooms';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export class FormValidation {
  /**
   * Validate room form data
   */
  static validateRoomForm(
    formData: Partial<RoomFormData>,
    amenities: AmenityItem[],
    galleryImagesCount: number,
    hasPromotion: boolean
  ): ValidationResult {
    const errors: ValidationError[] = [];

    // Required field validations
    if (!formData.roomType?.trim()) {
      errors.push({ field: 'roomType', message: 'Room type is required' });
    }

    if (!formData.roomSize || formData.roomSize <= 0) {
      errors.push({ field: 'roomSize', message: 'Room size must be greater than 0' });
    }

    if (!formData.guests || formData.guests <= 0) {
      errors.push({ field: 'guests', message: 'Number of guests must be greater than 0' });
    }

    if (formData.guests && formData.guests > 10) {
      errors.push({ field: 'guests', message: 'Maximum 10 guests allowed' });
    }

    if (!formData.pricePerNight || formData.pricePerNight <= 0) {
      errors.push({ field: 'pricePerNight', message: 'Price per night must be greater than 0' });
    }

    if (!formData.description?.trim()) {
      errors.push({ field: 'description', message: 'Room description is required' });
    }

    if (formData.description && formData.description.trim().length < 10) {
      errors.push({ field: 'description', message: 'Description must be at least 10 characters' });
    }

    // Promotion price validation
    if (hasPromotion) {
      if (!formData.promotionPrice || formData.promotionPrice <= 0) {
        errors.push({ field: 'promotionPrice', message: 'Promotion price must be greater than 0' });
      } else if (formData.pricePerNight && formData.promotionPrice >= formData.pricePerNight) {
        errors.push({ field: 'promotionPrice', message: 'Promotion price must be less than regular price' });
      }
    }

    // Image validations
    if (!formData.mainImageUrl) {
      errors.push({ field: 'mainImage', message: 'Main image is required' });
    }

    if (galleryImagesCount < 4) {
      errors.push({ field: 'galleryImages', message: 'At least 4 gallery images are required' });
    }

    // Amenities validation
    const validAmenities = amenities.filter(a => a.value.trim() !== '');
    if (validAmenities.length === 0) {
      errors.push({ field: 'amenities', message: 'At least one amenity is required' });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get filtered amenities (remove empty ones)
   */
  static getValidAmenities(amenities: AmenityItem[]): string[] {
    return amenities
      .filter(a => a.value.trim() !== '')
      .map(a => a.value.trim());
  }

  /**
   * Validate individual field
   */
  static validateField(field: string, value: any, context?: any): string | null {
    switch (field) {
      case 'roomType':
        return !value?.trim() ? 'Room type is required' : null;
      
      case 'roomSize':
        if (!value || value <= 0) return 'Room size must be greater than 0';
        if (value > 1000) return 'Room size seems too large';
        return null;
      
      case 'guests':
        if (!value || value <= 0) return 'Number of guests must be greater than 0';
        if (value > 10) return 'Maximum 10 guests allowed';
        return null;
      
      case 'pricePerNight':
        if (!value || value <= 0) return 'Price must be greater than 0';
        if (value > 100000) return 'Price seems too high';
        return null;
      
      case 'promotionPrice':
        if (context?.hasPromotion) {
          if (!value || value <= 0) return 'Promotion price must be greater than 0';
          if (context.regularPrice && value >= context.regularPrice) {
            return 'Promotion price must be less than regular price';
          }
        }
        return null;
      
      case 'description':
        if (!value?.trim()) return 'Description is required';
        if (value.trim().length < 10) return 'Description must be at least 10 characters';
        if (value.trim().length > 1000) return 'Description is too long (max 1000 characters)';
        return null;
      
      default:
        return null;
    }
  }
}