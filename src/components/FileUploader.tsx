import React, { useRef } from "react";
import { X, Upload } from "lucide-react";

type FileUploaderProps = {
  previewUrl: string | null;
  onChange: (file: File | null) => void;
};

export function FileUploader({ previewUrl, onChange }: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    onChange(selectedFile);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the click-to-upload on parent if applicable
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={inputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />

      {previewUrl ? (
        <div className="relative w-32 h-32 sm:w-40 sm:h-40 group">
          {/* Image */}
          <img
            src={previewUrl}
            alt="Image preview"
            className="w-full h-full object-cover rounded-lg border shadow-sm"
          />

          {/* Overlay - visible on hover (desktop) and always semi-visible on mobile for context */}
          <div className="absolute inset-0 rounded-lg bg-black/10 sm:bg-black/20 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" />

          {/* X Button – Optimized for Touch */}
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Remove image"
            className="
              absolute -top-2 -right-2
              h-8 w-8 flex items-center justify-center
              rounded-full
              bg-red-600 sm:bg-gray-700 text-white
              shadow-lg
              /* Always visible on mobile, hover-only on desktop */
              opacity-100 scale-100 
              sm:opacity-0 sm:scale-90 sm:group-hover:opacity-100 sm:group-hover:scale-100
              hover:bg-red-700 sm:hover:bg-gray-800
              transition-all duration-200
              z-10
            "
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="
            w-32 h-32 sm:w-40 sm:h-40 flex flex-col items-center justify-center gap-2
            border-2 border-dashed rounded-lg
            text-gray-400 cursor-pointer
            bg-gray-50
            hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50/30
            active:scale-95 transition-all
          "
        >
          <Upload size={24} />
          <span className="text-xs font-medium text-center px-2">
            Click to Upload
          </span>
        </div>
      )}
    </div>
  );
}