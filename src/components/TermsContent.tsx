interface Props {
  inforData: {
    id: number;
    companyName: string;
    logo: string;
    contactName: string;
    contactNo: string;
    email: string;
    GST: string;
    serviceEmail: string;
    serviceMo: string;
    address: string;
    accountNo: string;
    bankName: string;
    branch: string;
    IFSC: string;
  }
}

export default function TermsContent({ inforData }: Props) {
  return (
    <div className="text-sm text-gray-800 leading-relaxed pb-8">
      {/* TITLE - Responsive text size */}
      <div className="text-center mb-6 border-b pb-4">
        <h2 className="text-base sm:text-lg font-bold uppercase tracking-tight text-gray-900">
          {inforData.companyName}
        </h2>
        <p className="text-xs sm:text-sm font-medium text-gray-500 mt-1">
          Quotation Terms & Conditions
        </p>
      </div>

      <div className="space-y-6">
        {/* INTRO */}
        <p className="text-gray-600 italic px-1">
          These Terms and Conditions govern the supply of products and services by
          {inforData.companyName}. By accepting our quotation, you agree to be bound by these terms.
        </p>

        {/* SECTION 1 */}
        <section>
          <h3 className="flex items-center gap-2 font-bold text-gray-900 mb-3 border-l-4 border-blue-600 pl-3">
            1. PAYMENT OF SUPPLY & SERVICE
          </h3>
          
          <div className="ml-4 space-y-3">
            <div>
              <p className="font-semibold text-gray-700 mb-2">1. Payment Schedule:</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span><span className="font-bold text-gray-900">68% Advance:</span> Payable upon issuance of the Proforma Invoice (P.I.).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span><span className="font-bold text-gray-900">20% after Installation:</span> Payable within 2 days after completion.</span>
                </li>
              </ul>
            </div>

            <p className="text-gray-700">
              <span className="font-semibold">2. Payment Method:</span> Demand Draft (DD) or Cheque in favour of <span className="font-medium text-black">{inforData.companyName}</span>.
            </p>

            {/* BANK DETAILS - Responsive Grid */}
            <div className="border border-blue-100 rounded-xl p-4 bg-blue-50/50 mt-4 shadow-sm">
              <h4 className="text-xs font-bold text-blue-800 uppercase mb-3 tracking-wider">Bank Details for RTGS/NEFT</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-xs sm:text-sm">
                <p><span className="text-gray-500">Acc No:</span> <span className="font-mono font-bold">{inforData.accountNo}</span></p>
                <p><span className="text-gray-500">IFSC:</span> <span className="font-mono font-bold text-blue-700">{inforData.IFSC}</span></p>
                <p><span className="text-gray-500">Bank:</span> <span className="font-medium">{inforData.bankName}</span></p>
                <p><span className="text-gray-500">Branch:</span> <span className="font-medium">{inforData.branch}</span></p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2 */}
        <section>
          <h3 className="flex items-center gap-2 font-bold text-gray-900 mb-3 border-l-4 border-blue-600 pl-3">
            2. GOODS DELIVERY
          </h3>
          <div className="ml-4 space-y-2">
            <p>
              <span className="font-bold text-gray-700">1. Delivery Timeline:</span> Goods will be delivered within 3 to 25 days from the date of receipt of the Purchase Order (PO).
            </p>
            <p>
              <span className="font-bold text-gray-700">2. Delivery Lot:</span> All goods shall be delivered in a single lot.
            </p>
          </div>
        </section>

        {/* SECTION 3 */}
        <section>
          <h3 className="flex items-center gap-2 font-bold text-gray-900 mb-3 border-l-4 border-blue-600 pl-3">
            3. PRODUCT WARRANTY
          </h3>
          <div className="ml-4 space-y-3">
            <p>
              <span className="font-bold text-gray-700">1. Coverage:</span> Automation Products carry a <span className="underline decoration-blue-500 decoration-2">12-month warranty</span> from delivery against manufacturing defects.
            </p>
            <p className="bg-amber-50 p-3 rounded-lg border-l-4 border-amber-400 text-amber-900 text-xs sm:text-sm">
              <span className="font-bold">Exclusions:</span> Warranty is void if products are burnt, tampered with, or damaged by high voltage, water seepage, natural disasters, or improper use.
            </p>
          </div>
        </section>

        {/* SECTION 4 & 5 Combined for brevity on mobile */}
        <section className="bg-gray-50 p-4 rounded-xl">
           <h3 className="font-bold text-gray-900 mb-2">4. SCOPE of BUYER & JURISDICTION</h3>
           <p className="text-xs text-gray-600">
             Buyer is responsible for UPS power supply, site modifications, civil/electrical work, and internal fittings. Any disputes are subject to <span className="font-bold text-gray-900">Surat Jurisdiction</span>.
           </p>
        </section>

        {/* CONTACT - Quick Action Buttons for Mobile */}
        <div className="border-t pt-6 mt-8">
          <h3 className="font-bold text-gray-900 mb-4 text-center">Need Technical Support?</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <a 
              href={`mailto:${inforData.serviceEmail}`} 
              className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 p-3 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <span className="text-lg">✉️</span> {inforData.serviceEmail}
            </a>
            <a 
              href={`tel:${inforData.serviceMo}`} 
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-sm"
            >
              <span className="text-lg">📞</span> Call Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}