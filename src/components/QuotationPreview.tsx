import  { Fragment, useMemo, useState } from "react";
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
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-xl p-6 text-sm">
        {/* HEADER */}
        <h2 className="text-xl font-bold text-center">
          {data.isPurchesOrder ? "PURCHASE ORDER" : "QUOTATION"}
        </h2>
        <div className="flex justify-between border-b pb-4 mb-6">
          <div className="gap-4">
            {infoData.logo && (
              <img src={infoData.logo} className="w-20  h-20 object-contain" />
            )}
            <div>
              <h1 className="text-lg font-bold">{infoData.companyName}</h1>
              <p>GST: {infoData.GST}</p>
              <p>Contact: {infoData.contactName}</p>
              <p>Phone: {infoData.contactNo}</p>
              <p>Email: {infoData.email}</p>
              <p className="max-w-md">{infoData.address}</p>
            </div>
          </div>

          <div className="text-left mt-16">
            {data.gstNumber && (
              <p className="max-w-xs">GST:{data.gstNumber || "-"}</p>
            )}
            <p className="max-w-xs">Customer: {data.customerName || "-"}</p>
            <p>Mobile: {data.mobileNo || "-"}</p>
            <p className="max-w-xs">Address: {data.address || "-"}</p>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300">
            <thead className="sticky top-0 bg-gray-100 font-bold">
              {/* MAIN HEADER */}
              <tr className="text-gray-700">
                <th className="border px-2 py-3 text-center w-[4%]">Sr</th>

                <th className="border px-3 py-3 text-left w-[35%]">
                  Description
                </th>

                <th className="border px-2 py-3 text-center w-[14%]">Image</th>

                <th className="border px-2 py-1 text-center w-[10%]">Make</th>

                <th className="border px-2 py-1 text-center w-[10%]">Model</th>

                <th className="border px-2 py-3 text-center w-[4%]">Qty</th>

                <th className="border px-2 py-1 text-center w-[8%] ">
                  Unit Rate
                </th>

                <th className="border px-2 text-centerpy-1 w-[8%] ">
                  Installation amount
                </th>

                <th className="border px-2 py-3 text-center w-[8%]">Total</th>
              </tr>
            </thead>

            <tbody>
              {Object.entries(groupedItems).map(([category, items]) => (
                <Fragment key={category}>
                  <tr className="bg-gray-200 font-semibold">
                    <td colSpan={11} className="border px-3 py-2">
                      {category}
                    </td>
                  </tr>

                  {items.map((it) => {
                    // const supply = it.unit_rate * it.quantity;
                    const total =
                      it.unitRate * it.qty + it.installation_amount * it.qty;
                    srNo++;
                    return (
                      <tr
                        key={it.makeModel}
                        className="hover:bg-blue-50 transition"
                      >
                        <td className="border p-2 text-center">{srNo}</td>
                        <td className="border p-2">{it.description}</td>

                        <td className="border p-2 text-center">
                          {it.image && (
                            <img
                              src={it.image}
                              className="w-14 h-14 object-contain mx-auto cursor-pointer hover:scale-110 transition"
                              onClick={() => setPreviewImage(it.image!)}
                            />
                          )}
                        </td>

                        <td className="border p-2 text-center">
                          {it.make || "-"}
                        </td>
                        <td className="border p-2 text-center">
                          {it.makeModel || "-"}
                        </td>

                        <td className="border p-2 text-center">{it.qty}</td>

                        <td className="border p-2 text-center">
                          {it.unitRate.toFixed(2)}
                        </td>

                        <td className="border p-2 text-center">
                          {it.installation_amount.toFixed(2)}
                        </td>

                        <td className="border p-2 font-semibold text-center">
                          {total.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          {/* LEFT: PDF GENERATION CARD */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                Downalod PDF
              </h2>
            </div>

            <div className="flex flex-col gap-4">
              {/* CUSTOMER PDF */}
              <PDFDownloadLink
                document={<QuotePDF data={{ ...data }} />}
                fileName={`${data.customerName.replace(/\s+/g, "_")}.pdf`}
              >
                {({ loading }) => (
                  <button
                    type="button"
                    className="
              w-full flex items-center justify-center gap-2
              px-6 py-3 rounded-xl
              bg-green-600 hover:bg-green-700
              text-white font-semibold
              transition-all shadow-sm
            "
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Generating PDF...
                      </>
                    ) : (
                      <>📄 Customer Quotation </>
                    )}
                  </button>
                )}
              </PDFDownloadLink>

              {/* STAFF PDF */}
              {user && (
                <PDFDownloadLink
                  document={<StaffQuotePDF data={{ ...data }} />}
                  fileName={`${data.customerName.replace(/\s+/g, "_")}_staff_copy.pdf`}
                >
                  {({ loading }) => (
                    <button
                      type="button"
                      className="
              w-full flex items-center justify-center gap-2
              px-6 py-3 rounded-xl
              bg-blue-600 hover:bg-blue-700
              text-white font-semibold
              transition-all shadow-sm
            "
                    >
                      {loading ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Generating PDF...
                        </>
                      ) : (
                        <>🔒 Staff Copy </>
                      )}
                    </button>
                  )}
                </PDFDownloadLink>
              )}
            </div>
          </div>

          {/* RIGHT: SUMMARY CARD */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Supply Total</span>
              <span className="font-medium">
                ₹ {data.supplyTotal.toFixed(2)}
              </span>
            </div>

            {data.gstOnSupply && (
              <div className="flex justify-between text-gray-500">
                <span>GST ({GST_RATE}%)</span>
                <span>₹ {supplyGST.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-gray-600">Installation Total</span>
              <span className="font-medium">
                ₹ {data.installationTotal.toFixed(2)}
              </span>
            </div>

            {data.gstOnInstallation && (
              <div className="flex justify-between text-gray-500">
                <span>GST ({GST_RATE}%)</span>
                <span>₹ {installGST.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between font-bold text-base border-t pt-3 mt-3">
              <span>Grand Total</span>
              <span>₹ {grandTotal.toFixed(2)}</span>
            </div>

            {!data.isPurchesOrder && (
              <div className="pt-3 border-t ">
                <button
                  type="button"
                  onClick={() => setShowTerms(true)}
                  className="
            text-blue-600 text-sm
            underline
            hover:text-blue-800
            transition-colors
          "
                >
                  Terms & Conditions
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
