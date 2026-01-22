import { supabase } from "@/supabase";

export const uploadeMedia = async ({
  bucketName,
  file,
  fileName,
}: {
  bucketName: string;
  file: File;
  fileName: string;
}) => {
  return await supabase.storage.from(bucketName).upload(fileName, file);
};


export const removeMedia = async ({
  bucketName,
  removePath
}: {
  bucketName: string;
  removePath: string[];
}) => {
  return await supabase.storage.from(bucketName).remove(removePath);
};
