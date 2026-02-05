"use client";

import { useServerTable } from "@/hooks/useServerTable";
import { useState, Fragment, forwardRef, useImperativeHandle } from "react";
import { FaFilter } from "react-icons/fa";
import { Search } from "lucide-react";
import Input from "@/components/ui/Input";

export type FilterOption = {
  label: string;
  value: string;
};

export type Column<T> = {
  label: string;
  key?: keyof T;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  filterOption?: FilterOption[];
};

export type DataTableRef = {
  refresh: () => void;
};

type Props<T> = {
  columns: Column<T>[];
  fetcher: (params: any) => Promise<any>;
  defaultSortBy: string;
  renderSubRow?: (row: T) => React.ReactNode;
};

/* ================= COMPONENT ================= */

function DataTableInner<T>(
  { columns, fetcher, defaultSortBy, renderSubRow }: Props<T>,
  ref: React.Ref<DataTableRef>,
) {
  const {
    data,
    loading,
    search,
    setSearch,
    sortBy,
    sortOrder,
    setSortBy,
    setSortOrder,
    page,
    setPage,
    meta,
    handelFilterOption,
    refresh, // ✅ ONLY added
  } = useServerTable<T>(fetcher, defaultSortBy);

  // ✅ ONLY added
  useImperativeHandle(ref, () => ({
    refresh,
  }));

  const [openFilter, setOpenFilter] = useState<string | null>(null);

  const toggleSort = (key?: keyof T) => {
    if (!key) return;
    const k = key as string;

    if (sortBy === k) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(k);
      setSortOrder("asc");
    }
  };

  return (
    <div className="space-y-4">
      {/* Search - Full width on mobile, 64 on desktop */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-full sm:w-64">
          <Input
            type="text"
            placeholder="Search...s"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            leftIcon={<Search size={18} className="text-gray-400" />}
          />
        </div>
      </div>

      {/* --- DESKTOP VIEW --- */}
      <div className="hidden sm:block w-full overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-50 text-xs capitalize text-gray-700">
            <tr>
              {columns.map((c, i) => (
                <th
                  key={i}
                  className={`px-4 py-3 text-left whitespace-nowrap font-semibold ${
                    c.sortable
                      ? "cursor-pointer hover:bg-gray-100 transition-colors"
                      : ""
                  }`}
                  onClick={() => c.sortable && toggleSort(c.key)}
                >
                  <div className="flex items-center gap-1">
                    {c.label}
                    {c.key === sortBy && (
                      <span className="text-blue-600">
                        {sortOrder === "asc" ? " ▲" : " ▼"}
                      </span>
                    )}

                    {c.filterOption && (
                      <div className="relative inline-block ml-auto">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenFilter(
                              openFilter === c.key ? null : (c.key as string),
                            );
                          }}
                          className={`p-1 rounded-full hover:bg-gray-200 ${
                            openFilter === c.key
                              ? "text-blue-600"
                              : "text-gray-400"
                          }`}
                        >
                          <FaFilter size={12} />
                        </button>

                        {openFilter === c.key && (
                          <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg z-50 normal-case">
                            <button
                              className="block w-full text-left px-3 py-2 text-xs hover:bg-gray-100 border-b border-gray-100"
                              onClick={() => {
                                handelFilterOption(null);
                                setOpenFilter(null);
                                setPage(1);
                              }}
                            >
                              All
                            </button>

                            {c.filterOption.map((option) => (
                              <button
                                key={option.value}
                                className="block w-full text-left px-3 py-2 text-xs hover:bg-gray-100"
                                onClick={() => {
                                  handelFilterOption({
                                    key: c.key as string,
                                    value: option.value,
                                  });
                                  setOpenFilter(null);
                                  setPage(1);
                                }}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-10 text-center text-sm text-gray-500"
                >
                  <div className="flex justify-center items-center gap-2">
                    <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                    Loading records...
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-10 text-center text-sm text-gray-500 font-medium"
                >
                  No records found
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <Fragment key={i}>
                  <tr className="hover:bg-gray-50 transition-colors">
                    {columns.map((c, j) => (
                      <td
                        key={j}
                        className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap"
                      >
                        {c.render
                          ? c.render(row)
                          : String((row as any)[c.key as string] ?? "")}
                      </td>
                    ))}
                  </tr>

                  {renderSubRow && (
                    <tr>
                      <td colSpan={columns.length} className="p-0 border-t-0">
                        <div className="bg-gray-50 overflow-hidden transition-all">
                          {renderSubRow(row)}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- MOBILE CARD VIEW --- */}
      <div className="sm:hidden space-y-4">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500 bg-white border rounded-lg">
            Loading...
          </div>
        ) : data.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500 bg-white border rounded-lg">
            No records found
          </div>
        ) : (
          data.map((row, i) => {
            const addressColumn = columns.find(
              (c) => c.label.toLowerCase() === "address",
            );

            const nonAddressColumns = columns.filter(
              (c) => c.label.toLowerCase() !== "address",
            );

            const nameColumn = nonAddressColumns[0];
            const mobileColumn = nonAddressColumns[1];
            const actionColumn =
              nonAddressColumns[nonAddressColumns.length - 1];

            return (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
              >
                {/* ===== HEADER ===== */}
                <div className="relative p-4">
                  <div className="grid grid-cols-[1fr_1fr_auto] gap-3 items-start">
                    {/* NAME */}
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase font-bold text-gray-400">
                        {nameColumn?.label}
                      </p>
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {nameColumn?.render
                          ? nameColumn.render(row)
                          : String(
                              (row as any)[nameColumn?.key as string] ?? "-",
                            )}
                      </p>
                    </div>

                    {/* MOBILE */}
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase font-bold text-gray-400">
                        {mobileColumn?.label}
                      </p>
                      <p className="text-sm text-gray-700 truncate">
                        {mobileColumn?.render
                          ? mobileColumn.render(row)
                          : String(
                              (row as any)[mobileColumn?.key as string] ?? "-",
                            )}
                      </p>
                    </div>

                    {/* ACTION ICON */}
                    {actionColumn?.render && (
                      <div className="pt-4">{actionColumn.render(row)}</div>
                    )}
                  </div>
                </div>

                {/* ===== ADDRESS ===== */}
                {addressColumn && (
                  <div className="px-4 pb-4 pt-0 border-t border-gray-100">
                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">
                      {addressColumn.label}
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {addressColumn.render
                        ? addressColumn.render(row)
                        : String(
                            (row as any)[addressColumn.key as string] ?? "-",
                          )}
                    </p>
                  </div>
                )}

                {/* ===== EXPANDED SUB ROW ===== */}
                {renderSubRow && (
                  <div className="bg-gray-50 border-t border-gray-200 px-3 py-3">
                    {renderSubRow(row)}
                  </div>
                )}
              </div>
            );
          })
        )}

          
      </div>

       {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
        <span className="text-sm text-gray-600 order-2 sm:order-1 font-medium">
          Page <span className="text-black">{page}</span> of{" "}
          <span className="text-black">{meta.totalPages || 1}</span>
        </span>

        <div className="flex items-center gap-2 order-1 sm:order-2 w-full sm:w-auto">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium border rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <button
            disabled={page === meta.totalPages || meta.totalPages === 0}
            onClick={() => setPage(page + 1)}
            className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium border rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div> 
    </div>
  );
}

/* ================= EXPORT ================= */

const DataTable = forwardRef(DataTableInner) as <T>(
  props: Props<T> & { ref?: React.Ref<DataTableRef> },
) => React.ReactElement;

export default DataTable;
