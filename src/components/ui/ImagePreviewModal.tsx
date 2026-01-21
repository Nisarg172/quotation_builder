import { IoClose } from "react-icons/io5";


interface Props {
  image: string | null;
  onClose: () => void;
}

export default function ImagePreviewModal({ image, onClose }: Props) {
  if (!image) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
      <div className="relative bg-white rounded-lg p-4 max-w-3xl w-full">
        <IoClose onClick={onClose} className="absolute top-2 right-2 transition-transform duration-300 hover:rotate-90" size={28}/>
        <img
          src={image}
          className="max-h-[80vh] w-full object-contain"
        />
      </div>
    </div>
  );
}
