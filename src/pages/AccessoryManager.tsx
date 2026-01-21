"use client";

import { useEffect, useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { supabase } from "../supabase";
import {
  Pencil,
  Trash2,
  Plus,
  Search,
  ChevronUp,
  ChevronDown,
  Filter,
  PackageOpen,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Drawer } from "../components/Drawer";
import { toast } from "sonner";

import type { Category, ProductWithoutAccessory } from "@/Types/type";
import { FileUploader } from "@/components/FileUploader";
import {
  addProduct,
  deleteProduct,
  editProduct,
  getProduct,
} from "@/Api/ProductApi";
import { getCatagory } from "@/Api/CategoryApi";
import Input from "@/components/ui/Input";

type ProductInput = {
  name: string;
  description?: string;
  model?: string;
  price: number;
  make?: string;
  installation_amount: number;
  category_id?: string;
  imageFile: File | null | string;
  is_accessory: boolean;
  base_quantity: number;
};

export default function AccessoryManager() {
  const [products, setProducts] = useState<ProductWithoutAccessory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Table state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof ProductWithoutAccessory | null>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [groupByCategory, setGroupByCategory] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [openDrawer, setOpenDrawer] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithoutAccessory | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductInput>();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await getProduct(true);
    if (error) toast.error(error.message);
    else setProducts(data || []);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data, error } = await getCatagory();
    if (error) toast.error(error.message);
    else setCategories(data || []);
  };

  const onSubmit = async (form: ProductInput) => {
    try {
      let imageUrl: string | null = editingProduct?.image_url || null;

      if (form.imageFile instanceof File) {
        const fileExt = form.imageFile.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError, data } = await supabase.storage
          .from("image")
          .upload(fileName, form.imageFile);

        if (uploadError) throw uploadError;
        imageUrl = `${import.meta.env.VITE_IMAGE_BASE_URL}/${data.fullPath}`;
      }

      const payload = {
        name: form.name,
        description: form.description,
        model: form.model,
        price: Number(form.price),
        make: form.make,
        installation_amount: Number(form.installation_amount || 0),
        category_id: form.category_id,
        is_accessory: true,
        image_url: imageUrl,
        base_quantity: Number(form.base_quantity || 1),
      };

      if (editingProduct) {
        const { error } = await editProduct({ id: editingProduct.id, data: payload });
        if (error) throw error;
        toast.success("Accessory updated");
      } else {
        const { error } = await addProduct(payload);
        if (error) throw error;
        toast.success("Accessory created");
      }

      handleCloseDrawer();
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleCloseDrawer = () => {
    reset({});
    setEditingProduct(null);
    setOpenDrawer(false);
  };

  const startEdit = (p: ProductWithoutAccessory) => {
    setEditingProduct(p);
    reset({
      name: p.name,
      description: p.description ?? "",
      model: p.model ?? "",
      price: p.price,
      make: p.make ?? "",
      installation_amount: p.installation_amount,
      category_id: p.category_id ?? undefined,
      base_quantity: p.base_quantity,
      imageFile: p.image_url,
    });
    setOpenDrawer(true);
  };

  const handleDelete = async () => {
    if (!confirmDelete.id) return;
    const { error } = await deleteProduct(confirmDelete.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted successfully");
      fetchProducts();
    }
    setConfirmDelete({ open: false, id: null });
  };

  // Logic: Filter & Sort
  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter((p) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        p.name.toLowerCase().includes(search) ||
        p.model?.toLowerCase().includes(search) ||
        p.make?.toLowerCase().includes(search);
      const matchesCat = !selectedCategory || p.category_id === selectedCategory;
      return matchesSearch && matchesCat;
    });

    if (sortField) {
      result.sort((a, b) => {
        const aVal = a[sortField] ?? "";
        const bVal = b[sortField] ?? "";
        const factor = sortDirection === "asc" ? 1 : -1;
        return aVal > bVal ? factor : aVal < bVal ? -factor : 0;
      });
    }
    return result;
  }, [products, searchTerm, selectedCategory, sortField, sortDirection]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedProducts.slice(start, start + itemsPerPage);
  }, [filteredAndSortedProducts, currentPage]);

  const groupedProducts = useMemo(() => {
    if (!groupByCategory) return null;
    return filteredAndSortedProducts.reduce((acc, p) => {
      const catName = p.category?.name || "Uncategorized";
      if (!acc[catName]) acc[catName] = [];
      acc[catName].push(p);
      return acc;
    }, {} as Record<string, ProductWithoutAccessory[]>);
  }, [filteredAndSortedProducts, groupByCategory]);

  const handleSort = (field: keyof ProductWithoutAccessory) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Sub-component: Product Row
  const ProductRow = ({ product }: { product: ProductWithoutAccessory }) => (
    <tr className="hover:bg-gray-50/80 transition-colors group">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg overflow-hidden bg-gray-100 border flex-shrink-0">
            {product.image_url ? (
              <img src={product.image_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <ImageIcon className="h-full w-full p-2 text-gray-300" />
            )}
          </div>
          <div className="max-w-[200px]">
            <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
            <p className="text-xs text-gray-500 truncate">{product.description || "No description"}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">{product.model || "-"}</td>
      <td className="px-6 py-4 text-sm text-gray-600">{product.make || "-"}</td>
      <td className="px-6 py-4 text-sm font-bold text-gray-900">₹{product.price.toLocaleString()}</td>
      <td className="px-6 py-4 text-sm text-gray-600">₹{product.installation_amount}</td>
      <td className="px-6 py-4">
        <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
          {product.category?.name || "None"}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="outline" size="sm" onClick={() => startEdit(product)}>
            <Pencil size={14} />
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setConfirmDelete({ open: true, id: product.id })}>
            <Trash2 size={14} />
          </Button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Accessory Manager</h1>
            <p className="text-gray-500 text-sm">Create and manage your product accessories inventory</p>
          </div>
          <Button onClick={() => setOpenDrawer(true)} className="rounded-xl px-5 shadow-blue-200 shadow-lg">
            <Plus className="mr-2 h-4 w-4" /> Add Accessory
          </Button>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              leftIcon={<Search size={18} className="text-gray-400" />}
              placeholder="Quick search accessories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-none bg-gray-50 focus:ring-2 rounded-xl"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-50 border-none rounded-xl text-sm px-4 py-2.5 focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-600 bg-gray-50 px-4 py-2 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={groupByCategory}
                onChange={(e) => setGroupByCategory(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Filter size={16} /> Group View
            </label>
          </div>
        </div>

        {/* List Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-20 text-center flex flex-col items-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-500 animate-pulse">Loading Inventory...</p>
            </div>
          ) : filteredAndSortedProducts.length === 0 ? (
            <div className="p-20 text-center">
              <PackageOpen className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-900">No accessories found</h3>
              <p className="text-gray-500">Try adjusting your filters or search term</p>
            </div>
          ) : groupByCategory && groupedProducts ? (
            <div className="p-6 space-y-8">
              {Object.entries(groupedProducts).map(([cat, items]) => (
                <div key={cat} className="space-y-3">
                  <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-8 h-[1px] bg-gray-200"></span> {cat} ({items.length})
                  </h2>
                  <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full text-left">
                      <tbody className="divide-y divide-gray-100">
                        {items.map((p) => <ProductRow key={p.id} product={p} />)}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                  <tr>
                    {["name", "model", "make", "price"].map((head) => (
                      <th
                        key={head}
                        className="px-6 py-4 text-xs font-bold text-gray-500 uppercase cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => handleSort(head as any)}
                      >
                        <div className="flex items-center gap-1">
                          {head} {sortField === head && (sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                        </div>
                      </th>
                    ))}
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Installation</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedProducts.map((p) => <ProductRow key={p.id} product={p} />)}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!groupByCategory && filteredAndSortedProducts.length > itemsPerPage && (
            <div className="p-4 border-t border-gray-50 flex items-center justify-between bg-gray-50/30">
              <p className="text-xs text-gray-500">
                Page {currentPage} of {Math.ceil(filteredAndSortedProducts.length / itemsPerPage)}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(v => v - 1)}>
                  Prev
                </Button>
                <Button variant="outline" size="sm" disabled={currentPage >= Math.ceil(filteredAndSortedProducts.length / itemsPerPage)} onClick={() => setCurrentPage(v => v + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Drawer
        open={openDrawer}
        onClose={handleCloseDrawer}
        title={editingProduct ? "Update Accessory" : "New Accessory"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <Input label="Product Name" placeholder="e.g. Wireless Remote" register={register("name", { required: true })} errorMessage={errors.name && "Required"} />
          
          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700">Description</label>
            <textarea
              {...register("description")}
              className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 h-24 resize-none text-sm"
              placeholder="Brief details about the accessory..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Model" register={register("model")} />
            <Input label="Make" register={register("make")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Price (₹)" type="number" register={register("price", { required: true })} />
            <Input label="Installation (₹)" type="number" register={register("installation_amount")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Base Qty" type="number" register={register("base_quantity")} />
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">Category</label>
              <select {...register("category_id")} className="w-full p-2.5 rounded-xl border border-gray-200 text-sm">
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Image</label>
            <Controller
              control={control}
              name="imageFile"
              render={({ field }) => (
                <FileUploader
                  onChange={field.onChange}
                  previewUrl={typeof field.value === "string" ? field.value : field.value ? URL.createObjectURL(field.value) : null}
                />
              )}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1 rounded-xl py-6">
              {isSubmitting ? "Processing..." : editingProduct ? "Update Item" : "Create Item"}
            </Button>
          </div>
        </form>
      </Drawer>

      <ConfirmDialog
        open={confirmDelete.open}
        onCancel={() => setConfirmDelete({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Accessory?"
        description="This will permanently remove the item from your inventory."
      />
    </div>
  );
}