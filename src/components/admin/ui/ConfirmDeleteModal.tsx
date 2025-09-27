// components/admin/ui/ConfirmDeleteModal.tsx
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Button } from "./Button";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  roomType?: string;
}

export function ConfirmDeleteModal({ isOpen, onClose, onConfirm, roomType }: ConfirmDeleteModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-md bg-white border-none">
        <AlertDialogHeader>
          <AlertDialogTitle className="border-b border-gray-500 pb-3">
            Delete Room
          </AlertDialogTitle>
        </AlertDialogHeader>

        <p className="text-sm text-gray-700 mt-2">
          Are you sure you want to delete this room?
        </p>

        <AlertDialogFooter className="mt-4 flex justify-end gap-2">
          <Button 
          text="Yes, I want to delete" 
          onClick={onConfirm} 
          loading={false} 
          className="text-orange-600 border border-orange-600 w-50"
          />
          <Button
          text="No, I don't" 
          onClick={onClose} 
          loading={false}
          className="bg-orange-600 text-white"
          />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
