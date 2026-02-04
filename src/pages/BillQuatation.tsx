"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, FileWarning } from "lucide-react";

import { getBillQuatationsbyId } from "@/Api/BillQuatation";
import QuotationPreview from "@/components/QuotationPreview";
import type { QuoteData } from "@/Types/type";

const BillQuotation = () => {
  const { id } = useParams<{ id: string }>();
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = useCallback(async (targetId: string) => {
    try {
      setLoading(true);
      const { data, error } = await getBillQuatationsbyId(targetId);

      if (error) {
        toast.error(error.message);
        return;
      }

      if (!data) {
        toast.error("Quotation not found");
        return;
      }

      // Mapping logic separated for clarity
      const formattedData: QuoteData = {
        customerName: data.customer.name,
        address: data?.address,
        mobileNo: data.customer.mobile_no,
        gstNumber: data.gst_number || undefined,
        coumpanyId: data.coumpany_id,
        // isPurchesOrder: data.is_purches_order,
        type:data.type,
        gstOnInstallation: data.gst_on_installation,
        gstOnSupply: data.gst_on_supply,
        installationTotal: data.installation_total,
        supplyTotal: data.supply_total,
        grandTotal: data.grand_total,
        items: data.bill_quatation_product.map((ele: any, i: number) => ({
          sn: i + 1,
          id: ele.id,
          catagoryName: ele.category_name,
          description: ele.description || "-",
          installation_amount: ele.installation_amount,
          make: ele.make || "-",
          makeModel: ele.model || "-",
          qty: ele.quantity,
          unitRate: ele.unit_rate,
          name: ele.name,
          image: ele?.image_url || undefined,
        })),
      };

      setQuote(formattedData);
    } catch (err) {
      toast.error("Something went wrong while fetching quotation");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchData(id);
    }
  }, [id, fetchData]);

  // Loading State
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-gray-500 font-medium">Generating Preview...</p>
      </div>
    );
  }

  // Error/Empty State
  if (!quote) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <FileWarning className="w-12 h-12 text-gray-300 mb-2" />
        <h3 className="text-lg font-semibold text-gray-900">Quotation Not Found</h3>
        <p className="text-gray-500 max-w-sm">
          We couldn't retrieve the details for this quotation. It may have been deleted or the ID is invalid.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <QuotationPreview data={quote} />
      </div>
    </div>
  );
};

export default BillQuotation;