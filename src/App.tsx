import React, { useState } from "react";
import { products } from "./data/products";
import { PDFDownloadLink } from "@react-pdf/renderer";
import type { QuoteData, QuoteItem } from "./Types/type";
import QuotePDF from "./Component/QuotePDF";
import Select from "react-select";

export default function App() {
  const [quote, setQuote] = useState<QuoteData>({ items: [], grandTotal: 0 });

  // Filter out products already added in quote
  const productOptions = products
    .filter((p) => !quote.items.some((it) => it.name === p.name))
    .map((p) => ({
      value: p.id,
      label: p.name,
    }));

  function addProduct(productId: string) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const newItem: QuoteItem = {
      sn: quote.items.length + 1,
      name: product.name,
      description: product.description,
      make: product.make,
      makeModel: product.makeModel,
      qty: 1,
      unitRate: product.unitRate,
      amount: product.unitRate,
      image: product.image,
      installation_amount_1: product.installation_amount_1 || 0,
      installation_amount_2: product.installation_amount_2 || 0,
      catagoryName: product.catagoryName, // ✅ add category
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
    setQuote({ items, grandTotal });
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Quotation Builder</h1>

      {/* Product Selector */}
      <div className="mb-4 w-80">
        <Select
          options={productOptions}
          placeholder="Select a product..."
          onChange={(selected) => {
            if (selected) addProduct(selected.value);
          }}
          isSearchable
          isClearable
        />
      </div>

      {/* Preview Table */}
      <table className="w-full table-auto border-collapse bg-white shadow rounded text-sm text-center">
        <thead className="bg-gray-100">
          <tr>
            <th rowSpan={2} className="border p-2">Sr.</th>
            <th rowSpan={2} className="border p-2">Item Description</th>
            <th rowSpan={2} className="border p-2">Image</th>
            <th colSpan={2} className="border p-2">MAKE / MODEL</th>
            <th rowSpan={2} className="border p-2">Qty</th>
            <th colSpan={2} className="border p-2">SUPPLY</th>
            <th colSpan={2} className="border p-2">INSTALLATION</th>
            <th rowSpan={2} className="border p-2">Total</th>
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
                <td colSpan={12} className="border p-2 text-left">{category}</td>
              </tr>

              {items.map((it, idx) => {
                const total =
                  it.amount + it.installation_amount_1 + it.installation_amount_2;
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
                        value={it.qty}
                        onChange={(e) =>
                          updateItem(it.sn - 1, { qty: Number(e.target.value) })
                        }
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="number"
                        className="w-24 border p-1"
                        value={it.unitRate}
                        onChange={(e) =>
                          updateItem(it.sn - 1, { unitRate: Number(e.target.value) })
                        }
                      />
                    </td>
                    <td className="border p-2 text-right">{it.amount.toFixed(2)}</td>
                    <td className="border p-2">
                      <input
                        type="number"
                        className="w-24 border p-1"
                        value={it.installation_amount_1}
                        onChange={(e) =>
                          updateInstallation(it.sn - 1, "installation_amount_1", Number(e.target.value))
                        }
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="number"
                        className="w-24 border p-1"
                        value={it.installation_amount_2}
                        onChange={(e) =>
                          updateInstallation(it.sn - 1, "installation_amount_2", Number(e.target.value))
                        }
                      />
                    </td>
                    <td className="border p-2 text-right">{total.toFixed(2)}</td>
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
        <div className="mt-6">
          <PDFDownloadLink
            document={<QuotePDF data={{ ...quote }} />}
            fileName="quotation.pdf"
          >
            {({ loading }) => (
              <button className="px-4 py-2 bg-green-600 text-white rounded">
                {loading ? "Generating PDF..." : "Download PDF"}
              </button>
            )}
          </PDFDownloadLink>
        </div>
      )}
    </div>
  );
}
