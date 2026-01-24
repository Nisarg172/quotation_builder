"use client";

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaFilePdf, FaReceipt, FaFileInvoiceDollar } from "react-icons/fa";
import { toast } from "sonner";

import DataTable from "@/components/Table/DataTable";
import { getCustomers } from "@/Api/customer";
import { CustomerColumns } from "@/components/customer.columns";
import { MdEdit } from "react-icons/md";
import { CoumpanyInfo } from "@/utils/const";

// --- Types ---
type BillQuotation = {
  id: string;
  created_at: string;
  grand_total: number;
  is_purches_order: boolean;
  coumpany_id: number;
  supply_total: number;
  installation_total: number;
  gst_on_installation: boolean;
  gst_on_supply: boolean;
};

type CustomerType = {
  id: string;
  created_at: string;
  name: string;
  mobile_no: string;
  address?: string | null;
  bill_quatation: BillQuotation[];
};

export default function Customer() {
  const [openRowId, setOpenRowId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Memoized fetcher to prevent unnecessary re-renders in DataTable
  const fetchCustomer = useCallback(
    async (params: {
      search: string;
      sortBy: string;
      sortOrder: "asc" | "desc";
      page: number;
      limit: number;
    }) => {
      try {
        const data = await getCustomers(params);
        return data;
      } catch (error: any) {
        toast.error("Failed to load customers");
        return { data: [], total: 0 };
      }
    },
    [],
  );

  const toggleRow = (id: string) => {
    setOpenRowId((prev) => (prev === id ? null : id));
  };

  // --- Sub-component: Billing Records ---
  const CustomerBillSubRow = ({ bills }: { bills: BillQuotation[] }) => {
    if (!bills || bills.length === 0) {
      return (
        <div className="ml-12 my-3 rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-6 py-8 text-center">
          <p className="text-sm text-gray-400">
            No billing records found for this customer.
          </p>
        </div>
      );
    }

    return (
      <div className="my-3 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Header (desktop and larger) */}
        <div className="hidden md:grid grid-cols-6 gap-4 bg-gray-50 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b">
          <span>Date</span>
          <span>Document ID</span>
          <span>Grand Total</span>
          <span>Coumpany Name</span>
          <span>Type</span>
          <span className="text-right">Actions</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-100">
          {bills.map((bill) => (
            <div
              key={bill.id}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4 px-4 sm:px-5 py-3 text-sm items-center hover:bg-blue-50/30 transition-colors"
            >
              <span className="text-gray-600 font-medium">
                {new Date(bill.created_at).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>

              <span className="font-mono text-xs text-gray-400 truncate uppercase">
                #{bill.id.slice(0, 8)}...
              </span>

              <span className="font-bold text-gray-900">
                ₹{bill.grand_total +
                (bill.gst_on_supply ? bill.supply_total * 0.18 : 0) +
                  (bill.gst_on_installation ? bill.installation_total * 0.18 : 0)
                }
              </span>

              <span className="font-bold text-gray-900">
                {CoumpanyInfo[bill.coumpany_id - 1]?.companyName}
              </span>

              <span>
                {bill.is_purches_order ? (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                    <FaReceipt size={10} /> PO
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                    <FaFileInvoiceDollar size={10} /> Quote
                  </span>
                )}
              </span>

              <div className="flex justify-start md:justify-end col-span-1 sm:col-span-2 md:col-span-1">
                <button
                  onClick={() => navigate(`/pdf/${bill.id}`)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                  <FaFilePdf size={18} />
                </button>

                <button
                  onClick={() => navigate(`/${bill.id}`)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-red-50 rounded-lg transition-all"
                >
                  <MdEdit size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              Customer Database
            </h1>
            <p className="text-sm text-gray-500">
              View customer details and history
            </p>
          </div>
        </div>

        <DataTable<CustomerType>
          columns={CustomerColumns({ openRowId, toggleRow })}
          fetcher={fetchCustomer}
          defaultSortBy="name"
          renderSubRow={(row) =>
            openRowId === row.id ? (
              <CustomerBillSubRow bills={row.bill_quatation} />
            ) : null
          }
        />
      </div>
    </div>
  );
}
