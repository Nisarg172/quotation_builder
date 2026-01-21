import  { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

import { getBillQuatationsbyId } from "@/Api/BillQuatation";
import QuotationPreview from "@/components/QuotationPreview";
import type { QuoteData } from "@/Types/type";

const BillQuotation = () => {
  const { id } = useParams();

  const [quote, setQuote] = useState<QuoteData>();


  const fetchData = async (id: string) => {
  try {
    const { data, error } = await getBillQuatationsbyId(id);

    if (error) {
      toast.error(error.message);
      return;
    }

    const filterData:QuoteData ={
      customerName:data.customer.name,
      address:data.customer.address,
      mobileNo:data.customer.mobile_no,
      gstNumber:data.gstNumber||undefined,
      coumpanyId:data.coumpany_id,
      isPurchesOrder:data.is_purches_order,
      gstOnInstallation:data.gst_on_installation,
      gstOnSupply:data.gst_on_supply,
      installationTotal:data.installation_total,
      supplyTotal:data.supply_total,
      grandTotal:data.grand_total,
      items:data.bill_quatation_product.map((ele,i)=>({
        sn:i+1,
        id:ele.id,
        catagoryName:ele.category_name,
        description:ele.description||"-",
        installation_amount:ele.installation_amount,
        make:ele.make||"-",
        makeModel:ele.model||"-",
        qty:ele.quantity,
        unitRate:ele.unit_rate,
        name:ele.name,
        image:ele?.image_url||undefined,
        
        

      }))



    } 

    setQuote(filterData);
  } catch (err) {
    toast.error("Something went wrong while fetching quotation");
    console.error(err);
  }
};

 useEffect(() => {
  if (!id) return;

  fetchData(id);
}, [id]);


 

  return (
    <div style={{ padding: "20px" }}>
      

      {/* WEB PREVIEW + PDF SOURCE */}
      {quote&&
      <QuotationPreview  data={quote} />}

    </div>
  );
};

export default BillQuotation;
