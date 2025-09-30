import { Reorder, useDragControls } from "framer-motion";
import Image from "next/image";

export interface AmenityItem {
  id: string;
  value: string;
}

interface ReorderableItemProps {
  item: AmenityItem;
  onChange: (id: string, val: string) => void;
  onDelete: (id: string) => void;
  disableDelete?: boolean;
  label?: string;
}

export function ReorderableItem({
  item,
  onChange,
  onDelete,
  disableDelete,
  label = "Item",
}: ReorderableItemProps) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      className="w-full"
    >
      <div className="flex items-center gap-3 w-full">
        {/* Drag handle */}
        <Image
          src="/assets/drag-icon.png"
          alt="drag"
          width={800}
          height={600}
          className="w-4 cursor-grab shrink-0 mt-7 hover:scale-110 transition"
          onPointerDown={(e) => {
            e.preventDefault();
            controls.start(e);
          }}
        />
        {/* Input field */}
        <div className="flex flex-col flex-1 gap-y-2 justify-center">
          <label>
            {label} <span className="text-red">*</span>
          </label>
          <input
            type="text"
            value={item.value}
            onChange={(e) => onChange(item.id, e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md 
              focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder={`Enter ${label.toLowerCase()}`}
          />
        </div>
        {/* Delete button */}
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          disabled={disableDelete}
          className={`shrink-0 mt-7 ${
            disableDelete
              ? "text-gray-400 cursor-not-allowed"
              : "text-red-500 hover:underline"
          }`}
        >
          Delete
        </button>
      </div>
    </Reorder.Item>
  );
}
