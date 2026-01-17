import * as React from "react";
import { cn } from "@/lib/utils"; // helper to join classNames (optional)

type DrawerProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

export function Drawer({ open, title, onClose, children }: DrawerProps) {
  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/10 backdrop-blur-none z-30 transition-opacity"
        />
      )}

      {/* Drawer Content */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-2xl bg-white shadow-xl p-6 z-40 transform transition-transform duration-400",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto h-[calc(100%-3rem)]">{children}</div>
      </div>
    </>
  );
}
