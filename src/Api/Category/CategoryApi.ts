import { supabase } from "@/supabase";
import type { Database } from "@/Types/supabase";

type Category = Database["public"]["Tables"]["category"];
const tableName="category";
export const editCatagory = async ({id,data}:{id:string,data:Category["Update"]})=>{
     return await supabase
            .from(tableName)
            .update(data)
            .eq("id", id);
}

export const deleteCatagory = async (id:string)=>{
     return await supabase
            .from(tableName)
            .delete()
            .eq("id", id);
}
export const addCatagory = async (data:Category["Insert"])=>{
     return await supabase
            .from(tableName)
            .insert(data);
}

export const getCatagory = async ()=>{
     return await supabase
            .from(tableName)
            .select("*")
            .order("name");
}

export const getProductWithCatagory = async ()=>{
     return await supabase
            .from(tableName)
            .select("*,product(*)")
            .order("name");
}

