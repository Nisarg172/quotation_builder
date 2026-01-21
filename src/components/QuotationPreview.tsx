import { Fragment, useMemo, useState } from "react";
import type {
  QuoteData,
  QuoteItem,
} from "../Types/type";
import ImagePreviewModal from "./ui/ImagePreviewModal";
import TermsModal from "./TermsModal";
import { CoumpanyInfo } from "@/utils/const";
import { PDFDownloadLink } from "@react-pdf/renderer";
import QuotePDF from "./QuotePDF";
import StaffQuotePDF from "./StaffQuotePDF";
import { useAuth } from "@/hooks/useAuth";

const GST_RATE = 18;

export default function QuotePreview({ data }: { data: QuoteData }) {
  const { user } = useAuth();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showTerms, setShowTerms] = useState(false);

  const infoData =
    CoumpanyInfo.find(({ id }) => id == data.coumpanyId) || CoumpanyInfo[0];

  const groupedItems = useMemo(() => {
    return data.items.reduce<Record<string, QuoteItem[]>>((acc, item) => {
      if (!acc[item.catagoryName]) acc[item.catagoryName] = [];
      acc[item.catagoryName].push(item);
      return acc;
    }, {});
  }, [data.items]);

  const supplyGST = (data.supplyTotal * GST_RATE) / 100;
  const installGST = (data.installationTotal * GST_RATE) / 100;
  let srNo = 0;

  const grandTotal =
    data.supplyTotal +
    data.installationTotal +
    (data.gstOnSupply ? supplyGST : 0) +
    (data.gstOnInstallation ? installGST : 0);

  return (
    <>
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-xl p-4 sm:p-6 text-sm">
        {/* HEADER */}
        <h2 className="text-xl font-bold text-center mb-4">
          {data.isPurchesOrder ? "PURCHASE ORDER" : "QUOTATION"}
        </h2>

        {/* Info Section - Stacked on Mobile, Row on Desktop */}
        <div className="flex flex-col md:flex-row justify-between border-b pb-4 mb-6 gap-6">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            {infoData.logo && (
              <img src={infoData.logo} className="w-16 h-16 sm:w-20 sm:h-20 object-contain shrink-0" alt="Logo" />
            )}
            <div>
              <h1 className="text-lg font-bold text-gray-900">{infoData.companyName}</h1>
              <div className="text-gray-600 space-y-0.5">
                <p><span className="font-medium text-gray-800">GST:</span> {infoData.GST}</p>
                <p><span className="font-medium text-gray-800">Contact:</span> {infoData.contactName}</p>
                <p><span className="font-medium text-gray-800">Phone:</span> {infoData.contactNo}</p>
                <p><span className="font-medium text-gray-800">Email:</span> {infoData.email}</p>
                <p className="max-w-md mt-1 italic">{infoData.address}</p>
              </div>
            </div>
          </div>

          <div className="text-left md:text-right flex flex-col gap-0.5">
            <h3 className="font-bold text-gray-800 border-b md:border-none mb-1 md:mb-0">Billing Details:</h3>
            {data.gstNumber && (
              <p><span className="font-medium">GST:</span> {data.gstNumber || "-"}</p>
            )}
            <p><span className="font-medium">Customer:</span> {data.customerName || "-"}</p>
            <p><span className="font-medium">Mobile:</span> {data.mobileNo || "-"}</p>
            <p className="max-w-xs md:ml-auto md:text-right">
              <span className="font-medium">Address:</span> {data.address || "-"}
            </p>
          </div>
        </div>

        {/* TABLE WRAPPER - Horizontal Scroll for Mobile */}
        <div className="overflow-x-auto rounded-lg border border-gray-300">
          <table className="w-full min-w-[800px] border-collapse">
            <thead className="bg-gray-100 font-bold">
              <tr className="text-gray-700">
                <th className="border px-2 py-3 text-center w-[4%]">Sr</th>
                <th className="border px-3 py-3 text-left w-[35%]">Description</th>
                <th className="border px-2 py-3 text-center w-[14%]">Image</th>
                <th className="border px-2 py-1 text-center w-[10%]">Make</th>
                <th className="border px-2 py-1 text-center w-[10%]">Model</th>
                <th className="border px-2 py-3 text-center w-[4%]">Qty</th>
                <th className="border px-2 py-1 text-center w-[8%]">Unit Rate</th>
                <th className="border px-2 py-1 text-center w-[8%]">Installation</th>
                <th className="border px-2 py-3 text-center w-[8%]">Total</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-300">
              {Object.entries(groupedItems).map(([category, items]) => (
                <Fragment key={category}>
                  <tr className="bg-gray-50 font-bold text-blue-900 italic">
                    <td colSpan={9} className="border px-3 py-2 uppercase tracking-wide">
                      {category}
                    </td>
                  </tr>

                  {items.map((it) => {
                    const total = it.unitRate * it.qty + it.installation_amount * it.qty;
                    srNo++;
                    return (
                      <tr key={it.makeModel} className="hover:bg-blue-50 transition">
                        <td className="border p-2 text-center text-gray-500">{srNo}</td>
                        <td className="border p-2 text-gray-800 leading-tight">{it.description}</td>
                        <td className="border p-2 text-center">
                          {it.image && (
                            <img
                              src={it.image}
                              className="w-12 h-12 sm:w-14 sm:h-14 object-contain mx-auto cursor-pointer hover:scale-110 transition rounded border bg-white"
                              onClick={() => setPreviewImage(it.image!)}
                              alt="Item"
                            />
                          )}
                        </td>
                        <td className="border p-2 text-center">{it.make || "-"}</td>
                        <td className="border p-2 text-center">{it.makeModel || "-"}</td>
                        <td className="border p-2 text-center font-medium">{it.qty}</td>
                        <td className="border p-2 text-center">₹{it.unitRate.toFixed(2)}</td>
                        <td className="border p-2 text-center">₹{it.installation_amount.toFixed(2)}</td>
                        <td className="border p-2 font-bold text-center text-gray-900">
                          ₹{total.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Cards - Stacked on Mobile, Side-by-Side on Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {/* LEFT: PDF GENERATION CARD */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 sm:p-6 flex flex-col justify-center">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Actions</h2>

            <div className="flex flex-col gap-3">
              <PDFDownloadLink
                document={<QuotePDF data={{ ...data }} />}
                fileName={`${data.customerName.replace(/\s+/g, "_")}.pdf`}
              >
                {({ loading }) => (
                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition-all shadow-sm active:scale-95"
                  >
                    {loading ? "Generating..." : "📄 Download Quotation"}
                  </button>
                )}
              </PDFDownloadLink>

              {user && (
                <PDFDownloadLink
                  document={<StaffQuotePDF data={{ ...data }} />}
                  fileName={`${data.customerName.replace(/\s+/g, "_")}_staff_copy.pdf`}
                >
                  {({ loading }) => (
                    <button
                      type="button"
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-sm active:scale-95"
                    >
                      {loading ? "Generating..." : "🔒 Staff Copy PDF"}
                    </button>
                  )}
                </PDFDownloadLink>
              )}
            </div>
          </div>

          {/* RIGHT: SUMMARY CARD */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 space-y-3">
            <h3 className="font-bold text-gray-800 border-b pb-2 mb-2">Summary</h3>
            <div className="flex justify-between">
              <span className="text-gray-600">Supply Total</span>
              <span className="font-medium text-gray-900">₹{data.supplyTotal.toFixed(2)}</span>
            </div>

            {data.gstOnSupply && (
              <div className="flex justify-between text-gray-500 text-xs italic">
                <span>GST on Supply ({GST_RATE}%)</span>
                <span>₹{supplyGST.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between border-t pt-2 mt-2">
              <span className="text-gray-600">Installation Total</span>
              <span className="font-medium text-gray-900">₹{data.installationTotal.toFixed(2)}</span>
            </div>

            {data.gstOnInstallation && (
              <div className="flex justify-between text-gray-500 text-xs italic">
                <span>GST on Installation ({GST_RATE}%)</span>
                <span>₹{installGST.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between font-bold text-lg border-t-2 border-gray-300 pt-3 mt-3 text-blue-900">
              <span>Grand Total</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </div>

            {!data.isPurchesOrder && (
              <div className="pt-3 border-t flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowTerms(true)}
                  className="text-blue-600 text-sm font-semibold underline hover:text-blue-800 transition-colors"
                >
                  View Terms & Conditions
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ImagePreviewModal
        image={previewImage}
        onClose={() => setPreviewImage(null)}
      />

      <TermsModal open={showTerms} onClose={() => setShowTerms(false)} inforData={infoData}/>
    </>
  );
}