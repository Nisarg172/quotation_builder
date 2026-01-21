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
    // Cleanup to restore scroll if component unmounts
    return () => { document.body.style.overflow = "auto"; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onCancel} 
    >
      <div
        className={`
          bg-white dark:bg-gray-800 rounded-2xl shadow-2xl 
          w-full max-w-sm p-6 relative 
          animate-in zoom-in-95 fade-in duration-200
          /* On mobile: slide up from bottom | On desktop: scale in center */
          slide-in-from-bottom-4 sm:slide-in-from-bottom-0
        `}
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Icon */}
        {icon && 
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 mx-auto mb-4">
            <div className="text-red-600 dark:text-red-400">
              {icon}
            </div>
          </div>
        }

        {/* Title */}
        <h2 className="text-lg sm:text-xl font-bold text-center text-gray-900 dark:text-gray-100 px-2">
          {title}
        </h2>

        {/* Description */}
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2 leading-relaxed">
          {description}
        </p>

        {/* Actions - Stacked on mobile, side-by-side on desktop */}
        <div className="flex flex-col sm:flex-row-reverse justify-center gap-3 mt-8">
          <button
            onClick={onConfirm}
            className="w-full sm:w-auto px-8 py-3 sm:py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 active:scale-95 transition-all"
          >
            Confirm
          </button>
          <button
            onClick={onCancel}
            className="w-full sm:w-auto px-8 py-3 sm:py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-800 active:scale-95 transition-all font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}