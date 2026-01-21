import { IoClose } from "react-icons/io5";

interface Props {
  image: string | null;
  onClose: () => void;
}

export default function ImagePreviewModal({ image, onClose }: Props) {
  if (!image) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
      onClick={onClose} // Closes when clicking the backdrop
    >
      <div 
        className="relative bg-white rounded-xl overflow-hidden max-w-4xl w-full shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()} // Prevents closing when clicking the image/container
      >
        {/* Close Button - Larger touch target for mobile */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-md rounded-full text-gray-800 shadow-md hover:bg-gray-100 active:scale-90 transition-all"
          aria-label="Close preview"
        >
          <IoClose size={24} />
        </button>

        <div className="flex items-center justify-center bg-gray-50">
          <img
            src={image}
            alt="Preview"
            // max-h adjusted for mobile to account for device safe areas
            className="max-h-[75vh] md:max-h-[85vh] w-full object-contain block"
          />
        </div>
      </div>
    </div>
  );
}