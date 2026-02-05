import { supabase } from "@/supabase";
import type { Database } from "@/Types/supabase";

export type Customer = Database["public"]["Tables"]["customer"];
const tableName = "customer";

export const getCustomerByMobileNo = async (mobileNo: string) => {
  return await supabase.from(tableName).select("id").eq("mobile_no", mobileNo);
};

export const createCustomer = async (data: Customer["Insert"]) => {
  return await supabase.from(tableName).insert(data).select("id").single();
};

type FetchCategoriesParams = {
  search: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  page: number;
  limit: number;
};

export const getCustomers = async ({
  search,
  page,
  limit,
}: FetchCategoriesParams) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // let query = supabase
  //   .from(tableName)
  //   .select(
  //     `*,
  //     bill_quatation!inner(id,created_at,grand_total,supply_total,installation_total,gst_on_installation,gst_on_supply,is_purches_order,coumpany_id)`,
  //     { count: "exact" },
  //   )
  //   .order(sortBy, {
  //     ascending: sortOrder == "asc",
  //     referencedTable: sortBy === "created_at" ? "bill_quatation" : undefined,
  //   });

  let query  =  supabase
  .from("customers_with_bills")
  .select("*", { count: "exact" })
  .order("latest_bill_created_at", { ascending: false })
  .range(from, to)
  

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return {
    data: data ?? [],
    meta: {
      page,
      limit,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / limit),
    },
  };
};
