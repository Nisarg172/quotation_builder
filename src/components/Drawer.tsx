import * as React from "react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

type DrawerProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

export function Drawer({ open, title, onClose, children }: DrawerProps) {
  // Lock body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  return (
    <>
      {/* Overlay - Darkened more for better mobile focus */}
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      />

      {/* Drawer Content */}
      <div
        className={cn(
          /* Mobile: full width (w-full) 
             Desktop: Fixed width (sm:max-w-xl or md:w-[600px]) 
          */
          "fixed top-0 right-0 h-full w-full sm:max-w-xl bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header - Sticky at the top */}
        <div className="flex justify-between items-center border-b px-4 py-4 sm:px-6 bg-white shrink-0">
          <h2 className="text-xl font-bold text-gray-900 truncate pr-4">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors active:scale-90"
            aria-label="Close drawer"
          >
            <span className="text-2xl leading-none">✕</span>
          </button>
        </div>

        {/* Content Area - Scrollable with bounce-fix for mobile */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 overscroll-contain">
          {children}
        </div>
      </div>
    </>
  );
}