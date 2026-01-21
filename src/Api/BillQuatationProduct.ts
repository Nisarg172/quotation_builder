import { supabase } from "@/supabase";
import type { Database } from "@/Types/supabase";

export type billQuatation = Database["public"]["Tables"]["bill_quatation_product"];
const tableName = "bill_quatation_product";

export const createBillQuationProduct=async(data:billQuatation["Insert"][])=>{
    return await supabase.from(tableName).insert(data)
}