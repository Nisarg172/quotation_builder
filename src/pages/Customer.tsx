"use client";

import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaFilePdf, FaFileInvoiceDollar } from "react-icons/fa";
import { toast } from "sonner";

import DataTable, { type DataTableRef } from "@/components/Table/DataTable";
import { getCustomers } from "@/Api/customer";
import { CustomerColumns } from "@/components/customer.columns";
import { MdEdit } from "react-icons/md";
import { CoumpanyInfo } from "@/utils/const";
import { FiTrash2 } from "react-icons/fi";
import { deleteBillQuatation } from "@/Api/BillQuatation";
import type { Database } from "@/Types/supabase";

// --- Types ---
type BillQuotation = {
  id: string;
  created_at: string;
  grand_total: number;
  type:Database["public"]["Enums"]["bill_type"],
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
  const tableRef = useRef<DataTableRef>(null);

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
// --- Sub-component: Billing Records ---
const CustomerBillSubRow = ({ bills }: { bills: BillQuotation[] }) => {
  if (!bills || bills.length === 0) {
    return (
      <div className="ml-4 md:ml-12 my-3 rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-6 py-8 text-center">
        <p className="text-sm text-gray-400">
          No billing records found for this customer.
        </p>
      </div>
    );
  }

  return (
    /* FIX: 'sticky left-0' and 'w-[calc(100vw-2rem)]' prevents the sub-row 
       from expanding the table width and causing a horizontal scroll.
    */
    <div className="sticky ' and 'w-[calc(100vw-2rem)] md:w-full overflow-hidden my-3 md:my-3 px-1">
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm ">
        {/* Header (desktop and larger) - NOT CHANGED */}
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
              className="flex flex-col md:grid md:grid-cols-6 gap-3 md:gap-4 px-4 py-4 md:px-5 md:py-3 text-sm items-center hover:bg-blue-50/30 transition-colors"
            >
              {/* Row 1: Date & ID (Mobile) */}
              <div className="flex w-full justify-between items-center md:contents">
                <span className="text-gray-600 font-bold md:font-medium">
                  {new Date(bill.created_at).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                  })}
                </span>
                <span className="font-mono text-[10px] text-gray-400 uppercase md:text-xs">
                  #{bill.id.slice(0, 8)}...
                </span>
              </div>

              {/* Row 2: Amount (Mobile) */}
              <div className="flex w-full justify-between items-center md:contents">
                <span className="md:hidden text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</span>
                <span className="font-black text-gray-900 text-base md:text-sm md:font-bold">
                  ₹{(bill.grand_total +
                    (bill.gst_on_supply ? bill.supply_total * 0.18 : 0) +
                    (bill.gst_on_installation ? bill.installation_total * 0.18 : 0)
                  ).toLocaleString("en-IN")}
                </span>
              </div>

              {/* Row 3: Company (Mobile) */}
              <div className="flex w-full justify-between items-center md:contents">
                <span className="md:hidden text-[10px] font-black text-gray-400 uppercase tracking-widest">Company</span>
                <span className="font-bold text-gray-700 md:text-gray-900 truncate max-w-[150px] md:max-w-full">
                  {CoumpanyInfo[bill.coumpany_id - 1]?.companyName}
                </span>
              </div>

              {/* Row 4: Type (Mobile) */}
              <div className="flex w-full justify-between items-center md:contents">
                <span className="md:hidden text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</span>
                <span>
                   
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-brand-soft text-brand-primary text-[10px] font-bold">
                      <FaFileInvoiceDollar size={10} /> {bill.type}
                    </span>
                  
                </span>
              </div>

              {/* Row 5: Actions */}
              <div className="flex w-full gap-2 pt-2 border-t border-gray-50 md:border-t-0 md:pt-0 md:justify-end md:col-span-1">
                <button
                  onClick={() => navigate(`/pdf/${bill.id}`)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 p-2 text-red-600 bg-red-50 md:bg-transparent md:text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                  <FaFilePdf size={18} />
                  <span className="md:hidden font-bold text-xs">VIEW PDF</span>
                </button>

                <button
                  onClick={() => navigate(`/${bill.id}`)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 p-2 text-blue-600 bg-blue-50 md:bg-transparent md:text-gray-400 hover:text-blue-600 hover:bg-red-50 rounded-lg transition-all"
                >
                  <MdEdit size={18} />
                  <span className="md:hidden font-bold text-xs">EDIT</span>
                </button>

                 <button
                  onClick={() => deleteBill(bill.id)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 p-2 text-red-600 bg-red-50 md:bg-transparent md:text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                  <FiTrash2 size={18} />
                  <span className="md:hidden font-bold text-xs">Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const deleteBill = async(id:string)=>{
  const {error} = await deleteBillQuatation(id)
  if(error)
  {
    toast.error(error.message)
  }
  tableRef.current?.refresh()

}

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
          defaultSortBy="created_at"
          ref={tableRef}
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
