import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { ReorderableItem } from "@/components/admin/ReorderableItem";
import { Reorder } from "motion/react";

interface AmenitiesItem { name: string; value?: string[] }

type AmenitiesItemsProps = {
  name: string;
  value?: string[]; // initial values from form
};

export const AmenityItems = ({ name, value }: AmenitiesItemsProps) => {
  const { register, setValue, watch } = useFormContext();

  // Initialize from form values if available, else from props
  const formValues = watch(name) || value || [];
  const [amenities, setAmenities] = useState(
    formValues.map((val, idx) => ({
      id: crypto.randomUUID(),
      value: val,
    })) || [{ id: crypto.randomUUID(), value: "" }]
  );

  // Sync local state -> RHF whenever amenities change
  useEffect(() => {
    setValue(
      name,
      amenities.map((item) => item.value),
      { shouldValidate: true }
    );
  }, [amenities, name, setValue]);

  const handleEditAmenity = (id: string, newValue: string) => {
    setAmenities((prev) =>
      prev.map((item) => (item.id === id ? { ...item, value: newValue } : item))
    );
  };

  const handleAddAmenity = () => {
    setAmenities((prev) => [...prev, { id: crypto.randomUUID(), value: "" }]);
  };

  const handleDeleteAmenity = (id: string) => {
    if (amenities.length > 1) {
      setAmenities((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleReorder = (newOrder) => {
    setAmenities(newOrder);
  };

  return (
    <>
      <div className="bg-white">
        <Reorder.Group
          axis="y"
          values={amenities}
          onReorder={handleReorder}
          className="space-y-2"
        >
          {amenities.map((amenity, index) => (
            <ReorderableItem
              key={amenity.id}
              item={amenity}
              onChange={handleEditAmenity}
              onDelete={handleDeleteAmenity}
              disableDelete={amenities.length === 1}
              label={`Amenity ${index + 1}`}
            />
          ))}
        </Reorder.Group>
      </div>

      {/* Add Amenity Button */}
      <button
        type="button"
        onClick={handleAddAmenity}
        className="mt-3 flex items-center gap-2 px-4 py-2 
          text-orange-600 border border-orange-600 rounded-md 
          hover:bg-orange-50 transition-colors"
      >
        + Add Amenity
      </button>

      {/* Hidden inputs (for safety, but RHF already tracks) */}
      <div>
        {amenities.map((item, index) => (
          <input
            key={item.id}
            type="hidden"
            value={item.value}
            {...register(`${name}.${index}`)}
          />
        ))}
      </div>
    </>
  );
};
