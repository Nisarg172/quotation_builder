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
} from "lucide-react";
import { Button } from "../components/CustomButton";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Drawer } from "../components/Drawer";
import { toast } from "sonner";

import type { AccessoryOption, Category, ProductInput } from "@/Types/type";
import type { Product } from "@/Types/type"; // Assuming you already have this type
import { FileUploader } from "@/components/FileUploader";
import {
  addProduct,
  deleteProduct,
  editProduct,
  getProduct,
} from "@/Api/Category/ProductApi";
import { getCatagory } from "@/Api/Category/CategoryApi";
import Select from "react-select";
import {
  addProductAccessory,
  removeAccessoryByProductId,
} from "@/Api/Category/ProductAccessory";

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
    []
  );

  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    id: string | null;
  }>({ open: false, id: null });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductInput>();

  // Fetch products and categories
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
        data.map((acc) => ({ label: acc.name, value: acc.id }))
      );
    }
  };

  // Save product
  const onSubmit = async (form: ProductInput) => {
    try {
      let imageUrl: string | null = editingProduct?.image_url || null;

      // Upload image only on submit
      if (form.imageFile && form.imageFile instanceof File) {
        const fileName = `${Date.now()}_${form.imageFile.name}`;
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
        price: form.price,
        make: form.make,
        installation_amount_1: form.installation_amount_1 || 0,
        category_id: form.category_id,
        is_accessory: false,
        image_url: imageUrl,
      };

      if (editingProduct) {
        if (JSON.stringify(form.accessory) !== JSON.stringify(editProduct)) {
          // remove old accessories
          const { error: removeAccessoryByProductIdError } =
            await removeAccessoryByProductId(editingProduct.id);
          if (removeAccessoryByProductIdError)
            throw removeAccessoryByProductIdError;

          const productAccessoryIds = form.accessory.map((acc) => ({
            accessory_id: acc.value,
            product_id: editingProduct.id,
          }));
          const { error: addProductAccessoryError } = await addProductAccessory(
            productAccessoryIds
          );
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
          const productAccessoryIds = form.accessory.map((acc) => ({
            accessory_id: acc.value,
            product_id: data.id,
          }));
          const { error: addProductAccessoryError } = await addProductAccessory(
            productAccessoryIds
          );
          if (addProductAccessoryError) throw addProductAccessoryError;
          toast.success("Product created");
        }
      }

      reset({});
      setOpenDrawer(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (err: any) {
      console.log(err);
      toast.error(err.message);
    }
  };

  // Delete product
  const handleDelete = async () => {
    if (!confirmDelete.id) return;
    const { error } = await deleteProduct(confirmDelete.id);

    if (error) toast.error(error.message);
    else {
      toast.success("Product deleted");
      fetchProducts();
    }

    setConfirmDelete({ open: false, id: null });
  };

  // When editing, preload form values
  const startEdit = (p: Product) => {
    setEditingProduct(p);
    reset({
      name: p.name,
      description: p.description ?? "",
      model: p.model ?? "",
      price: p.price,
      make: p.make ?? "",
      installation_amount_1: p.installation_amount_1,
      category_id: p.category_id ?? undefined,
      imageFile: p.image_url, // keep empty, preview shows existing
      accessory: p.accessory,
    });
    setOpenDrawer(true);
  };

  // Enhanced filtering and sorting logic
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

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedProducts.slice(
      startIndex,
      startIndex + itemsPerPage
    );
  }, [filteredAndSortedProducts, currentPage, itemsPerPage]);

  // Group by category logic
  const groupedProducts = useMemo(() => {
    if (!groupByCategory) return null;

    return filteredAndSortedProducts.reduce((acc, product) => {
      const categoryName = product.category?.name || "Uncategorized";
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(product);
      return acc;
    }, {} as Record<string, Product[]>);
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

  // Product Row Component
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
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-12 w-12">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="h-12 w-12 object-cover rounded-lg border border-gray-200"
              />
            ) : (
              <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-400 text-xs">No Image</span>
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {product.name}
            </div>
            {product.description && (
              <div className="text-sm text-gray-500 truncate max-w-xs">
                {product.description}
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">
        {product.model || "-"}
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">{product.make || "-"}</td>
      <td className="px-6 py-4 text-sm font-medium text-gray-900">
        ₹{product.price.toLocaleString()}
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">
        <div className="space-y-1">
          <div>Amount 1: ₹{product.installation_amount_1.toLocaleString()}</div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {product.category?.name || "Uncategorized"}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(product)}
            className="flex items-center"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(product.id)}
            className="flex items-center"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 mb-3">
          <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 pr-4 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* View Options */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={groupByCategory}
                  onChange={(e) => setGroupByCategory(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Filter className="h-4 w-4" />
                Group by Category
              </label>

              <div className="text-sm text-gray-600">
                <Button
                  onClick={() => {
                    reset();
                    setEditingProduct(null);
                    setOpenDrawer(true);
                  }}
                  className="flex items-center gap-.5"
                >
                  <Plus className="h-4 w-4" /> Add Product
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Product List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading products...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Plus className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No products yet
              </h3>
              <p className="text-gray-500 mb-4">
                Get started by adding your first product
              </p>
              <Button
                onClick={() => {
                  reset();
                  setEditingProduct(null);
                  setOpenDrawer(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Product
              </Button>
            </div>
          ) : groupByCategory && groupedProducts ? (
            <div className="space-y-6 p-6">
              {Object.entries(groupedProducts).map(
                ([categoryName, categoryProducts]) => (
                  <div
                    key={categoryName}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <div className="bg-blue-50 px-4 py-1.5 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-blue-900">
                        {categoryName}
                      </h3>
                      <p className="text-sm text-blue-700">
                        {categoryProducts.length} products
                      </p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <tbody className="divide-y divide-gray-200">
                          {categoryProducts.map((p) => (
                            <ProductRow
                              key={p.id}
                              product={p}
                              onEdit={startEdit}
                              onDelete={(id) =>
                                setConfirmDelete({ open: true, id })
                              }
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort("name")}
                        className="flex items-center hover:text-blue-600"
                      >
                        Product <SortIcon field="name" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort("model")}
                        className="flex items-center hover:text-blue-600"
                      >
                        Model <SortIcon field="model" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort("make")}
                        className="flex items-center hover:text-blue-600"
                      >
                        Make <SortIcon field="make" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort("price")}
                        className="flex items-center hover:text-blue-600"
                      >
                        Price <SortIcon field="price" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Installation
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
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
                      onDelete={(id) => setConfirmDelete({ open: true, id })}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!groupByCategory && totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(
                  currentPage * itemsPerPage,
                  filteredAndSortedProducts.length
                )}{" "}
                of {filteredAndSortedProducts.length} results
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                  )
                  .map((page, index, array) => (
                    <div key={page} className="flex items-center">
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-2 text-gray-400">...</span>
                      )}
                      <Button
                        variant={currentPage === page ? "primary" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="min-w-[2.5rem]"
                      >
                        {page}
                      </Button>
                    </div>
                  ))}

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
        </div>
      </div>

      {/* Drawer Form */}
      <Drawer
        open={openDrawer}
        onClose={() => { 
          if(editingProduct) reset({}); 
          setOpenDrawer(false); 
          
        }}
        title={editingProduct ? "Edit Product" : "Add New Product"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          {/* Product Name */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Product Name *
            </label>
            <input
              type="text"
              placeholder="Enter product name"
              className="w-full border border-gray-300 rounded-lg px-4 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              {...register("name", { required: "Product name is required" })}
            />
            {errors.name && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Description
            </label>
            <textarea
              placeholder="Enter product description"
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              {...register("description")}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Model */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Model *
              </label>
              <input
                type="text"
                placeholder="Enter model number"
                className="w-full border border-gray-300 rounded-lg px-4 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                {...register("model", { required: "Model is required" })}
              />
              {errors.model && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  {errors.model.message}
                </p>
              )}
            </div>

            {/* Price */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Price (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="Enter price"
                className="w-full border border-gray-300 rounded-lg px-4 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                {...register("price", {
                  required: "Price is required",
                  // min: { value: 0.01, message: "Price must be greater than 0" },
                })}
              />
              {errors.price && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  {errors.price.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Make */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Make
              </label>
              <input
                type="text"
                placeholder="Enter make"
                className="w-full border border-gray-300 rounded-lg px-4 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                {...register("make")}
              />
            </div>

            {/* Installation Amount 1 */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Installation Amount 1
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="Enter installation amount 1"
                className="w-full border border-gray-300 rounded-lg px-4 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                {...register("installation_amount_1")}
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Category *
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
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
              <p className="text-sm text-red-600 flex items-center gap-1">
                {errors.category_id.message}
              </p>
            )}
          </div>

          {/* Accessories Multi Select */}
          <div className="space-y-2">
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
                  placeholder="Select accessories"
                  closeMenuOnSelect={false}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderRadius: "0.5rem",
                      borderColor: "#d1d5db",
                      minHeight: "48px",
                    }),
                  }}
                />
              )}
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Product Image {!editingProduct && "*"}
            </label>
            <Controller
              control={control}
              name="imageFile"
              // rules={{ required: !editingProduct && "Image is required" }}
              render={({ field }) => {
                let PreviewUrl: null | string = null;
                if (field.value instanceof File) {
                  PreviewUrl = URL.createObjectURL(field.value);
                } else {
                  PreviewUrl = field.value;
                }
                return (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
                    <FileUploader
                      onChange={(file) => {
                        field.onChange(file);
                      }}
                      file={field.value}
                      previewUrl={
                       PreviewUrl
                      }
                    />
                  </div>
                );
              }}
            />
            {errors.imageFile && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                {errors.imageFile.message}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpenDrawer(false)}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-6 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  {editingProduct ? "Updating..." : "Creating..."}
                </>
              ) : editingProduct ? (
                "Update Product"
              ) : (
                "Save Product"
              )}
            </Button>
          </div>
        </form>
      </Drawer>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={confirmDelete.open}
        onCancel={() => setConfirmDelete({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Product"
        description="This action cannot be undone."
        icon={<Trash2 className="h-8 w-8 text-red-600" />}
      />
    </div>
  );
}
