"use client";

import { useServerTable } from "@/hooks/useServerTable";
import { useState, Fragment } from "react";
import { FaFilter } from "react-icons/fa";

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

type Props<T> = {
  columns: Column<T>[];
  fetcher: (params: any) => Promise<any>;
  defaultSortBy: string;
  renderSubRow?: (row: T) => React.ReactNode;
};

export default function DataTable<T>({
  columns,
  fetcher,
  defaultSortBy,
  renderSubRow,
}: Props<T>) {
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
  } = useServerTable<T>(fetcher, defaultSortBy);

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
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search..."
          className="border px-3 py-2 rounded w-full sm:w-64 focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* Table Wrapper for Horizontal Scroll */}
      <div className="w-full overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700">
            <tr>
              {columns.map((c, i) => (
                <th
                  key={i}
                  className={`px-4 py-3 text-left whitespace-nowrap font-semibold ${
                    c.sortable ? "cursor-pointer hover:bg-gray-100 transition-colors" : ""
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
                            e.stopPropagation(); // Prevent sorting when clicking filter
                            setOpenFilter(
                              openFilter === c.key ? null : (c.key as string)
                            );
                          }}
                          className={`p-1 rounded-full hover:bg-gray-200 ${
                            openFilter === c.key ? "text-blue-600" : "text-gray-400"
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
                <td colSpan={columns.length} className="py-10 text-center text-sm text-gray-500">
                  <div className="flex justify-center items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
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
                      <td key={j} className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
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

      {/* Pagination - Stacked on Mobile */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
        <span className="text-sm text-gray-600 order-2 sm:order-1 font-medium">
          Page <span className="text-black">{page}</span> of <span className="text-black">{meta.totalPages || 1}</span>
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