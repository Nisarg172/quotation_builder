import React, { useRef } from "react";
import { X } from "lucide-react";

type FileUploaderProps = {
  file: File | null|string;
  previewUrl: string | null;
  onChange: (file: File | null) => void;
};

export function FileUploader({  previewUrl, onChange }: FileUploaderProps) {
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
    <div className="flex flex-col items-center gap-3">
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />

      {previewUrl ? (
        <div className="relative group">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-lg shadow"
          />
          {/* Overlay on hover */}
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="w-32 h-32 flex items-center justify-center border-2 border-dashed rounded-lg text-gray-400 cursor-pointer hover:border-blue-500 hover:text-blue-500 transition"
        >
          Click to Upload
        </div>
      )}
    </div>
  );
}
