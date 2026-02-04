import React, { useEffect, useState, type FC } from "react";
import Select from "react-select";
import type {
  ProductWithAccessories,
  ProductWithCatagory,
  QuoteData,
  QuoteItem,
} from "../Types/type";
import { urlToBase64 } from "../utils/function";
import {
  getAccessoryWithCatagory,
  getProductWithCatagory,
} from "@/Api/CategoryApi";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { createCustomer, getCustomerByMobileNo } from "@/Api/customer";
import { createBillQuation } from "@/Api/BillQuatation";
import { createBillQuationProduct } from "@/Api/BillQuatationProduct";
import { useNavigate } from "react-router-dom";
import { IoClose } from "react-icons/io5";
import { CoumpanyInfo } from "@/utils/const";
import type { Database } from "@/Types/supabase";
import { FaWhatsapp } from "react-icons/fa";
import { FiCopy } from "react-icons/fi";

const Home: FC<{ quateData?: QuoteData }> = ({ quateData }) => {
  const navigate = useNavigate();
  const documentTypeOption = [
    { label: "Quotation", value: "quotation" },
    { label: "Purchase Order", value: "Purchase Order" },
    { label: "Proforma Invoice", value: "Proforma Invoice" },
  ];
  const [quote, setQuote] = useState<QuoteData>(
    quateData ?? {
      items: [],
      customerName: "",
      mobileNo: "",
      grandTotal: 0,
      supplyTotal: 0,
      installationTotal: 0,
      address: "",
      gstOnInstallation: false,
      gstOnSupply: false,
      // isPurchesOrder: false,
      type: "Quotation",
      coumpanyId: 1,
      gstNumber: "",
    },
  );

  const coumpanyOption = CoumpanyInfo.map(({ companyName, id }) => ({
    label: companyName,
    value: id,
  }));

  const [products, setProducts] = useState<ProductWithCatagory[]>([]);
  const [accessories, setAccessories] = useState<ProductWithCatagory[]>([]);

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
      qty: foundProduct?.base_quantity || 1,
      unitRate: foundProduct.price,
      image: foundProduct.image_url
        ? await urlToBase64(foundProduct.image_url)
        : "",
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
          image: accessory.image_url
            ? await urlToBase64(accessory.image_url)
            : "",
          installation_amount: accessory.installation_amount || 0,
          catagoryName: foundProduct!.catagoryName,
        };
      }) || [],
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
      image: foundProduct.image_url
        ? await urlToBase64(foundProduct.image_url)
        : "",
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
    const items = quote.items.map((it, i) =>
      i !== idx ? it : { ...it, ...changes },
    );
    updateQuote(items);
  }

  function updateInstallation(idx: number, value: number) {
    const items = quote.items.map((it, i) =>
      i !== idx
        ? it
        : {
            ...it,
            installation_amount: value,
            totalInstallation: it.qty * value,
          },
    );
    updateQuote(items);
  }

  function removeItem(idx: number) {
    const items = quote.items
      .filter((_, i) => i !== idx)
      .map((it, i) => ({ ...it, sn: i + 1 }));
    updateQuote(items);
  }

  function updateQuote(items: QuoteItem[]) {
    const supplyTotal = Number(
      items.reduce((sum, it) => sum + it.unitRate * it.qty, 0).toFixed(2),
    );
    const installationTotal = Number(
      items
        .reduce((sum, it) => sum + it.installation_amount * it.qty, 0)
        .toFixed(2),
    );
    setQuote({
      ...quote,
      items,
      supplyTotal,
      installationTotal,
      grandTotal: supplyTotal + installationTotal,
    });
  }

  const savepdfAndShare = async ({
    data,
    isCopyLink,
  }: {
    data: QuoteData;
    isCopyLink: boolean;
  }) => {
    let customerId: string | null = null;
    const { data: customerData, error: customerError } =
      await getCustomerByMobileNo(data.mobileNo);
    if (customerError) {
      toast.error(customerError.message);
    } else if (customerData?.length === 0 || !customerData) {
      const { data: customeCreateData, error: customerCreateError } =
        await createCustomer({
          address: data?.address || "-",
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
        is_purches_order: true,
        type: data.type,
        supply_total: data.supplyTotal,
        coumpany_id: data.coumpanyId,
        gst_number: data?.gstNumber || null,
        address: data?.address,
      };
      const { data: billQuationData, error: billQuationError } =
        await createBillQuation(billQuatioPyloade);
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

        const { error: createBillQuationProductError } =
          await createBillQuationProduct(billQuationProductPayload);
        if (createBillQuationProductError)
          toast.error(createBillQuationProductError.message);
      }

      const link = `${import.meta.env.VITE_BASE_URL}pdf/${billQuationData?.id}`;
      if (isCopyLink) {
        navigator.clipboard.writeText(link);
        toast.success("Link copy!");
      } else {
        const message = `Please check this quotation:\n${link}`;
        const whatsappUrl = `https://wa.me/${data.mobileNo}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank");
      }
      navigate(`/pdf/${billQuationData?.id}`);
    }
  };

  const groupedItems = quote.items.reduce<Record<string, QuoteItem[]>>(
    (acc, item) => {
      if (!acc[item.catagoryName]) acc[item.catagoryName] = [];
      acc[item.catagoryName].push(item);
      return acc;
    },
    {},
  );

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
    <div className="p-2 sm:p-4 bg-brand min-h-screen">
      {/* Form Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Customer Name */}
          <div className="flex flex-col gap-1">
            <Input
              label="Customer Name"
              required
              value={quote.customerName}
              onChange={(e) =>
                setQuote({ ...quote, customerName: e.target.value })
              }
              errorMessage={
                !quote.customerName.trim()
                  ? "Customer name is required"
                  : undefined
              }
            />
          </div>

          {/* Mobile */}
          <div className="flex flex-col gap-1">
            <Input
              label="Mobile Number"
              required
              type="tel"
              value={quote.mobileNo}
              onChange={(e) =>
                setQuote({
                  ...quote,
                  mobileNo: e.target.value.replace(/\D/g, "").slice(0, 10),
                })
              }
              errorMessage={
                !/^[6-9]\d{9}$/.test(quote.mobileNo.trim())
                  ? "Enter valid 10-digit mobile number"
                  : undefined
              }
            />
          </div>

          {/* Address */}
          <div className="flex flex-col gap-1">
            <Input
              label="Address"
              required
              value={quote.address || ""}
              onChange={(e) => setQuote({ ...quote, address: e.target.value })}
            />
          </div>

          {/* Product Select */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">
              Select Product
            </label>
            <Select
              options={productGroupedOptions}
              onChange={(s) => s && addProduct((s as any).value)}
              className="text-sm z-1"
            />
          </div>

          {/* Accessories Select */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">
              Select Accessories
            </label>
            <Select
              options={accessoryGroupedOptions}
              onChange={(s) => s && addAccessories((s as any).value)}
              className="text-sm"
            />
          </div>

          {/* Company & PO Toggle */}
          <div className="grid grid-cols-2 gap-4">
            {/* Document Type */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">
                Document Type
              </label>

              <Select
                options={documentTypeOption}
                value={documentTypeOption.find((o) => o.value === quote.type)}
                onChange={(s) =>
                  s &&
                  setQuote((prev) => ({
                    ...prev,
                    type: s.value as Database["public"]["Enums"]["bill_type"],
                  }))
                }
                className="text-xs sm:text-sm"
              />
            </div>

            {/* Company */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">
                Company
              </label>

              <Select
                options={coumpanyOption}
                value={coumpanyOption.find((o) => o.value === quote.coumpanyId)}
                onChange={(s) =>
                  s && setQuote((prev) => ({ ...prev, coumpanyId: s.value }))
                }
                className="text-xs sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-transparent md:bg-white md:rounded-lg md:shadow-sm md:border md:border-gray-200 transition-all duration-300">
        {/* DESKTOP VIEW (Remains exactly as your original) */}
        <div className="hidden md:block overflow-x-auto">
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
                  <tr className="bg-brand-soft/60">
                    <td
                      colSpan={8}
                      className="p-2 text-left font-bold text-brand-primary px-4"
                    >
                      {category}
                    </td>
                  </tr>
                  {items.map((it) => {
                    const total =
                      it.unitRate * it.qty + it.installation_amount * it.qty;
                    return (
                      <tr
                        key={it.sn}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-3 border-b text-gray-500">{it.sn}</td>
                        <td className="p-3 border-b text-left max-w-xs">
                          <div className="font-medium text-gray-900">
                            {it.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {it.description}
                          </div>
                        </td>
                        <td className="p-3 border-b">
                          {it.image && (
                            <img
                              src={it.image}
                              className="w-10 h-10 object-contain mx-auto"
                              alt=""
                            />
                          )}
                        </td>
                        <td className="p-3 border-b align-top">
                          <Input
                            type="number"
                            value={String(it.qty || "")}
                            onChange={(e) =>
                              updateItem(it.sn - 1, {
                                qty: Number(e.target.value),
                              })
                            }
                            className="w-20"
                          />
                        </td>
                        <td className="p-3 border-b align-top">
                          <Input
                            type="number"
                            value={String(it.unitRate || "")}
                            onChange={(e) =>
                              updateItem(it.sn - 1, {
                                unitRate: Number(e.target.value),
                              })
                            }
                            className="w-24"
                          />
                        </td>
                        <td className="p-3 border-b align-top">
                          <Input
                            type="number"
                            value={String(it.installation_amount || "")}
                            onChange={(e) =>
                              updateInstallation(
                                it.sn - 1,
                                Number(e.target.value),
                              )
                            }
                            className="w-24"
                          />
                        </td>
                        <td className="p-3 border-b font-semibold">
                          ₹{total.toFixed(2)}
                        </td>
                        <td className="p-3 border-b">
                          <button
                            onClick={() => removeItem(it.sn - 1)}
                            className="text-red-500 hover:bg-red-50 p-1 rounded-full"
                          >
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

        {/* MOBILE VIEW (High-End Animated Cards) */}
        <div className="md:hidden space-y-8 pb-24 px-4">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category} className="space-y-4">
              <div className="sticky top-0 bg-brand-gradient/80 backdrop-blur-md py-4 border-b-2 border-transparent mb-2">
                <h3 className="text-lg font-black text-brand-primary tracking-tighter uppercase">
                  {category}
                </h3>
              </div>

              {items.map((it) => {
                const total =
                  it.unitRate * it.qty + it.installation_amount * it.qty;
                return (
                  <div
                    key={it.sn}
                    className="relative group overflow-hidden bg-white rounded-xl  shadow-xs transition-all duration-500 hover:-translate-y-2 mobile-hover-card"
                  >
                    {/* DIAGONAL HOVER BACKGROUND LAYER */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700 translate-x-[100%] translate-y-[100%] group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-700 ease-in-out z-0 opacity-[0.03] md:opacity-100" />

                    <div className="relative z-10 p-5">
                      {/* Header: ID and Delete */}
                      <div className="flex justify-between items-center mb-4">
                        <span className="bg-brand-soft text-brand-primary text-[10px] font-black px-3 py-1 rounded-full">
                          ITEM #{it.sn}
                        </span>
                        <button
                          onClick={() => removeItem(it.sn - 1)}
                          className="bg-red-50 text-red-500 p-2 rounded-xl active:bg-red-500 active:text-white transition-all"
                        >
                          <IoClose size={20} />
                        </button>
                      </div>

                      {/* Content: Image + Text */}
                      <div className="flex gap-4 mb-6">
                        <div className="w-24 h-24 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center p-2">
                          {it.image ? (
                            <img
                              src={it.image}
                              className="max-h-full object-contain drop-shadow-md"
                              alt=""
                            />
                          ) : (
                            <div className="text-gray-300 font-bold text-[10px]">
                              NO IMAGE
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-gray-900 font-black text-lg leading-tight group-hover:text-brand-primary transition-colors duration-300">
                            {it.name}
                          </h4>
                          <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-snug">
                            {it.description}
                          </p>
                        </div>
                      </div>

                      {/* Inputs: 3-Column Glassmorphism style */}
                      <div className="grid grid-cols-3 gap-3 mt-4">
                        {[
                          { label: "Quantity", val: it.qty, k: "qty" },
                          {
                            label: "Unit Rate",
                            val: it.unitRate,
                            k: "unitRate",
                          },
                          {
                            label: "Installation",
                            val: it.installation_amount,
                            k: "installation_amount",
                          },
                        ].map((f) => (
                          <div
                            key={f.k}
                            className="relative group/input bg-gray-100/50 rounded-2xl border border-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] transition-all duration-300 focus-within:bg-white focus-within:shadow-xl focus-within:shadow-[0_0_0_1px_rgba(199,158,105,0.25)] focus-within:-translate-y-0.5"
                          >
                            {/* Small accent dot that lights up on focus */}
                            <div className="absolute top-2 right-2 w-1 h-1 rounded-full bg-gray-300 group-focus-within/input:bg-brand-primary transition-colors" />

                            <div className="p-3">
                              <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 group-focus-within/input:text-brand-primary transition-colors">
                                {f.label}
                              </label>

                              <div className="flex items-baseline">
                                {f.k !== "qty" && (
                                  <span className="text-[10px] font-bold text-gray-400 mr-0.5 group-focus-within/input:text-brand-primary">
                                    ₹
                                  </span>
                                )}
                                <input
                                  type="number"
                                  className="w-full bg-transparent  p-0 text-sm font-black text-gray-800  border rounded-xs px-1 placeholder-gray-300"
                                  placeholder="0"
                                  value={f.val || ""}
                                  onChange={(e) =>
                                    f.k === "installation_amount"
                                      ? updateInstallation(
                                          it.sn - 1,
                                          Number(e.target.value),
                                        )
                                      : updateItem(it.sn - 1, {
                                          [f.k]: Number(e.target.value),
                                        })
                                  }
                                />
                              </div>
                            </div>

                            {/* Modern Gradient Bottom Border */}
                            <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-brand-gradient rounded-full transition-all duration-500 ease-out group-focus-within/input:w-full" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer: The Big Total */}
                    <div className="relative z-10 bg-brand-gradient p-5 flex justify-between items-center transition-all duration-500">
                      <span className=" text-[14px] text-white font-bold  tracking-widest">
                        Total
                      </span>
                      <div className="text-white font-black text-[14px] animate-pulse-subtle">
                        ₹{total.toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Summary Section */}
      {quote.items.length > 0 && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Totals Calculation */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex justify-between text-gray-600">
              <span>Supply Subtotal</span>
              <span className="font-semibold">
                ₹{quote.supplyTotal.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={quote.gstOnSupply}
                  onChange={(e) =>
                    setQuote({ ...quote, gstOnSupply: e.target.checked })
                  }
                  className="rounded text-blue-600"
                />
                GST on Supply (18%)
              </label>
              <span className="text-sm font-medium">
                ₹
                {quote.gstOnSupply
                  ? (quote.supplyTotal * 0.18).toFixed(2)
                  : "0.00"}
              </span>
            </div>

            <div className="flex justify-between text-gray-600">
              <span>Installation Subtotal</span>
              <span className="font-semibold">
                ₹{quote.installationTotal.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={quote.gstOnInstallation}
                  onChange={(e) =>
                    setQuote({ ...quote, gstOnInstallation: e.target.checked })
                  }
                  className="rounded text-blue-600"
                />
                GST on Installation (18%)
              </label>
              <span className="text-sm font-medium">
                ₹
                {quote.gstOnInstallation
                  ? (quote.installationTotal * 0.18).toFixed(2)
                  : "0.00"}
              </span>
            </div>
            {(quote.gstOnSupply || quote.gstOnInstallation) && (
              <div className="pt-2">
                <Input
                  label="GST Number"
                  value={quote.gstNumber}
                  onChange={(e) =>
                    setQuote({
                      ...quote,
                      gstNumber: e.target.value.toUpperCase(),
                    })
                  }
                  className="uppercase"
                />
              </div>
            )}
            <div className="pt-4 border-t flex justify-between items-center">
              <span className="text-lg font-bold">Grand Total</span>
              <span className="text-2xl font-black text-brand-primary">
                ₹
                {(
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
                <div className="grid grid-cols-2 gap-4">
                  {/* Save & Share */}
                  <Button
                    className="flex items-center justify-center gap-2 py-6 text-lg font-medium 
               bg-green-600 hover:bg-green-700 text-white rounded-xl transition"
                    onClick={() =>
                      savepdfAndShare({ data: quote, isCopyLink: false })
                    }
                  >
                    <FaWhatsapp size={20} />
                    Save & Share
                  </Button>

                  {/* Copy Link */}
                  <Button
                    className="flex items-center justify-center gap-2 py-6 text-lg font-medium 
               bg-gray-800 hover:bg-black text-white rounded-xl transition"
                    onClick={() =>
                      savepdfAndShare({ data: quote, isCopyLink: true })
                    }
                  >
                    <FiCopy size={20} />
                    Copy Link
                  </Button>
                </div>

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
};

export default Home;
