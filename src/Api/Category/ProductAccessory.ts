import { supabase } from "@/supabase";
import type { Database } from "@/Types/supabase";

export type Product = Database["public"]["Tables"]["product_accessory"];
const tableName = "product_accessory";

export const addProductAccessory = async (data:Product["Insert"][])=>{
     return await supabase
            .from(tableName)
            .upsert(data);
}

export const removeAccessoryByProductId = async (product_id:string)=>{
     return await supabase
            .from(tableName)
            .delete()
            .eq("product_id", product_id);
}