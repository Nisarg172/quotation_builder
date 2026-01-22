import React, { useEffect, useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import Select from "react-select";
import type {
  ProductWithAccessories,
  ProductWithCatagory,
  QuoteData,
  QuoteItem,
} from "../Types/type";
import { urlToBase64 } from "../utils/function";
import QuotePDF from "../components/QuotePDF";
import StaffQuotePDF from "../components/StaffQuotePDF";
import {
  getAccessoryWithCatagory,
  getProductWithCatagory,
} from "@/Api/CategoryApi";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { createCustomer, getCustomerByMobileNo } from "@/Api/customer";
import { createBillQuation } from "@/Api/BillQuatation";
import { createBillQuationProduct } from "@/Api/BillQuatationProduct";
import { useNavigate } from "react-router-dom";
import { IoClose } from "react-icons/io5";

export default function Home() {
  const navigate = useNavigate();
  const [quote, setQuote] = useState<QuoteData>({
    items: [],
    customerName: "",
    mobileNo: "",
    grandTotal: 0,
    supplyTotal: 0,
    installationTotal: 0,
    address: "",
    gstOnInstallation: false,
    gstOnSupply: false,
    isPurchesOrder: false,
    coumpanyId: 1,
    gstNumber: "",
  });

  const coumpanyOption = [
    { label: "Hm Technology", value: 1 },
    { label: "Torque Innovations India", value: 2 },
  ];

  const [products, setProducts] = useState<ProductWithCatagory[]>([]);
  const [accessories, setAccessories] = useState<ProductWithCatagory[]>([]);
  const [coumpany, setCoumpany] = useState(coumpanyOption[0]);

  async function addProduct(productId: string) {
    let foundProduct: ProductWithAccessories | null = null;
    for (const cat of products) {
      const prod = cat.product.find((p) => p.id === productId);
      if (prod) {
        foundProduct = { ...prod, catagoryName: cat.name };
        break;
      }
    }
    if (!foundProduct) return;

    const newItem: QuoteItem = {
      id: foundProduct.id,
      sn: quote.items.length + 1,
      name: foundProduct.name,
      description: foundProduct.description || "",
      make: foundProduct.make || "",
      makeModel: foundProduct.model || "",
      qty: foundProduct?.base_quantity||1,
      unitRate: foundProduct.price,
      image: foundProduct.image_url ? await urlToBase64(foundProduct.image_url) : "",
      installation_amount: foundProduct.installation_amount || 0,
      catagoryName: foundProduct.catagoryName,
    };

    const accessoryAsProduct: QuoteItem[] = await Promise.all(
      foundProduct?.accessories?.map(async ({ accessory }, index) => {
        return {
          id: accessory.id,
          sn: quote.items.length + 1 + index + 1,
          name: accessory.name,
          description: accessory.description || "",
          make: accessory.make || "",
          makeModel: accessory.model || "",
          qty: accessory.base_quantity || 1,
          unitRate: accessory.price,
          image: accessory.image_url ? await urlToBase64(accessory.image_url) : "",
          installation_amount: accessory.installation_amount || 0,
          catagoryName: foundProduct!.catagoryName,
        };
      }) || []
    );

    const items = [...quote.items, newItem, ...accessoryAsProduct];
    const mergedItems = items.reduce<QuoteItem[]>((acc, item) => {
      const existing = acc.find((i) => i.id === item.id);
      if (existing) {
        existing.qty += item.qty;
      } else {
        acc.push({ ...item });
      }
      return acc;
    }, []);
    updateQuote(mergedItems);
  }

  async function addAccessories(accessoriesId: string) {
    let foundProduct: ProductWithAccessories | null = null;
    for (const cat of accessories) {
      const prod = cat.product.find((p) => p.id === accessoriesId);
      if (prod) {
        foundProduct = { ...prod, catagoryName: cat.name };
        break;
      }
    }
    if (!foundProduct) return;
    const newItem: QuoteItem = {
      id: foundProduct.id,
      sn: quote.items.length + 1,
      name: foundProduct.name,
      description: foundProduct.description || "",
      make: foundProduct.make || "",
      makeModel: foundProduct.model || "",
      qty: 1,
      unitRate: foundProduct.price,
      image: foundProduct.image_url ? await urlToBase64(foundProduct.image_url) : "",
      installation_amount: foundProduct.installation_amount || 0,
      catagoryName: foundProduct.catagoryName,
    };

    const items = [...quote.items, newItem];
    const mergedItems = items.reduce<QuoteItem[]>((acc, item) => {
      const existing = acc.find((i) => i.id === item.id);
      if (existing) {
        existing.qty += item.qty;
      } else {
        acc.push({ ...item });
      }
      return acc;
    }, []);
    updateQuote(mergedItems);
  }

  function updateItem(idx: number, changes: Partial<QuoteItem>) {
    const items = quote.items.map((it, i) => (i !== idx ? it : { ...it, ...changes }));
    updateQuote(items);
  }

  function updateInstallation(idx: number, value: number) {
    const items = quote.items.map((it, i) =>
      i !== idx ? it : { ...it, installation_amount: value, totalInstallation: it.qty * value }
    );
    updateQuote(items);
  }

  function removeItem(idx: number) {
    const items = quote.items.filter((_, i) => i !== idx).map((it, i) => ({ ...it, sn: i + 1 }));
    updateQuote(items);
  }

  function updateQuote(items: QuoteItem[]) {
    const supplyTotal = Number(items.reduce((sum, it) => sum + it.unitRate * it.qty, 0).toFixed(2));
    const installationTotal = Number(items.reduce((sum, it) => sum + it.installation_amount * it.qty, 0).toFixed(2));
    setQuote({
      ...quote,
      items,
      supplyTotal,
      installationTotal,
      grandTotal: supplyTotal + installationTotal,
    });
  }

  const savepdfAndShare = async (data: QuoteData) => {
    let customerId: string | null = null;
    const { data: customerData, error: customerError } = await getCustomerByMobileNo(data.mobileNo);
    if (customerError) {
      toast.error(customerError.message);
    } else if (customerData?.length === 0 || !customerData) {
      const { data: customeCreateData, error: customerCreateError } = await createCustomer({
        address: data.address,
        mobile_no: data.mobileNo,
        name: data.customerName,
      });
      if (customerCreateError) {
        toast.error(customerCreateError.message);
      } else {
        customerId = customeCreateData.id;
      }
    } else {
      customerId = customerData?.at(0)?.id || null;
    }

    if (customerId) {
      const billQuatioPyloade = {
        customer_id: customerId,
        grand_total: data.grandTotal,
        gst_on_installation: data.gstOnInstallation,
        gst_on_supply: data.gstOnSupply,
        installation_total: data.installationTotal,
        is_purches_order: data.isPurchesOrder,
        supply_total: data.supplyTotal,
        coumpany_id: data.coumpanyId,
        gst_number: data?.gstNumber || null,
      };
      const { data: billQuationData, error: billQuationError } = await createBillQuation(billQuatioPyloade);
      if (billQuationError) {
        toast.error(billQuationError.message);
      } else {
        const billQuationProductPayload = data.items.map((ele) => ({
          product_id: ele.id,
          bill_quatation_id: billQuationData.id,
          quantity: ele.qty,
          unit_rate: ele.unitRate,
          installation_amount: ele.installation_amount,
          category_name: ele.catagoryName,
        }));

        const { error: createBillQuationProductError } = await createBillQuationProduct(billQuationProductPayload);
        if (createBillQuationProductError) toast.error(createBillQuationProductError.message);
      }

      const link = `${import.meta.env.VITE_BASE_URL}pdf/${billQuationData?.id}`;
      const message = `Please check this quotation:\n${link}`;
      const whatsappUrl = `https://wa.me/${data.mobileNo}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");
      navigate(`/pdf/${billQuationData?.id}`);
    }
  };

  const groupedItems = quote.items.reduce<Record<string, QuoteItem[]>>((acc, item) => {
    if (!acc[item.catagoryName]) acc[item.catagoryName] = [];
    acc[item.catagoryName].push(item);
    return acc;
  }, {});

  const productGroupedOptions = products.map((cat) => ({
    label: cat.name,
    options: cat.product
      .filter((p) => !quote.items.some((it) => it.name === p.name))
      .map((p) => ({ value: p.id, label: p.name })),
  }));

  const accessoryGroupedOptions = accessories.map((cat) => ({
    label: cat.name,
    options: cat.product
      .filter((p) => !quote.items.some((it) => it.name === p.name))
      .map((p) => ({ value: p.id, label: p.name })),
  }));

  const fetchProducts = async () => {
    const { data, error } = await getProductWithCatagory();
    if (error) toast.error(error.message);
    else setProducts(data || []);
  };

  const fetchAccessories = async () => {
    const { data, error } = await getAccessoryWithCatagory();
    if (error) toast.error(error.message);
    else setAccessories(data || []);
  };

  useEffect(() => {
    fetchProducts();
    fetchAccessories();
  }, []);

  return (
    <div className="p-2 sm:p-4 bg-gray-50 min-h-screen">
      {/* Form Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Customer Name */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">Customer Name *</label>
            <input
              type="text"
              className={`w-full border rounded-md px-3 py-2 text-sm ${!quote.customerName.trim() ? "border-red-300 bg-red-50" : "border-gray-300"}`}
              value={quote.customerName}
              onChange={(e) => setQuote({ ...quote, customerName: e.target.value })}
            />
          </div>

          {/* Mobile */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">Mobile Number *</label>
            <input
              type="tel"
              className={`w-full border rounded-md px-3 py-2 text-sm ${!/^[6-9]\d{9}$/.test(quote.mobileNo.trim()) ? "border-red-300 bg-red-50" : "border-gray-300"}`}
              value={quote.mobileNo}
              onChange={(e) => setQuote({ ...quote, mobileNo: e.target.value.replace(/\D/g, "").slice(0, 10) })}
            />
          </div>

          {/* Address */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">Address *</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              value={quote.address || ""}
              onChange={(e) => setQuote({ ...quote, address: e.target.value })}
            />
          </div>

          {/* Product Select */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">Select Product</label>
            <Select
              options={productGroupedOptions}
              onChange={(s) => s && addProduct((s as any).value)}
              className="text-sm"
            />
          </div>

          {/* Accessories Select */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">Select Accessories</label>
            <Select
              options={accessoryGroupedOptions}
              onChange={(s) => s && addAccessories((s as any).value)}
              className="text-sm"
            />
          </div>

          {/* Company & PO Toggle */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">PO Order</label>
              <button
                onClick={() => setQuote({ ...quote, isPurchesOrder: !quote.isPurchesOrder })}
                className={`w-11 h-6 rounded-full transition-colors relative ${quote.isPurchesOrder ? "bg-blue-600" : "bg-gray-300"}`}
              >
                <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${quote.isPurchesOrder ? "translate-x-5" : ""}`} />
              </button>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Company</label>
              <Select
                options={coumpanyOption}
                defaultValue={coumpanyOption[0]}
                onChange={(s) => s && setCoumpany(s)}
                className="text-xs sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table Section - Horizontal Scroll on Mobile */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] table-auto text-sm text-center">
            <thead className="bg-gray-50 text-gray-600 font-medium">
              <tr>
                <th className="p-3 border-b">Sr.</th>
                <th className="p-3 border-b text-left">Description</th>
                <th className="p-3 border-b">Image</th>
                <th className="p-3 border-b">Qty</th>
                <th className="p-3 border-b">Rate</th>
                <th className="p-3 border-b">Inst.</th>
                <th className="p-3 border-b">Total</th>
                <th className="p-3 border-b"></th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedItems).map(([category, items]) => (
                <React.Fragment key={category}>
                  <tr className="bg-blue-50/50">
                    <td colSpan={8} className="p-2 text-left font-bold text-blue-700 px-4">
                      {category}
                    </td>
                  </tr>
                  {items.map((it) => {
                    const total = (it.unitRate * it.qty) + (it.installation_amount * it.qty);
                    return (
                      <tr key={it.sn} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3 border-b text-gray-500">{it.sn}</td>
                        <td className="p-3 border-b text-left max-w-xs">
                          <div className="font-medium text-gray-900">{it.name}</div>
                          <div className="text-xs text-gray-500 truncate">{it.description}</div>
                        </td>
                        <td className="p-3 border-b">
                          {it.image && <img src={it.image} className="w-10 h-10 object-contain mx-auto" alt="" />}
                        </td>
                        <td className="p-3 border-b">
                          <input
                            type="number"
                            className="w-14 border rounded p-1 text-center"
                            value={it.qty || ""}
                            onChange={(e) => updateItem(it.sn - 1, { qty: Number(e.target.value) })}
                          />
                        </td>
                        <td className="p-3 border-b">
                          <input
                            type="number"
                            className="w-20 border rounded p-1 text-center"
                            value={it.unitRate || ""}
                            onChange={(e) => updateItem(it.sn - 1, { unitRate: Number(e.target.value) })}
                          />
                        </td>
                        <td className="p-3 border-b">
                          <input
                            type="number"
                            className="w-20 border rounded p-1 text-center"
                            value={it.installation_amount || ""}
                            onChange={(e) => updateInstallation(it.sn - 1, Number(e.target.value))}
                          />
                        </td>
                        <td className="p-3 border-b font-semibold">₹{total.toFixed(2)}</td>
                        <td className="p-3 border-b">
                          <button onClick={() => removeItem(it.sn - 1)} className="text-red-500 hover:bg-red-50 p-1 rounded-full">
                            <IoClose size={20} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Section */}
      {quote.items.length > 0 && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Totals Calculation */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex justify-between text-gray-600">
              <span>Supply Subtotal</span>
              <span className="font-semibold">₹{quote.supplyTotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={quote.gstOnSupply}
                  onChange={(e) => setQuote({ ...quote, gstOnSupply: e.target.checked })}
                  className="rounded text-blue-600"
                />
                GST on Supply (18%)
              </label>
              <span className="text-sm font-medium">
                ₹{quote.gstOnSupply ? (quote.supplyTotal * 0.18).toFixed(2) : "0.00"}
              </span>
            </div>
            
            <div className="flex justify-between text-gray-600">
              <span>Installation Subtotal</span>
              <span className="font-semibold">₹{quote.installationTotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={quote.gstOnInstallation}
                  onChange={(e) => setQuote({ ...quote, gstOnInstallation: e.target.checked })}
                  className="rounded text-blue-600"
                />
                GST on Installation (18%)
              </label>
              <span className="text-sm font-medium">
                ₹{quote.gstOnInstallation ? (quote.installationTotal * 0.18).toFixed(2) : "0.00"}
              </span>
            </div>
            {(quote.gstOnSupply || quote.gstOnInstallation) && (
              <div className="pt-2">
                <input
                  type="text"
                  placeholder="Enter GST Number"
                  className="w-full border rounded-md px-3 py-2 text-sm uppercase"
                  value={quote.gstNumber}
                  onChange={(e) => setQuote({ ...quote, gstNumber: e.target.value.toUpperCase() })}
                />
              </div>
            )}
            <div className="pt-4 border-t flex justify-between items-center">
              <span className="text-lg font-bold">Grand Total</span>
              <span className="text-2xl font-black text-blue-600">
                ₹{(
                  quote.supplyTotal +
                  quote.installationTotal +
                  (quote.gstOnSupply ? quote.supplyTotal * 0.18 : 0) +
                  (quote.gstOnInstallation ? quote.installationTotal * 0.18 : 0)
                ).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center gap-4">
            <h3 className="text-lg font-bold text-center">Export Options</h3>
            {quote.customerName && quote.mobileNo.length === 10 ? (
              <>
                <Button className="w-full py-6 text-lg" onClick={() => savepdfAndShare(quote)}>
                  💾 Save & Share via WhatsApp
                </Button>

                {/* <PDFDownloadLink
                  document={<QuotePDF data={{ ...quote, coumpanyId: coumpany.value }} />}
                  fileName={`${quote.customerName}_Quotation.pdf`}
                >
                  {({ loading }) => (
                    <button className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors">
                      {loading ? "Generating..." : "📄 Download Customer Copy"}
                    </button>
                  )}
                </PDFDownloadLink>

                <PDFDownloadLink
                  document={<StaffQuotePDF data={{ ...quote }} />}
                  fileName={`${quote.customerName}_Staff_Copy.pdf`}
                >
                  {({ loading }) => (
                    <button className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                      {loading ? "Generating..." : "🔒 Download Staff Copy"}
                    </button>
                  )}
                </PDFDownloadLink> */}
              </>
            ) : (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg text-amber-800 text-sm text-center">
                Please complete customer details to enable export.
              </div>
            )}
          </div> 
        </div>
      )}
    </div>
  );
}