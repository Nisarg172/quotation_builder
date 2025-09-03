import React, { useEffect, useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import Select from "react-select";
import type { ProductWithCatagory, QuoteData, QuoteItem } from "../Types/type";
import { urlToBase64 } from "../utils/function";
import QuotePDF from "../components/QuotePDF";
import StaffQuotePDF from "../components/StaffQuotePDF";
import { getProductWithCatagory } from "@/Api/Category/CategoryApi";
import { toast } from "sonner";

export default function Home() {
  const [quote, setQuote] = useState<QuoteData>({
    items: [],
    customerName: "",
    mobileNo: "",
    grandTotal: 0,
  });

  const [products, setProducts] = useState<ProductWithCatagory[]>([]);

  async function addProduct(productId: string) {
    let foundProduct: {
      id: string;
      category_id: string | null;
      description: string | null;
      image_url: string | null;
      installation_amount_1: number;
      installation_amount_2: number;
      make: string | null;
      model: string | null;
      name: string;
      price: number;
      catagoryName: string;
    } | null = null;

    for (const cat of products) {
      const prod = cat.product.find((p) => p.id === productId);
      if (prod) {
        foundProduct = { ...prod, catagoryName: cat.name };
        break;
      }
    }

    if (!foundProduct) return;

    const newItem: QuoteItem = {
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
      installation_amount_2: foundProduct.installation_amount_2 || 0,
      catagoryName: foundProduct.catagoryName,
    };

    const items = [...quote.items, newItem];
    updateQuote(items);
  }

  function updateItem(idx: number, changes: Partial<QuoteItem>) {
    const items = quote.items.map((it, i) => {
      if (i !== idx) return it;
      const updated = { ...it, ...changes };
      updated.amount = updated.qty * updated.unitRate;
      return updated;
    });
    updateQuote(items);
  }

  function updateInstallation(
    idx: number,
    field: "installation_amount_1" | "installation_amount_2",
    value: number
  ) {
    const items = quote.items.map((it, i) => {
      if (i !== idx) return it;
      return {
        ...it,
        [field]: value,
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
    const grandTotal = items.reduce(
      (s, it) =>
        s + it.amount + it.installation_amount_1 + it.installation_amount_2,
      0
    );
    setQuote({ ...quote, items, grandTotal });
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
  const groupedOptions = products.map((cat) => ({
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

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="p-3 bg-gray-50 min-h-screen">
      {/* Enhanced Client Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter customer name"
              className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                !quote.customerName.trim() ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              value={quote.customerName}
              onChange={(e) => setQuote({ ...quote, customerName: e.target.value })}
              required
            />
            {!quote.customerName.trim() && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                 Customer name is required
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              placeholder="Enter 10-digit mobile number"
              className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                !quote.mobileNo.trim() || (quote.mobileNo.trim() && !/^[6-9]\d{9}$/.test(quote.mobileNo.trim())) ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              value={quote.mobileNo}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                setQuote({ ...quote, mobileNo: value });
              }}
              maxLength={10}
              required
            />
            {!quote.mobileNo.trim() ? (
              <p className="text-sm text-red-600 flex items-center gap-1">
                Mobile number is required
              </p>
            ) : quote.mobileNo.trim() && !/^[6-9]\d{9}$/.test(quote.mobileNo.trim()) ? (
              <p className="text-sm text-red-600 flex items-center gap-1">
                Please enter a valid 10-digit Indian mobile number
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Select Product to Add
          </label>
          <div className="w-full max-w-md">
            <Select
              options={groupedOptions}
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
            <th className="border p-2">Amount-II</th>
            <th className="border p-2">Amount-III</th>
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
                const total =
                  it.amount +
                  it.installation_amount_1 +
                  it.installation_amount_2;
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
                    <td className="border p-2">
                      <input
                        type="number"
                        className="w-16 border p-1"
                        value={it.qty === 0 ? "" : it.qty.toString()}
                        onChange={(e) =>
                          updateItem(it.sn - 1, {
                            qty:
                              e.target.value === "" ? 0 : Number(e.target.value),
                          })
                        }
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="number"
                        className="w-24 border p-1"
                        value={
                          it.unitRate === 0 ? "" : it.unitRate.toString()
                        }
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
                            "installation_amount_1",
                            e.target.value === "" ? 0 : Number(e.target.value)
                          )
                        }
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="number"
                        className="w-24 border p-1"
                        value={
                          it.installation_amount_2 === 0
                            ? ""
                            : it.installation_amount_2.toString()
                        }
                        onChange={(e) =>
                          updateInstallation(
                            it.sn - 1,
                            "installation_amount_2",
                            e.target.value === "" ? 0 : Number(e.target.value)
                          )
                        }
                      />
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

      {/* Totals */}
      <div className="mt-4 text-right font-bold">
        GRAND TOTAL: {quote.grandTotal.toFixed(2)}
      </div>

      {/* PDF Download */}
      {quote.items.length > 0 && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Generate Quotation</h2>
          {quote.customerName.trim() && quote.mobileNo.trim() && /^[6-9]\d{9}$/.test(quote.mobileNo.trim()) ? (
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Customer PDF with prices */}
              <PDFDownloadLink
                document={<QuotePDF data={{ ...quote }} />}
                fileName={`${quote.customerName.replace(/\s+/g, '_')}_quotation.pdf`}
              >
                {({ loading }) => (
                  <button className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2">
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        📄 Customer Quotation (With Prices)
                      </>
                    )}
                  </button>
                )}
              </PDFDownloadLink>

              {/* Staff PDF without prices */}
              <PDFDownloadLink
                document={<StaffQuotePDF data={{ ...quote }} />}
                fileName={`${quote.customerName.replace(/\s+/g, '_')}_staff_copy.pdf`}
              >
                {({ loading }) => (
                  <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2">
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        🔒 Staff Copy (No Prices)
                      </>
                    )}
                  </button>
                )}
              </PDFDownloadLink>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 font-medium flex items-center gap-2">
                <span>⚠️</span>
                Please fill in all required customer information before generating the PDF.
              </p>
              <ul className="mt-2 text-sm text-red-600 list-disc list-inside">
                {!quote.customerName.trim() && <li>Customer name is required</li>}
                {!quote.mobileNo.trim() && <li>Mobile number is required</li>}
                {quote.mobileNo.trim() && !/^[6-9]\d{9}$/.test(quote.mobileNo.trim()) && <li>Valid 10-digit mobile number is required</li>}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
