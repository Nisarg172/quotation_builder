import { useEffect, useState, useMemo } from "react";
import {
  Pencil,
  Trash2,
  Plus,
  Search,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Drawer } from "../components/Drawer";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Button } from "../components/ui/Button";
import { toast } from "sonner";
import type { Category } from "@/Types/type";
import { useForm } from "react-hook-form";
import {
  addCatagory,
  deleteCatagory,
  editCatagory,
  getCatagory,
} from "@/Api/CategoryApi";
import Input from "@/components/ui/Input";

interface CategoryForm {
  name: string;
}

type SortField = "name";
type SortOrder = "asc" | "desc";

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryForm>({
    defaultValues: { name: "" },
  });

  async function fetchCategories() {
    setLoading(true);
    const { data, error } = await getCatagory();
    if (!error && data) setCategories(data);
    else toast.error(error?.message || "Failed to fetch categories");
    setLoading(false);
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  function openDrawerForAdd() {
    setEditing(null);
    reset({ name: "" });
    setDrawerOpen(true);
  }

  function openDrawerForEdit(cat: Category) {
    setEditing(cat);
    reset({ name: cat.name });
    setDrawerOpen(true);
  }

  async function onSubmit(values: CategoryForm) {
    if (!values.name.trim()) return;

    if (editing) {
      const { error } = await editCatagory({
        id: editing.id,
        data: { name: values.name },
      });
      if (!error) toast.success("Category updated!");
      else toast.error(error.message);
    } else {
      const { error } = await addCatagory({ name: values.name });
      if (!error) toast.success("🎉 Category added!");
      else toast.error(error.message);
    }

    reset({ name: "" });
    setDrawerOpen(false);
    setEditing(null);
    await fetchCategories();
  }

  async function handleDelete() {
    if (!deleteId) return;
    const { error } = await deleteCatagory(deleteId);
    if (!error) {
      toast.success("🗑️ Category deleted!");
      setDeleteId(null);
      await fetchCategories();
    } else toast.error(error.message);
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp className="ml-1 h-4 w-4 text-gray-400" />;
    return sortOrder === "asc" ? (
      <ChevronUp className="ml-1 h-4 w-4 text-blue-600" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4 text-blue-600" />
    );
  };

  const filteredAndSortedCategories = useMemo(() => {
    let filtered = categories;
    if (searchTerm.trim()) {
      filtered = categories.filter((category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return [...filtered].sort((a, b) => {
      const aValue = a[sortField].toLowerCase();
      const bValue = b[sortField].toLowerCase();
      return sortOrder === "asc" 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    });
  }, [categories, searchTerm, sortField, sortOrder]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header & Controls */}
        <div className="flex flex-col gap-4 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
            <Button
              onClick={openDrawerForAdd}
              className="w-full md:w-auto flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" /> Add Category
            </Button>
          </div>

          <div className="relative w-full md:max-w-sm">
            <Input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search size={18} className="text-gray-400" />}
              className="w-full"
            />
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort("name")}
                      className="flex items-center hover:text-blue-600 transition-colors"
                    >
                      Name <SortIcon field="name" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={2} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
                        <p className="text-gray-500 text-sm font-medium">Loading categories...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredAndSortedCategories.length > 0 ? (
                  filteredAndSortedCategories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900 break-words">
                          {cat.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDrawerForEdit(cat)}
                            className="h-9 w-9 p-0"
                            title="Edit Category"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteId(cat.id)}
                            className="h-9 w-9 p-0"
                            title="Delete Category"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="px-6 py-16 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="h-8 w-8 text-gray-300" />
                        {searchTerm.trim() ? (
                          <>
                            <p className="font-medium">No results for "{searchTerm}"</p>
                            <button
                              onClick={() => setSearchTerm("")}
                              className="text-blue-600 hover:text-blue-800 text-sm underline transition-colors"
                            >
                              Clear search filters
                            </button>
                          </>
                        ) : (
                          <p className="font-medium">Your category list is empty.</p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Drawer Form */}
      <Drawer
        open={drawerOpen}
        title={editing ? "Edit Category" : "Add New Category"}
        onClose={() => setDrawerOpen(false)}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
          <div className="p-6 space-y-4 flex-grow">
            <Input
              label="Category Name"
              placeholder="e.g. Electronics, Home & Kitchen"
              errorMessage={errors.name?.message}
              register={register("name", { required: "Category name is required" })}
              className="w-full"
            />
          </div>
          
          <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDrawerOpen(false)}
              className="flex-1 order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 order-1 sm:order-2 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : editing ? "Update" : "Save"}
            </Button>
          </div>
        </form>
      </Drawer>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={!!deleteId}
        title="Confirm Deletion"
        description="This action cannot be undone. This category will be permanently removed from the system."
        onCancel={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}