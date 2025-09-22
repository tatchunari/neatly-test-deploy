// hooks/useRoomForm.ts
import { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { RoomFormData, AmenityItem, ImageFile, RoomCreatePayload } from '@/types/rooms';
import { RoomService } from '@/services/roomService';
import { FormValidation, ValidationResult } from '@/utils/roomFormValidation';

interface UseRoomFormReturn {
  // Form state
  formData: Partial<RoomFormData>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<RoomFormData>>>;
  
  // Images state
  mainImage: ImageFile | null;
  setMainImage: React.Dispatch<React.SetStateAction<ImageFile | null>>;
  galleryImages: ImageFile[];
  setGalleryImages: React.Dispatch<React.SetStateAction<ImageFile[]>>;
  
  // Amenities state
  amenities: AmenityItem[];
  setAmenities: React.Dispatch<React.SetStateAction<AmenityItem[]>>;
  
  // Promotion state
  hasPromotion: boolean;
  setHasPromotion: React.Dispatch<React.SetStateAction<boolean>>;
  
  // Loading states
  isSubmitting: boolean;
  
  // Validation
  errors: Record<string, string>;
  
  // Handlers
  handleInputChange: (field: keyof RoomFormData, value: any) => void;
  handleSubmit: () => Promise<void>;
  validateForm: () => ValidationResult;
}

export const useRoomForm = (): UseRoomFormReturn => {
  const router = useRouter();
  
  // Form state
  const [formData, setFormData] = useState<Partial<RoomFormData>>({
    roomType: "",
    roomSize: 0,
    bedType: "Single bed",
    guests: 1,
    pricePerNight: 0,
    promotionPrice: undefined,
    description: "",
    mainImageUrl: "",
    galleryImages: [],
  });

  // Images state
  const [mainImage, setMainImage] = useState<ImageFile | null>(null);
  const [galleryImages, setGalleryImages] = useState<ImageFile[]>([]);

  // Amenities state
  const [amenities, setAmenities] = useState<AmenityItem[]>([
    { id: crypto.randomUUID(), value: "" },
  ]);

  // Other state
  const [hasPromotion, setHasPromotion] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle input changes with validation
  const handleInputChange = useCallback((field: keyof RoomFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Real-time validation for individual fields
    const error = FormValidation.validateField(field, value, {
      hasPromotion,
      regularPrice: formData.pricePerNight,
    });
    
    setErrors(prev => ({
      ...prev,
      [field]: error || '',
    }));
  }, [formData.pricePerNight, hasPromotion]);

  // Validate entire form
  const validateForm = useCallback((): ValidationResult => {
    const validation = FormValidation.validateRoomForm(
      formData,
      amenities,
      galleryImages.length,
      hasPromotion
    );

    // Convert validation errors to errors object
    const errorMap: Record<string, string> = {};
    validation.errors.forEach(error => {
      errorMap[error.field] = error.message;
    });
    
    setErrors(errorMap);
    return validation;
  }, [formData, amenities, galleryImages.length, hasPromotion]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    const validation = validateForm();
    
    if (!validation.isValid) {
      // Scroll to first error or show alert
      const firstError = validation.errors[0];
      alert(`Please fix the following error: ${firstError.message}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const validAmenities = FormValidation.getValidAmenities(amenities);
      
      const roomPayload: RoomCreatePayload = {
        room_type: formData.roomType!,
        room_size: formData.roomSize!,
        bed_type: formData.bedType as any,
        guests: formData.guests!,
        price: formData.pricePerNight!,
        promotion_price: hasPromotion ? formData.promotionPrice : undefined,
        description: formData.description!,
        main_image_url: [formData.mainImageUrl!],
        gallery_images: formData.galleryImages!,
        amenities: validAmenities,
      };

      await RoomService.createRoom(roomPayload);
      
      alert('Room created successfully!');
      router.push('/admin/room-types');
    } catch (error) {
      console.error('Error creating room:', error);
      alert(`Failed to create room: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, amenities, galleryImages, hasPromotion, validateForm, router]);

  return {
    // State
    formData,
    setFormData,
    mainImage,
    setMainImage,
    galleryImages,
    setGalleryImages,
    amenities,
    setAmenities,
    hasPromotion,
    setHasPromotion,
    isSubmitting,
    errors,
    
    // Handlers
    handleInputChange,
    handleSubmit,
    validateForm,
  };
};