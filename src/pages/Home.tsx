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
} from "@/Api/Category/CategoryApi";
import { toast } from "sonner";

export default function Home() {
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
  });

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
      qty: 1,
      unitRate: foundProduct.price,
      amount: foundProduct.price,
      image: foundProduct.image_url
        ? await urlToBase64(foundProduct.image_url)
        : "",
      installation_amount_1: foundProduct.installation_amount_1 || 0,
      catagoryName: foundProduct.catagoryName,
      totalInstallation: foundProduct.installation_amount_1 || 0,
    };

    const accessoryAsProduct: QuoteItem[] = await Promise.all(
      foundProduct?.accessories?.map(async ({ accessory }, index) => {
        const newItem: QuoteItem = {
          id: accessory.id,
          sn: quote.items.length + 1 + index + 1,
          name: accessory.name,
          description: accessory.description || "",
          make: accessory.make || "",
          makeModel: accessory.model || "",
          qty: accessory.base_quantity || 1,
          unitRate: accessory.price,
          amount: accessory.price * (accessory.base_quantity || 1),
          image: accessory.image_url
            ? await urlToBase64(accessory.image_url)
            : "",
          installation_amount_1: accessory.installation_amount_1 || 0,
          catagoryName: foundProduct.catagoryName,
          totalInstallation: accessory.installation_amount_1 || 0,
        };

        return newItem;
      }) || []
    );

    const items = [...quote.items, newItem, ...accessoryAsProduct];
    const mergedItems = items.reduce<QuoteItem[]>((acc, item) => {
      const existing = acc.find((i) => i.id === item.id);

      if (existing) {
        existing.qty += item.qty;
        existing.amount = existing.qty * existing.unitRate;
        existing.totalInstallation =
          existing.qty * (existing.installation_amount_1 || 0);
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
      amount: foundProduct.price,
      image: foundProduct.image_url
        ? await urlToBase64(foundProduct.image_url)
        : "",
      installation_amount_1: foundProduct.installation_amount_1 || 0,
      catagoryName: foundProduct.catagoryName,
      totalInstallation: foundProduct.installation_amount_1 || 0,
    };

    const items = [...quote.items, newItem];
    const mergedItems = items.reduce<QuoteItem[]>((acc, item) => {
      const existing = acc.find((i) => i.id === item.id);

      if (existing) {
        existing.qty += item.qty;
        existing.amount = existing.qty * existing.unitRate;
        existing.totalInstallation =
          existing.qty * (existing.installation_amount_1 || 0);
      } else {
        acc.push({ ...item });
      }

      return acc;
    }, []);
    updateQuote(mergedItems);
  }

  function updateItem(idx: number, changes: Partial<QuoteItem>) {
    const items = quote.items.map((it, i) => {
      if (i !== idx) return it;
      const updated = { ...it, ...changes };
      updated.amount = updated.qty * updated.unitRate;
      updated.totalInstallation = updated.qty * updated.installation_amount_1;
      return updated;
    });
    updateQuote(items);
  }

  function updateInstallation(idx: number, value: number) {
    const items = quote.items.map((it, i) => {
      if (i !== idx) return it;
      return {
        ...it,
        installation_amount_1: value,
        totalInstallation: it.qty * value,
      };
    });
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
      items.reduce((sum, it) => sum + it.unitRate * it.qty, 0).toFixed(2)
    );

    const installationTotal = Number(
      items.reduce((sum, it) => sum + it.totalInstallation, 0).toFixed(2)
    );

    setQuote({
      ...quote,
      items,
      supplyTotal,
      installationTotal,
      grandTotal: supplyTotal + installationTotal,
    });
  }

  // ✅ Group items by category
  const groupedItems = quote.items.reduce<Record<string, QuoteItem[]>>(
    (acc, item) => {
      if (!acc[item.catagoryName]) acc[item.catagoryName] = [];
      acc[item.catagoryName].push(item);
      return acc;
    },
    {}
  );

  // ✅ Group products for react-select
  const productGroupedOptions = products.map((cat) => ({
    label: cat.name,
    options: cat.product
      .filter((p) => !quote.items.some((it) => it.name === p.name))
      .map((p) => ({
        value: p.id,
        label: p.name,
      })),
  }));

  const accessoryGroupedOptions = accessories.map((cat) => ({
    label: cat.name,
    options: cat.product
      .filter((p) => !quote.items.some((it) => it.name === p.name))
      .map((p) => ({
        value: p.id,
        label: p.name,
      })),
  }));

  const fetchProducts = async () => {
    const { data, error } = await getProductWithCatagory();

    if (error) toast.error(error.message);
    else setProducts(data || []);
  };

  const fetchAccessories = async () => {
    const { data, error } = await getAccessoryWithCatagory();

    console.log("accessory data", data);
    if (error) toast.error(error.message);
    else setAccessories(data || []);
  };

  useEffect(() => {
    fetchProducts();
    fetchAccessories();
  }, []);

  return (
    <div className="p-3 bg-gray-50 min-h-screen">
      {/* Enhanced Client Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Customer Name */}
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter customer name"
              className={`w-full border rounded-sm px-4 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                !quote.customerName.trim()
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300"
              }`}
              value={quote.customerName}
              onChange={(e) =>
                setQuote({ ...quote, customerName: e.target.value })
              }
              required
            />
            {!quote.customerName.trim() && (
              <p className="text-sm text-red-600">Customer name is required</p>
            )}
          </div>

          {/* Mobile Number */}
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              placeholder="Enter 10-digit mobile number"
              className={`w-full border rounded-sm px-4 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                !quote.mobileNo.trim() ||
                !/^[6-9]\d{9}$/.test(quote.mobileNo.trim())
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300"
              }`}
              value={quote.mobileNo}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                setQuote({ ...quote, mobileNo: value });
              }}
              maxLength={10}
              required
            />
            {!quote.mobileNo.trim() ? (
              <p className="text-sm text-red-600">Mobile number is required</p>
            ) : !/^[6-9]\d{9}$/.test(quote.mobileNo.trim()) ? (
              <p className="text-sm text-red-600">
                Please enter a valid 10-digit Indian mobile number
              </p>
            ) : null}
          </div>

          {/* Address */}
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700">
              Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter address"
              className={`w-full border rounded-sm px-4 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                !quote.address?.trim()
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300"
              }`}
              value={quote.address || ""}
              onChange={(e) => setQuote({ ...quote, address: e.target.value })}
              required
            />
            {!quote.address?.trim() && (
              <p className="text-sm text-red-600">Address is required</p>
            )}
          </div>

          {/* Product Select */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Select Product to Add
            </label>
            <div className="w-full max-w-md">
              <Select
                options={productGroupedOptions}
                placeholder="Search and select a product..."
                onChange={(selected) => {
                  if (selected) addProduct((selected as any).value);
                }}
                isSearchable
                isClearable
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>
          </div>

          {/* Select Accessories */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Select Accessories to Add
            </label>
            <div className="w-full max-w-md">
              <Select
                options={accessoryGroupedOptions}
                placeholder="Search and select a accessory..."
                onChange={(selected) => {
                  if (selected) addAccessories((selected as any).value);
                }}
                isSearchable
                isClearable
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>
          </div>

          {/*is purches order  */}
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700">
              is Purches order
            </label>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() =>
                  setQuote({
                    ...quote,
                    isPurchesOrder: !quote.isPurchesOrder,
                  })
                }
                className={`relative inline-flex h-6 w-11 my-1.5 items-center rounded-full transition-colors ${
                  quote.isPurchesOrder ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    quote.isPurchesOrder ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Table */}
      <table className="w-full table-auto border-collapse bg-white shadow rounded text-sm text-center">
        <thead className="bg-gray-100">
          <tr>
            <th rowSpan={2} className="border p-2">
              Sr.
            </th>
            <th rowSpan={2} className="border p-2">
              Item Description
            </th>
            <th rowSpan={2} className="border p-2">
              Image
            </th>
            <th colSpan={2} className="border p-2">
              MAKE / MODEL
            </th>
            <th rowSpan={2} className="border p-2">
              Qty
            </th>
            <th colSpan={2} className="border p-2">
              SUPPLY
            </th>
            <th colSpan={2} className="border p-2">
              INSTALLATION
            </th>
            <th rowSpan={2} className="border p-2">
              Total
            </th>
            <th rowSpan={2} className="border p-2"></th>
          </tr>
          <tr>
            <th className="border p-2">Make</th>
            <th className="border p-2">Model No.</th>
            <th className="border p-2">Unit Rate</th>
            <th className="border p-2">Amount-I</th>
            <th className="border p-2">Unit Rate</th>
            <th className="border p-2">Amount-II</th>
          </tr>
        </thead>

        <tbody>
          {Object.entries(groupedItems).map(([category, items]) => (
            <React.Fragment key={category}>
              {/* ✅ Category Title Row */}
              <tr className="bg-gray-200 font-semibold">
                <td colSpan={12} className="border p-2 text-left">
                  {category}
                </td>
              </tr>

              {items.map((it) => {
                const total = it.amount + it.totalInstallation;
                return (
                  <tr key={it.sn} className="border-t">
                    <td className="border p-2">{it.sn}</td>
                    <td className="border p-2 text-left">{it.description}</td>
                    <td className="border p-2">
                      {it.image && (
                        <img
                          src={it.image}
                          alt=""
                          className="w-12 h-12 object-contain mx-auto"
                        />
                      )}
                    </td>
                    <td className="border p-2">{it.make}</td>
                    <td className="border p-2">{it.makeModel}</td>
                    {/* quantity   */}
                    <td className="border p-2">
                      <input
                        type="number"
                        className="w-16 border p-1"
                        value={it.qty === 0 ? "" : it.qty.toString()}
                        onChange={(e) =>
                          updateItem(it.sn - 1, {
                            qty:
                              e.target.value === ""
                                ? 0
                                : Number(e.target.value),
                          })
                        }
                      />
                    </td>
                    {/* unit rate of product  */}
                    <td className="border p-2">
                      <input
                        type="number"
                        className="w-24 border p-1"
                        value={it.unitRate === 0 ? "" : it.unitRate.toString()}
                        onChange={(e) =>
                          updateItem(it.sn - 1, {
                            unitRate:
                              e.target.value === ""
                                ? 0
                                : Number(e.target.value),
                          })
                        }
                      />
                    </td>
                    <td className="border p-2 text-right">
                      {it.amount.toFixed(2)}
                    </td>
                    {/* unite rate of installation */}
                    <td className="border p-2">
                      <input
                        type="number"
                        className="w-24 border p-1"
                        value={
                          it.installation_amount_1 === 0
                            ? ""
                            : it.installation_amount_1.toString()
                        }
                        onChange={(e) =>
                          updateInstallation(
                            it.sn - 1,
                            e.target.value === "" ? 0 : Number(e.target.value)
                          )
                        }
                      />
                    </td>
                    <td className="border p-2">
                      {it.totalInstallation.toFixed(2)}
                    </td>
                    <td className="border p-2 text-right">
                      {total.toFixed(2)}
                    </td>
                    <td className="border p-2">
                      <button
                        className="text-red-600"
                        onClick={() => removeItem(it.sn - 1)}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {/* TOTALS + PDF DOWNLOAD */}
      {quote.items.length > 0 && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ================= TOTALS CARD ================= */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="p-6 space-y-4">
              {/* SUPPLY TOTAL */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">
                  Supply Total
                </span>
                <span className="text-base font-semibold text-gray-900">
                  ₹ {Number(quote.supplyTotal).toFixed(2)}
                </span>
              </div>

              {/* GST ON SUPPLY */}
              <div className="flex justify-between items-center">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={quote.gstOnSupply || false}
                    onChange={(e) =>
                      setQuote({
                        ...quote,
                        gstOnSupply: e.target.checked,

                      })
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Add GST on Supply{" "}
                  <span className="text-xs text-gray-400">(18%)</span>
                </label>
                <span className="text-sm font-medium text-gray-900">
                  ₹{" "}
                  {quote.gstOnSupply
                    ? ((quote.supplyTotal * 18) / 100).toFixed(2)
                    : "0.00"}
                </span>
              </div>

              {/* INSTALLATION TOTAL */}
              <div className="flex justify-between items-center pt-2">
                <span className="text-sm font-medium text-gray-500">
                  Installation Total
                </span>
                <span className="text-base font-semibold text-gray-900">
                  ₹ {Number(quote.installationTotal).toFixed(2)}
                </span>
              </div>

              {/* GST ON INSTALLATION */}
              <div className="flex justify-between items-center">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={quote.gstOnInstallation || false}
                    onChange={(e) =>
                      setQuote({
                        ...quote,
                        gstOnInstallation: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Add GST on Installation{" "}
                  <span className="text-xs text-gray-400">(18%)</span>
                </label>
                <span className="text-sm font-medium text-gray-900">
                  ₹{" "}
                  {quote.gstOnInstallation
                    ? ((quote.installationTotal * 18) / 100).toFixed(2)
                    : "0.00"}
                </span>
              </div>

              {/* GRAND TOTAL */}
              <div className="mt-4 border-t pt-4 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-800">
                  Grand Total
                </span>
                <span className="text-xl font-extrabold text-blue-600">
                  ₹{" "}
                  {(
                    Number(quote.supplyTotal) +
                    Number(quote.installationTotal) +
                    (quote.gstOnSupply ? (quote.supplyTotal * 18) / 100 : 0) +
                    (quote.gstOnInstallation
                      ? (quote.installationTotal * 18) / 100
                      : 0)
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* ================= PDF DOWNLOAD CARD ================= */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Generate Quotation
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Download customer or staff quotation in PDF format.
              </p>
            </div>

            {quote.customerName.trim() &&
            quote.mobileNo.trim() &&
            /^[6-9]\d{9}$/.test(quote.mobileNo.trim()) ? (
              <div className="flex flex-col gap-4">
                {/* CUSTOMER PDF */}
                <PDFDownloadLink
                  document={<QuotePDF data={{ ...quote }} />}
                  fileName={`${quote.customerName.replace(
                    /\s+/g,
                    "_"
                  )}_quotation.pdf`}
                >
                  {({ loading }) => (
                    <button className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition-all shadow-sm">
                      {loading ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Generating PDF...
                        </>
                      ) : (
                        <>📄 Customer Quotation (With Prices)</>
                      )}
                    </button>
                  )}
                </PDFDownloadLink>

                {/* STAFF PDF */}
                <PDFDownloadLink
                  document={<StaffQuotePDF data={{ ...quote }} />}
                  fileName={`${quote.customerName.replace(
                    /\s+/g,
                    "_"
                  )}_staff_copy.pdf`}
                >
                  {({ loading }) => (
                    <button className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-sm">
                      {loading ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Generating PDF...
                        </>
                      ) : (
                        <>🔒 Staff Copy (No Prices)</>
                      )}
                    </button>
                  )}
                </PDFDownloadLink>
              </div>
            ) : (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-red-700 font-semibold flex items-center gap-2">
                  ⚠️ Missing customer information
                </p>
                <ul className="mt-2 text-sm text-red-600 list-disc list-inside">
                  {!quote.customerName.trim() && (
                    <li>Customer name is required</li>
                  )}
                  {!quote.mobileNo.trim() && <li>Mobile number is required</li>}
                  {quote.mobileNo.trim() &&
                    !/^[6-9]\d{9}$/.test(quote.mobileNo.trim()) && (
                      <li>Enter a valid 10-digit mobile number</li>
                    )}
                  {!quote.address?.trim() && <li>Address is required</li>}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
