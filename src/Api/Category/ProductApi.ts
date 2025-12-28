import { supabase } from "@/supabase";
import type { Database } from "@/Types/supabase";

export type Product = Database["public"]["Tables"]["product"];
const tableName = "product";
export const editProduct = async ({id,data}:{id:string,data:Product["Update"]})=>{
     return await supabase
            .from(tableName)
            .update(data)
            .eq("id", id);
}

export const deleteProduct = async (id:string)=>{
     return await supabase
            .from(tableName)
            .delete()
            .eq("id", id);
}
export const addProduct = async (data:Product["Insert"])=>{
     return await supabase
            .from(tableName)
            .insert(data).select().single();
}

export const getProduct = async (is_accessory: boolean)=>{
  return await supabase
    .from("product")
    .select(`
      *,
      category(name),
      accessories:product_accessory!product_accessory_product_id_fkey (
        accessory:product!product_accessory_accessory_id_fkey (*)
      )
    `)
    .eq("is_accessory", is_accessory)
    .order("name");
};


