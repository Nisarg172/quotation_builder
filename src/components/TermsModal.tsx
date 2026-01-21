import { IoClose } from "react-icons/io5";
import TermsContent from "./TermsContent";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function TermsModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6 relative">
      <IoClose onClick={onClose} className="absolute top-2 right-2 transition-transform duration-300 hover:rotate-90" size={28}/>

        <TermsContent />
      </div>
    </div>
  );
}
