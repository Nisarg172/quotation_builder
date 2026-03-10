"use client";

import { useEffect, useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Pencil,
  Trash2,
  Plus,
  Search,
  ChevronUp,
  ChevronDown,
  Filter,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Drawer } from "../components/Drawer";
import { toast } from "sonner";

import type { AccessoryOption, Category, ProductInput } from "@/Types/type";
import type { Product } from "@/Types/type";
import { FileUploader } from "@/components/FileUploader";
import {
  addProduct,
  deleteProduct,
  editProduct,
  getProduct,
} from "@/Api/ProductApi";
import { getCatagory } from "@/Api/CategoryApi";
import Select from "react-select";
import {
  addProductAccessory,
  removeAccessoryByProductId,
} from "@/Api/ProductAccessory";
import Input from "@/components/ui/Input";
import { removeMedia, uploadeMedia } from "@/Api/storage";

export default function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Enhanced state for table features
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof Product | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [groupByCategory, setGroupByCategory] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [openDrawer, setOpenDrawer] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [accessoryOptions, SetAccessoryOptions] = useState<AccessoryOption[]>(
    [],
  );

  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    id: string | null;
    imageUrl: string | null;
  }>({ open: false, id: null, imageUrl: null });

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
    fetchAccessories();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await getProduct(false);
    if (error) toast.error(error.message);
    else {
      const filteredData = data.map((product) => ({
        ...product,
        accessory: product.accessories.map((acc) => {
          return { label: acc.accessory.name, value: acc.accessory.id };
        }),
      }));
      setProducts(filteredData || []);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data, error } = await getCatagory();
    if (error) toast.error(error.message);
    else setCategories(data || []);
  };

  const fetchAccessories = async () => {
    const { data, error } = await getProduct(true);
    if (error) toast.error(error.message);
    else {
      SetAccessoryOptions(
        data.map((acc) => ({ label: acc.name, value: acc.id })),
      );
    }
  };

  const onSubmit = async (form: ProductInput) => {
    try {
      let imageUrl: string | null = editingProduct?.image_url || null;

      if (form.imageFile && form.imageFile instanceof File) {
        const fileName = `${Date.now()}_${form.imageFile.name}`;
        const { error: uploadError, data } = await uploadeMedia({
          bucketName: "image",
          fileName,
          file: form.imageFile,
        });

        if (uploadError) throw uploadError;
        // remove old media
        if (imageUrl) {
          const removePath = imageUrl
            ?.split(`${import.meta.env.VITE_IMAGE_BASE_URL}/image/`)
            .at(1);
          removePath &&
            (await removeMedia({
              bucketName: "image",
              removePath: [removePath],
            }));
        }
        imageUrl = `${import.meta.env.VITE_IMAGE_BASE_URL}/${data.fullPath}`;
      }

      // remove image
      if (!form.imageFile && imageUrl) {
        const removePath = imageUrl
          ?.split(`${import.meta.env.VITE_IMAGE_BASE_URL}/image/`)
          .at(1);
        removePath &&
          (await removeMedia({
            bucketName: "image",
            removePath: [removePath],
          }));
        imageUrl = null;
      }

      const payload = {
        name: form.name,
        description: form.description,
        model: form.model,
        price: form.price,
        make: form.make,
        installation_amount: form.installation_amount || 0,
        category_id: form.category_id,
        is_accessory: false,
        image_url: imageUrl,
        base_quantity: Number(form.base_quantity || 1),
      };

      if (editingProduct) {
        if (JSON.stringify(form.accessory) !== JSON.stringify(editProduct)) {
          const { error: removeAccessoryByProductIdError } =
            await removeAccessoryByProductId(editingProduct.id);
          if (removeAccessoryByProductIdError)
            throw removeAccessoryByProductIdError;

          const productAccessoryIds = form.accessory.map((acc) => ({
            accessory_id: acc.value,
            product_id: editingProduct.id,
          }));
          const { error: addProductAccessoryError } =
            await addProductAccessory(productAccessoryIds);
          if (addProductAccessoryError) throw addProductAccessoryError;
        }
        const { error } = await editProduct({
          id: editingProduct.id,
          data: payload,
        });
        if (error) throw error;
        toast.success("Product updated");
      } else {
        const { error, data } = await addProduct(payload);
        if (error) throw error;
        else {
          const productAccessoryIds = form.accessory?.map((acc) => ({
            accessory_id: acc.value,
            product_id: data.id,
          }));
          if (productAccessoryIds?.length > 0) {
            const { error: addProductAccessoryError } =
              await addProductAccessory(productAccessoryIds);
            if (addProductAccessoryError) throw addProductAccessoryError;
            toast.success("Product created");
          }
        }
      }

      reset({});
      setOpenDrawer(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete.id) return;
    const { error } = await deleteProduct(confirmDelete.id);

    const removePath = confirmDelete.imageUrl
      ?.split(`${import.meta.env.VITE_IMAGE_BASE_URL}/image/`)
      .at(1);
    removePath &&
      (await removeMedia({ bucketName: "image", removePath: [removePath] }));

    if (error) toast.error(error.message);
    else {
      toast.success("Product deleted");
      fetchProducts();
    }
    setConfirmDelete({ open: false, id: null, imageUrl: null });
  };

  const startEdit = (p: Product) => {
    setEditingProduct(p);
    reset({
      name: p.name,
      description: p.description ?? "",
      model: p.model ?? "",
      price: p.price,
      make: p.make ?? "",
      installation_amount: p.installation_amount,
      category_id: p.category_id ?? undefined,
      imageFile: p.image_url,
      accessory: p.accessory,
      base_quantity: p.base_quantity,
    });
    setOpenDrawer(true);
  };

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.model?.toLowerCase().includes(searchTerm.toLowerCase()) ??
          false) ||
        (product.make?.toLowerCase().includes(searchTerm.toLowerCase()) ??
          false) ||
        (product.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ??
          false);

      const matchesCategory =
        selectedCategory === "" || product.category_id === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    if (sortField) {
      filtered.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortDirection === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
        }
        return 0;
      });
    }
    return filtered;
  }, [products, searchTerm, selectedCategory, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedProducts.slice(
      startIndex,
      startIndex + itemsPerPage,
    );
  }, [filteredAndSortedProducts, currentPage, itemsPerPage]);

  const groupedProducts = useMemo(() => {
    if (!groupByCategory) return null;
    return filteredAndSortedProducts.reduce(
      (acc, product) => {
        const categoryName = product.category?.name || "Uncategorized";
        if (!acc[categoryName]) acc[categoryName] = [];
        acc[categoryName].push(product);
        return acc;
      },
      {} as Record<string, Product[]>,
    );
  }, [filteredAndSortedProducts, groupByCategory]);

  const handleSort = (field: keyof Product) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const SortIcon = ({ field }: { field: keyof Product }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4 inline ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 inline ml-1" />
    );
  };

  const ProductRow = ({
    product,
    onEdit,
    onDelete,
  }: {
    product: Product;
    onEdit: (product: Product) => void;
    onDelete: (id: string) => void;
  }) => (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-4 sm:px-6">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="h-10 w-10 sm:h-12 sm:w-12 object-cover"
              />
            ) : (
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-400 text-[10px] text-center px-1">
                  No Image
                </span>
              </div>
            )}
          </div>
          <div className="ml-3 sm:ml-4 overflow-hidden w-full">
            <div className="text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-xs">
              {product.name}
            </div>
            {product.description && (
              <div className="text-xs text-gray-500 truncate max-w-[120px] sm:max-w-xs">
                {product.description}
              </div>
            )}

            {/* Mobile-only details card */}
            <div className="mt-2 space-y-1 text-xs text-gray-600 md:hidden">
              <div className="flex justify-between gap-4">
                <span className="font-semibold text-gray-700">Model</span>
                <span className="truncate max-w-[160px] text-right">
                  {product.model || "-"}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="font-semibold text-gray-700">Make</span>
                <span className="truncate max-w-[160px] text-right">
                  {product.make || "-"}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="font-semibold text-gray-700">Base Qty</span>
                <span className="text-right">{product.base_quantity ?? 1}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="font-semibold text-gray-700">Price</span>
                <span className="font-semibold text-gray-900 text-right">
                  ₹{product.price.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="font-semibold text-gray-700">
                  Installation
                </span>
                <span className="text-right">
                  ₹{product.installation_amount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="font-semibold text-gray-700">Category</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700">
                  {product.category?.name || "Uncategorized"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 text-sm text-gray-900 hidden md:table-cell">
        {product.model || "-"}
      </td>
      <td className="px-4 py-4 text-sm text-gray-900 hidden sm:table-cell">
        {product.make || "-"}
      </td>
      <td className="px-4 py-4 text-sm font-medium text-gray-900 hidden md:table-cell">
        ₹{product.price.toLocaleString()}
      </td>
      <td className="px-4 py-4 text-sm text-gray-900 hidden lg:table-cell">
        <div>₹{product.installation_amount.toLocaleString()}</div>
      </td>
      <td className="px-4 py-4 hidden sm:table-cell">
        <span className="inline-flex items-center px-5 py-0.5 rounded-xl text-xs font-medium bg-blue-100 text-blue-800">
          {product.category?.name || "Uncategorized"}
        </span>
      </td>
      <td className="px-4 py-4 text-right">
        <div className="inline-flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(product)}
            className="h-9 w-9 p-0"
            title="Edit Category"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(product.id)}
            className="h-9 w-9 p-0"
            title="Delete Category"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="w-full sm:max-w-xs">
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  leftIcon={<Search size={18} />}
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-4 border-t pt-4 lg:border-t-0 lg:pt-0">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={groupByCategory}
                  onChange={(e) => setGroupByCategory(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">Group by Category</span>
              </label>

              <Button
                onClick={() => {
                  reset();
                  setEditingProduct(null);
                  setOpenDrawer(true);
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" /> Add Product
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
              <span className="text-gray-500 font-medium">
                Loading catalog...
              </span>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 px-4">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-50 rounded-full flex items-center justify-center">
                <Plus className="h-10 w-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                No products found
              </h3>
              <p className="text-gray-500 mt-1 mb-6">
                Start building your catalog by adding products.
              </p>
              <Button onClick={() => setOpenDrawer(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add Your First Product
              </Button>
            </div>
          ) : groupByCategory && groupedProducts ? (
            <div className="p-4 sm:p-6 space-y-8">
              {Object.entries(groupedProducts).map(
                ([categoryName, categoryProducts]) => (
                  <div
                    key={categoryName}
                    className="border border-gray-100 rounded-xl overflow-hidden shadow-sm"
                  >
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-bold text-gray-800">
                        {categoryName}
                      </h3>
                      <span className="text-xs font-medium bg-gray-200 px-2 py-1 rounded text-gray-600">
                        {categoryProducts.length} Items
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <tbody className="divide-y divide-gray-100">
                          {categoryProducts.map((p) => (
                            <ProductRow
                              key={p.id}
                              product={p}
                              onEdit={startEdit}
                              onDelete={(id) =>
                                setConfirmDelete({
                                  open: true,
                                  id,
                                  imageUrl: p.image_url,
                                })
                              }
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ),
              )}
            </div>
          ) : (
            <>
              {/* Mobile card layout (aligned with Home page style) */}
              <div className="md:hidden space-y-4 px-3 pb-4 sm:px-4">
                {paginatedProducts.map((p) => (
                  <div
                    key={p.id}
                    className="relative group overflow-hidden bg-white rounded-xl  shadow-xl transition-all duration-500 hover:-translate-y-1 mobile-hover-card"
                  >
                    {/* Diagonal hover gradient layer, similar to Home item cards */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700 translate-x-[100%] translate-y-[100%] group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-700 ease-in-out z-0 opacity-[0.04]" />

                    <div className="relative z-10 p-4">
                      {/* Header: Category + Base Qty */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-brand-soft text-brand-primary tracking-widest uppercase">
                          {p.category?.name || "Uncategorized"}
                        </span>
                        <span className="text-[11px] text-gray-500">
                          Base Qty:{" "}
                          <span className="font-semibold text-gray-700">
                            {p.base_quantity ?? 1}
                          </span>
                        </span>
                      </div>

                      {/* Content: Image + main details */}
                      <div className="flex gap-3">
                        <div className="w-20 h-20 bg-gray-50 flex items-center justify-center overflow-hidden">
                          {p.image_url ? (
                            <img
                              src={p.image_url}
                              alt={p.name}
                              className="max-h-full max-w-full object-contain drop-shadow-sm"
                            />
                          ) : (
                            <div className="text-gray-300 font-bold text-[10px] text-center">
                              NO IMAGE
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-gray-900 font-black text-sm leading-tight group-hover:text-brand-primary transition-colors duration-300">
                            {p.name}
                          </h4>
                          {p.description && (
                            <p className="mt-1 text-xs text-gray-500 line-clamp-2 leading-snug">
                              {p.description}
                            </p>
                          )}

                          {/* Meta grid */}
                          <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-gray-600">
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-700">
                                Model
                              </span>
                              <span className="truncate">{p.model || "-"}</span>
                            </div>
                            <div className="flex flex-col items-end text-right">
                              <span className="font-semibold text-gray-700">
                                Make
                              </span>
                              <span className="truncate">{p.make || "-"}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-700">
                                Installation
                              </span>
                              <span>
                                ₹{p.installation_amount.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex flex-col items-end text-right">
                              <span className="font-semibold text-gray-700">
                                ID
                              </span>
                              <span className="truncate text-[10px] text-gray-500">
                                {p.id}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="mt-3 flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEdit(p)}
                              className="h-8 px-3 rounded-full flex items-center gap-1 text-xs"
                            >
                              <Pencil className="h-3 w-3" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                setConfirmDelete({
                                  open: true,
                                  id: p.id,
                                  imageUrl: p.image_url,
                                })
                              }
                              className="h-8 px-3 rounded-full flex items-center gap-1 text-xs"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer: Price strip similar to Home total bar */}
                    <div className="relative z-10 bg-brand-gradient px-4 py-3 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-white uppercase tracking-widest">
                        Price
                      </span>
                      <span className="text-lg font-black text-white">
                        ₹{p.price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop/tablet table layout */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-gray-600 ">
                        <button
                          onClick={() => handleSort("name")}
                          className="flex items-center hover:text-blue-600 transition-colors"
                        >
                          Product <SortIcon field="name" />
                        </button>
                      </th>
                      <th className="px-4 py-4 text-xs font-bold text-gray-600  hidden md:table-cell">
                        <button
                          onClick={() => handleSort("model")}
                          className="flex items-center hover:text-blue-600 transition-colors"
                        >
                          Model <SortIcon field="model" />
                        </button>
                      </th>
                      <th className="px-4 py-4 text-xs font-bold text-gray-600 capitalize hidden sm:table-cell">
                        <button
                          onClick={() => handleSort("make")}
                          className="flex items-center hover:text-blue-600 transition-colors"
                        >
                          Make <SortIcon field="make" />
                        </button>
                      </th>
                      <th className="px-4 py-4 text-xs font-bold text-gray-600 ">
                        <button
                          onClick={() => handleSort("price")}
                          className="flex items-center hover:text-blue-600 transition-colors"
                        >
                          Price <SortIcon field="price" />
                        </button>
                      </th>
                      <th className="px-4 py-4 text-xs font-bold text-gray-600  hidden lg:table-cell">
                        Installation
                      </th>
                      <th className="px-4 py-4 text-xs font-bold text-gray-600  hidden sm:table-cell">
                        Category
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 ">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedProducts.map((p) => (
                      <ProductRow
                        key={p.id}
                        product={p}
                        onEdit={startEdit}
                        onDelete={(id) =>
                          setConfirmDelete({
                            open: true,
                            id,
                            imageUrl: p.image_url,
                          })
                        }
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="px-6 py-4 bg-white border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-500 order-2 sm:order-1">
                    Showing{" "}
                    <span className="font-medium">
                      {(currentPage - 1) * itemsPerPage + 1}
                    </span>
                    -
                    <span className="font-medium">
                      {Math.min(
                        currentPage * itemsPerPage,
                        filteredAndSortedProducts.length,
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">
                      {filteredAndSortedProducts.length}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 order-1 sm:order-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                    >
                      Prev
                    </Button>
                    <div className="flex space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(
                          (p) =>
                            p === 1 ||
                            p === totalPages ||
                            (p >= currentPage - 1 && p <= currentPage + 1),
                        )
                        .map((page, idx, arr) => (
                          <div key={page} className="flex items-center">
                            {idx > 0 && arr[idx - 1] !== page - 1 && (
                              <span className="px-1 text-gray-400">...</span>
                            )}
                            <Button
                              variant={
                                currentPage === page ? "primary" : "outline"
                              }
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                              className="w-8 h-8 p-0"
                            >
                              {page}
                            </Button>
                          </div>
                        ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Drawer
        open={openDrawer}
        onClose={() => {
          if (editingProduct) reset({});
          setOpenDrawer(false);
        }}
        title={editingProduct ? "Edit Product" : "Add New Product"}
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-4 sm:p-1 space-y-5"
        >
          <Input
            label="Product Name"
            placeholder="Enter product name"
            errorMessage={errors?.name?.message}
            register={register("name", {
              required: "Product name is required",
            })}
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">
              Description
            </label>
            <textarea
              placeholder="Enter details..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none text-sm"
              {...register("description")}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Model"
              placeholder="e.g. XP-200"
              errorMessage={errors?.model?.message}
              register={register("model", { required: "Model is required" })}
            />

            <Input
              label="Maker"
              placeholder="Brand name"
              register={register("make")}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Price (₹)"
              placeholder="0.00"
              type="number"
              errorMessage={errors?.price?.message}
              register={register("price", { required: "Price is required" })}
            />
            <Input
              label="Installation Fee"
              type="number"
              placeholder="0"
              register={register("installation_amount")}
            />
            <Input
              label="Base Qty"
              type="number"
              register={register("base_quantity")}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">
              Category
            </label>
            <select
              className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              {...register("category_id", { required: "Category is required" })}
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <p className="text-xs text-red-600 mt-1">
                {errors.category_id.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">
              Accessories
            </label>
            <Controller
              name="accessory"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  isMulti
                  options={accessoryOptions}
                  placeholder="Link accessories..."
                  className="text-sm"
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderRadius: "0.375rem",
                      borderColor: "#d1d5db",
                      padding: "2px",
                    }),
                  }}
                />
              )}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">
              Product Image{" "}
              {!editingProduct && <span className="text-red-500">*</span>}
            </label>
            <Controller
              control={control}
              name="imageFile"
              render={({ field }) => {
                const preview =
                  field.value instanceof File
                    ? URL.createObjectURL(field.value)
                    : field.value;
                return (
                  <FileUploader
                    onChange={(file) => field.onChange(file)}
                    previewUrl={preview as string}
                  />
                );
              }}
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpenDrawer(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting
                ? "Processing..."
                : editingProduct
                  ? "Update Product"
                  : "Save Product"}
            </Button>
          </div>
        </form>
      </Drawer>

      <ConfirmDialog
        open={confirmDelete.open}
        onCancel={() =>
          setConfirmDelete({ open: false, id: null, imageUrl: null })
        }
        onConfirm={handleDelete}
        title="Delete Product"
        description="Are you sure? This will permanently remove the item from your database."
        icon={<Trash2 className="h-10 w-10 text-red-500" />}
      />
    </div>
  );
}
