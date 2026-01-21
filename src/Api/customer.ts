import { supabase } from "@/supabase";
import type { Database } from "@/Types/supabase";

export type Customer = Database["public"]["Tables"]["customer"];
const tableName = "customer";

export const getCustomerByMobileNo =async(mobileNo:string)=>{

    return await supabase.from(tableName).select('id').eq("mobile_no",mobileNo)

}

export const createCustomer = async (data:Customer["Insert"])=>{

    return await supabase.from(tableName).insert(data).select('id').single()
}




type FetchCategoriesParams = {
  search: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
};

export const getCustomers = async ({
  search,
  sortBy,
  sortOrder,
  page,
  limit,
}: FetchCategoriesParams) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from(tableName)
    .select('*,bill_quatation(id,created_at,grand_total,is_purches_order)', { count: 'exact' })
    // .is('deleted_at', null)
    .order(sortBy, { ascending: sortOrder === 'asc' });

  if (search) {
    query = query.ilike('name', `%${search}%`);
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
