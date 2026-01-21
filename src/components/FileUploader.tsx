import React, { useRef } from "react";
import { X } from "lucide-react";
type FileUploaderProps = {
  previewUrl: string | null;
  onChange: (file: File | null) => void;
};
export function FileUploader({ previewUrl, onChange }:FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    onChange(selectedFile);
  };

  const handleRemove = () => {
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
        /* 🔑 Image wrapper MUST be relative */
        <div className="relative w-32 h-32 group">
          {/* Image */}
          <img
            src={previewUrl}
            alt="Image preview"
            className="w-full h-full object-cover rounded-lg border shadow-sm"
          />

          {/* Overlay */}
          <div className="absolute inset-0 rounded-lg bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* X Button – EXACT image top right */}
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Remove image"
            className="
              absolute top-1 right-1
              h-6 w-6 flex items-center justify-center
              rounded-full
              bg-gray-700 text-white
              shadow
              opacity-0 scale-90
              group-hover:opacity-100 group-hover:scale-100
              hover:bg-gray-800
              transition-all duration-200
            "
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="
            w-32 h-32 flex items-center justify-center
            border-2 border-dashed rounded-sm
            text-gray-400 cursor-pointer
            hover:border-blue-500 hover:text-blue-500
            transition
          "
        >
          Click to Upload
        </div>
      )}
    </div>
  );
}
