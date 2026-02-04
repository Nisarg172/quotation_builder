import { useEffect } from "react";
import { IoClose } from "react-icons/io5";
import TermsContent from "./TermsContent";
import type { Database } from "@/Types/supabase";

interface Props {
  open: boolean;
  onClose: () => void;
  inforData: {
    id: number;
    companyName: string;
    logo: string;
    contactName: string;
    contactNo: string;
    email: string;
    GST?: string;
    serviceEmail: string;
    serviceMo: string;
    address: string;
    accountNo: string;
    bankName: string;
    branch: string;
    IFSC: string;
  };
  type:Database["public"]["Enums"]["bill_type"]
}

export default function TermsModal({ open, onClose, inforData,type }: Props) {
  // Prevent background scrolling when terms are being read
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [open]);

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className={`
          bg-white shadow-2xl relative flex flex-col
          /* Mobile: Full width, rounded top, slides up */
          w-full h-[90vh] rounded-t-2xl 
          /* Desktop: Max width, centered, rounded all around */
          sm:max-w-3xl sm:h-auto sm:max-h-[85vh] sm:rounded-xl
          animate-in slide-in-from-bottom sm:zoom-in-95 duration-300
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header for Mobile */}
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10 rounded-t-2xl">
          <h3 className="font-bold text-gray-900">Terms & Conditions</h3>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors active:scale-90"
            aria-label="Close Modal"
          >
            <IoClose size={28} className="text-gray-500" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="overflow-y-auto p-5 sm:p-8 overscroll-contain">
          <TermsContent inforData={inforData} type={type} />
          
          {/* Mobile bottom spacer to ensure content isn't hidden by browser bars */}
          <div className="h-10 sm:hidden" />
        </div>

        {/* Optional: Fixed Footer for Mobile "Accept/Close" */}
        <div className="p-4 border-t bg-gray-50 sm:hidden">
          <button 
            onClick={onClose}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl active:scale-[0.98] transition-transform"
          >
            Close Terms
          </button>
        </div>
      </div>
    </div>
  );
}