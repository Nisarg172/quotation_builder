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
            .insert(data);
}

export const getProduct = async ()=>{
     return await supabase
            .from(tableName)
            .select("*,category(name)")
            .order("name");
}

