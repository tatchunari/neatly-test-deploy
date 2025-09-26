import { useState, useEffect } from "react";
import { useFormContext, FieldErrors } from "react-hook-form";
import { ReorderableItem } from "@/components/admin/ReorderableItem";
import { Reorder } from "motion/react";

type AmenityItemType = { id: string; value: string };

type AmenityItemsProps = {
  name: string;
  value?: string[];
};

export const AmenityItems = ({ name, value }: AmenityItemsProps) => {
  const { register, setValue, watch, formState: { errors, touchedFields, isSubmitted } } = useFormContext();
  
  // Initialize local state from form or props
  const formValues: string[] = watch(name) || value || [];
  const [amenities, setAmenities] = useState<AmenityItemType[]>(
    formValues.length > 0
      ? formValues.map((val) => ({ id: crypto.randomUUID(), value: val }))
      : [{ id: crypto.randomUUID(), value: "" }]
  );

  // Sync local state -> RHF values
  useEffect(() => {
  setValue(
    name,
    amenities.map((item) => item.value.trim()).filter(Boolean),
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
  if (amenities.length === 1) return; // keep at least 1 input
  setAmenities((prev) => prev.filter((item) => item.id !== id));
  };


  const handleReorder = (newOrder: AmenityItemType[]) => {
    setAmenities(newOrder);
  };

  // Determine if error should show
  const showError = (errors[name] && (touchedFields[name] || isSubmitted));

  return (
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

      <button
        type="button"
        onClick={handleAddAmenity}
        className="mt-3 flex items-center gap-2 px-4 py-2 text-orange-600 border border-orange-600 rounded-md hover:bg-orange-50 transition-colors"
      >
        + Add Amenity
      </button>

      {/* Hidden inputs to register each amenity */}
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

      {/* Show validation error */}
      {showError && (
        <p className="text-red-500">
          {(errors[name] as any)?.message || "Please add at least one amenity"}
        </p>
      )}
    </div>
  );
};
