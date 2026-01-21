import { supabase } from "@/supabase";
import type { Database } from "@/Types/supabase";

export type billQuatation = Database["public"]["Tables"]["bill_quatation"];
const tableName = "bill_quatation";

export const createBillQuation =async (data:billQuatation["Insert"])=>
{
    return await supabase.from(tableName).insert(data).select('id').single()
}

export const getBillQuatationsbyId = async(id:string)=>{
return await supabase.from(tableName).select(`*,
    customer(name,mobile_no,address),
    bill_quatation_product(quantity,unit_rate,installation_amount,category_name,
    ...product(id,name,description,model,make,image_url))
    `).eq("id",id).single();
}