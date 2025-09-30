import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Reorder } from "framer-motion";
import Image from "next/image";

interface RoomGalleryImagesProps {
  name: string;
  value: string[] | undefined;
}

type GalleryItem = { id: string; url: string };

export const RoomGalleryImages = ({ name, value }: RoomGalleryImagesProps) => {
  const { setValue, watch } = useFormContext();

  // Initialize gallery items from form value
  const formValue = watch(name) || [];
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(() =>
    formValue.map((url: string, idx: number) => ({
      id: `${idx}-${Date.now()}`,
      url,
    }))
  );

  // console.log("Gallery Items", galleryItems);

  // Sync form value when gallery items change
  const updateFormValue = (items: GalleryItem[]) => {
    setGalleryItems(items);
    setValue(
      name,
      items.map((item) => item.url),
      { shouldValidate: true }
    );
  };

  // Sync with external form changes
  useEffect(() => {
    const currentFormValue = watch(name) || [];
    const currentUrls = galleryItems.map((item) => item.url);

    // Only update if form value differs from current state
    if (JSON.stringify(currentFormValue) !== JSON.stringify(currentUrls)) {
      const newItems = currentFormValue.map((url: string, idx: number) => ({
        id: `${idx}-${Date.now()}`,
        url,
      }));
      setGalleryItems(newItems);
    }
  }, [watch(name)]);

  const handleGalleryFilesChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const uploadedItems: GalleryItem[] = [];

    for (const file of newFiles) {
      const formData = new FormData();
      formData.append("galleryImages", file);

      try {
        const res = await fetch("/api/upload-multiple-images", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (res.ok && data.success) {
          uploadedItems.push({
            id: crypto.randomUUID(),
            url: data.url,
          });
        } else {
          throw new Error(data.error || data.message || "Upload failed");
        }
      } catch (err) {
        if (err instanceof Error) {
          alert(`Image upload error: ${err.message}`);
        } else {
          console.error("An unknown error occurred.");
        }
      }
    }

    // Update with new uploaded items
    updateFormValue([...galleryItems, ...uploadedItems]);

    // Clear input
    e.target.value = "";
  };

  const handleRemoveItem = (indexToRemove: number) => {
    const newItems = galleryItems.filter((_, i) => i !== indexToRemove);
    updateFormValue(newItems);
  };

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Image Gallery (At least 4 pictures){" "}
          <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {/* Grid of uploaded images */}
          <Reorder.Group
            as="div"
            axis="x"
            values={galleryItems}
            onReorder={updateFormValue}
            className="flex gap-4 overflow-x-auto py-2"
          >
            {galleryItems.map((item, index) => (
              <Reorder.Item
                key={item.id}
                value={item}
                as="div"
                className="w-42 h-42 rounded-md flex items-center justify-center relative bg-[#F1F2F6] cursor-grab active:cursor-grabbing flex-shrink-0"
                whileDrag={{
                  scale: 1.02,
                  zIndex: 999,
                  boxShadow: "0 0 0 rgba(0,0,0,0)",
                }}
                transition={{ type: "keyframes", stiffness: 600, damping: 30 }}
              >
                {/* Remove button */}
                <div className="bg-[#B61515] absolute -top-2 -right-2 rounded-full w-6 h-6 flex items-center justify-center z-10">
                  <button
                    type="button"
                    className="text-white text-xs font-bold hover:bg-red-700 w-full h-full rounded-full flex items-center justify-center"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemoveItem(index);
                    }}
                  >
                    ✕
                  </button>
                </div>
                <Image
                  src={item.url}
                  width={800}
                  height={600}
                  alt={`Gallery image ${index + 1}`}
                  className="object-contain w-full h-full rounded-md select-none"
                  onError={(e) => {
                    console.error("Image failed to load:", item.url);
                    e.currentTarget.src = "/placeholder-image.png"; // Fallback image
                  }}
                  draggable={false}
                />
              </Reorder.Item>
            ))}
          </Reorder.Group>

          {/* File input */}
          <label className="w-42 h-42 rounded-md flex flex-col items-center justify-center bg-[#F1F2F6] hover:bg-gray-100 cursor-pointer transition-colors">
            <p className="text-2xl text-orange-500">+</p>
            <p className="text-xs text-orange-500">Upload Photo</p>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleGalleryFilesChange}
            />
          </label>
        </div>
      </div>
    </>
  );
};
