interface RoomMainImageProps {
  name: string;
  value?: string;
}

import Image from "next/image";
import { useRef, useState } from "react";
import { useFormContext } from "react-hook-form";

export const RoomMainImage = ({ name, value }: RoomMainImageProps) => {
  const [mainImgName, setMainImgName] = useState<string | null>(null);
  const [mainImg, setMainImg] = useState<File | null>(null);
  const [mainImgUrl, setMainImgUrl] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { register, setValue } = useFormContext();

  // console.log(`RoomMainImage.mainImgUrl: `, mainImgUrl);

  const removeFile = () => {
    setMainImgName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      setMainImg(null);
      setMainImgUrl("");
      setValue(name, "", { shouldValidate: true, shouldDirty: true });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMainImg(file);
    setMainImgName(file.name);

    // Automatically upload the image
    const formData = new FormData();
    formData.append("mainImage", file);

    // console.log("FormData:", file)

    try {
      const res = await fetch("/api/upload-room-image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data.success) {
        console.log("Uploaded image URL:", data.url);
        setMainImgUrl(data.url); // store URL in state for later use in form submission
        setValue(name, data.url, { shouldValidate: true, shouldDirty: true });
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
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Main Image <span className="text-red-500">*</span>
      </label>

      <div>
        <input type="hidden" value={mainImgUrl || ""} {...register(name)} />
      </div>
      <div className="relative w-60 h-60">
        {/* Uploaded file preview (on top if exists) */}
        {mainImgUrl && (
          <div className="absolute inset-0 z-10 border border-gray-300 rounded-md flex items-center justify-center bg-white shadow">
            {mainImgUrl && mainImgUrl.trim() !== "" && (
              <Image
                src={mainImgUrl}
                alt="uploaded image"
                width={800}
                height={600}
              />
            )}
            <div className="bg-[#B61515] left-55 bottom-55 rounded-full w-6 h-6 absolute">
              <button
                type="button"
                onClick={removeFile}
                className="absolute cursor-pointer text-white left-2 top-1 text-xs font-bold"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* File input box */}
        <label className="w-60 h-60 border-gray-300 rounded-md flex flex-col items-center justify-center bg-[#F1F2F6] hover:bg-gray-100 cursor-pointer transition-colors">
          <p className="text-2xl text-orange-500">+</p>
          <p className="text-sm text-orange-500">Upload Image</p>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
        </label>
      </div>
    </div>
  );
};
