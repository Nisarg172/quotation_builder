import { useEffect } from "react";

type ConfirmDialogProps = {
  open: boolean;
  title?: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
  icon?: React.ReactNode;
};

export function ConfirmDialog({
  open,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  onConfirm,
  onCancel,
  icon
}: ConfirmDialogProps) {
  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-amber-50/50"
      onClick={onCancel} // Close on backdrop click
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-fadeIn"
        onClick={(e) => e.stopPropagation()} // Prevent close on content click
      >
        {/* Icon */}
        {icon && 
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100  mx-auto mb-4">
            {icon}
          </div>
        }

        {/* Title */}
        <h2 className="text-xl font-semibold text-center text-gray-900 dark:text-gray-100">
          {title}
        </h2>

        {/* Description */}
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
          {description}
        </p>

        {/* Actions */}
        <div className="flex justify-center gap-3 mt-6">
          <button
            onClick={onCancel}
            className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
