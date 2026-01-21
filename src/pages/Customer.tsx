'use client';

import DataTable from '@/components/Table/DataTable';
import { getCustomers } from '@/Api/customer';
import { CustomerColumns } from '@/components/customer.columns';
import { useState } from 'react';
import { FaFilePdf } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

type BillQuotation = {
  id: string;
  created_at: string;
  grand_total: number;
  is_purches_order: boolean;
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

  const fetchCustomer = async (params: {
    search: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    page: number;
    limit: number;
  }) => {
    const data = await getCustomers(params);
    return data;
  };

  const toggleRow = (id: string) => {
    setOpenRowId((prev) => (prev === id ? null : id));
  };

  const navigate = useNavigate();


  const  CustomerBillSubRow =({
  bills,
}: {
  bills: BillQuotation[];
})=> {
  if (!bills || bills.length === 0) {
    return (
      <div className="ml-10 my-2 rounded-md border bg-gray-50 px-4 py-3 text-sm text-gray-500">
        No billing records found
      </div>
    );
  }

  return (
    <div className="ml-10 my-2 rounded-md border bg-gray-50">
      {/* Header */}
      <div className="grid grid-cols-5 gap-4 px-4 py-2 text-xs font-semibold text-gray-600 border-b">
        <span>Date</span>
        <span>Quotation ID</span>
        <span>Total</span>
        <span>Type</span>
        <span>view pdf</span>
      </div>

      {/* Rows */}
      {bills.map((bill) => (
        <div
          key={bill.id}
          className="grid grid-cols-5 gap-4 px-4 py-2 text-sm border-b last:border-b-0"
        >
          <span>
            {new Date(bill.created_at).toLocaleDateString()}
          </span>

          <span className="truncate">{bill.id}</span>

          <span className="font-medium">
            ₹{bill.grand_total.toLocaleString()}
          </span>

          <span
            className={
              bill.is_purches_order
                ? 'text-green-600 font-medium'
                : 'text-blue-600 font-medium'
            }
          >
            {bill.is_purches_order ? 'Purchase Order' : 'Quotation'}
          </span>

           <span className="font-medium" onClick={()=>navigate(`/pdf/${bill?.id}`)}>
            <FaFilePdf size={22} className='hover:text-red-600'/>
            
          </span>
          
        </div>
      ))}
    </div>
  );
}
  return (
    <div className="container mx-auto px-4 py-8">
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
  );
}



