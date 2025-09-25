interface RoomGalleryImagesProps {
  name: string;
  value: string[];
}

type GalleryItem = { id: string; url: string };

import { useState } from "react";
import { useFormContext } from "react-hook-form";

import { Reorder } from "motion/react";

export const RoomGalleryImages = ({ name, value }: RoomGalleryImagesProps) => {

  const { register, setValue, watch } = useFormContext();

  const initialValue: GalleryItem[] = (watch(name) || []).map((url, idx) => ({
    id: idx.toString(),
    url,
  }));
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(initialValue);
  console.log("Gallery Items",galleryItems)

  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [galleryFileNames, setGalleryFileNames] = useState<string[]>([]);

   const syncFormValue = (items: GalleryItem[]) => {
    const urls = items.map((item) => item.url);
    setValue(name, urls, { shouldValidate: true }); // ✅ update RHF value
  };

  const updateFormValue = (items: GalleryItem[]) => {
  setGalleryItems(items);
  setValue(name, items.map((item) => item.url), { shouldValidate: true });
};


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
          // data.url should be your uploaded image URL
          uploadedItems.push({ id: crypto.randomUUID(), url: data.url });
          setGalleryUrls((prev) => [...prev, data.url]);
        } else {
          throw new Error(data.error || data.message || "Upload failed");
        }
      } catch (err: any) {
        alert(`Image upload error: ${err.message}`);
      }
    }

      updateFormValue([...galleryItems, ...uploadedItems]);

      e.target.value = "";
    
  };

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Image Gallery(At least 4 pictures){" "}
          <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {/* Grid of uploaded images */}
          <Reorder.Group
            axis="x"
            values={galleryItems}
            onReorder={updateFormValue}
            className="flex gap-4 overflow-x-auto py-2"
          >
            {galleryItems.map((item, index) => (
              <Reorder.Item
                key={item.id}
                value={item}
                className="w-42 h-42 rounded-md flex items-center justify-center relative bg-[#F1F2F6] cursor-grab"
              >
                {/* Remove button */}
                <div
                  className="absolute rounded-full text-orange-600 font-bold top-1 right-1 px-1 cursor-pointer z-10"
                  onClick={() => {
                    const newItems = galleryItems.filter((_, i) => i !== index);
                    updateFormValue(newItems);
                  }}
                >
                  ✕
                </div>
                <img
                  src={item.url}
                  alt="hotel-images"
                  className="object-contain w-full h-full rounded-md"
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
      <div>
        {/* For debugging */}
        {/* {value?.map((url, index) => {
          return (
            <input key={index} type="text" value={url} {...register(name)} />
          );
        })} */}
      </div>
    </>
  );
};
