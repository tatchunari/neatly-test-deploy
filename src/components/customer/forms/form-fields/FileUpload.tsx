import { forwardRef, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { PlusIcon } from "@/components/customer/icons/PlusIcon";
import { CloseIcon } from "@/components/customer/icons/CloseIcon";


interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  error?: boolean;
  currentImages?: string[];
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
}

export const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(
  (
    {
      onFileSelect,
      error,
      currentImages = [],
      accept = "image/*",
      multiple = true,
      maxFiles = 5,
      ...props
    },
    ref
  ) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewImages, setPreviewImages] = useState<string[]>(currentImages);

    const handleContainerClick = () => {
      fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);

      if (files.length > 0) {
        if (files.length > maxFiles) {
          alert(`สามารถอัปโหลดได้สูงสุด ${maxFiles} ไฟล์`);
          return;
        }

        const newPreviewImages: string[] = [];
        files.forEach((file) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            newPreviewImages.push(reader.result as string);
            if (newPreviewImages.length === files.length) {
              setPreviewImages((prev) => [...prev, ...newPreviewImages]);
            }
          };
          reader.readAsDataURL(file);
        });

        onFileSelect(files);
      }
    };

    const handleRemoveImage = (index: number) => {
      const newImages = previewImages.filter((_, i) => i !== index);
      setPreviewImages(newImages);
    };

    return (
      <div className="space-y-2">
        {/* Container ใหญ่ - Background #F7F7FD */}
        <div className="bg-[#F7F7FD] p-4 rounded">
          {/* Upload Area */}
          <div
            className={cn(
              // Base styles from design system
              "w-[167px] h-[167px] border-t rounded",
              "bg-gray-200 cursor-pointer",
              "flex flex-col items-center justify-center",
              "transition-colors duration-200",

              // Error state
              error ? "border-t-red-500" : "border-t-gray-300",

              // Hover state
              !error && "hover:border-t-gray-400"
            )}
            onClick={handleContainerClick}
          >
            {previewImages.length > 0 ? (
              // แสดงรูปที่อัปโหลดแล้ว
              <div className="w-full h-full relative">
                <img
                  src={previewImages[0]}
                  alt="Profile"
                  className="w-full h-full object-cover rounded"
                />
                {previewImages.length > 1 && (
                  <div className="absolute top-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 py-0.5 rounded">
                    +{previewImages.length - 1}
                  </div>
                )}
              </div>
            ) : (
              // แสดง icon + และข้อความ
              <div className="flex flex-col items-center text-gray-400">
                <PlusIcon size={32} className="mb-2 text-gray-400" />
                <span className="text-sm font-medium">Upload photos</span>
              </div>
            )}
          </div>
        </div>

        {/* แสดงรูปทั้งหมด (ถ้ามีมากกว่า 1 รูป) */}
        {previewImages.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {previewImages.map((image, index) => (
              <div key={index} className="relative w-16 h-16">
                <img
                  src={image}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                >
                  <CloseIcon size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Hidden File Input */}
        <input
          type="file"
          ref={(el) => {
            if (el) {
              fileInputRef.current = el;
            }
            if (typeof ref === "function") {
              ref(el);
            } else if (ref) {
              ref.current = el;
            }
          }}
          onChange={handleFileChange}
          accept={accept}
          multiple={multiple}
          className="hidden"
          {...props}
        />

        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-500">กรุณาอัปโหลดรูปโปรไฟล์</p>
        )}

        {/* ข้อมูลเพิ่มเติม */}
        <p className="text-xs text-gray-500">
          สามารถอัปโหลดได้สูงสุด {maxFiles} ไฟล์
        </p>
      </div>
    );
  }
);
