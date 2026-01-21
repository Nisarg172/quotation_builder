"use client";

import { FaChevronRight } from "react-icons/fa";
import type { Column } from "./Table/DataTable";

export type CustomerType = {
  id: string;
  created_at: string;
  name: string;
  mobile_no: string;
  address?: string | null;
};

type ColumnProps = {
  openRowId: string | null;
  toggleRow: (id: string) => void;
};

export const CustomerColumns = ({
  openRowId,
  toggleRow,
}: ColumnProps): Column<CustomerType>[] => [
 
  {
    label: "Name",
    key: "name",
    sortable: true,
  },
  {
    label: "Mobile No",
    key: "mobile_no",
    sortable: true,
  },
  {
    label: "Address",
    key: "address",
    sortable: true,
  },
   {
    label: "",
    render: (row) => (
      <button
        onClick={() => toggleRow(row.id)}
        className={`transition-transform duration-200 ${
          openRowId === row.id ? "rotate-90" : ""
        }`}
      >
        <FaChevronRight size={14} />
      </button>
    ),
  },
];
