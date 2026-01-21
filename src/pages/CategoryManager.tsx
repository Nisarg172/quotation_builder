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

// Form type
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
    else toast.error(error?.message);
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

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Sort icon component
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ChevronUp className="h-4 w-4 text-gray-400" />;
    }
    return sortOrder === "asc" ? (
      <ChevronUp className="h-4 w-4 text-blue-600" />
    ) : (
      <ChevronDown className="h-4 w-4 text-blue-600" />
    );
  };

  // Filter and sort categories
  const filteredAndSortedCategories = useMemo(() => {
    let filtered = categories;

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = categories.filter((category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      const aValue = a[sortField].toLowerCase();
      const bValue = b[sortField].toLowerCase();

      if (sortOrder === "asc") {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

    return sorted;
  }, [categories, searchTerm, sortField, sortOrder]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 mb-3">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Left side - Search and Filter */}
              {/* Search Bar */}
              <Input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={ <Search size={18}/>}
              />
              

            {/* Right side - Actions and Stats */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="text-sm text-gray-600">
                <Button
                  onClick={openDrawerForAdd}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" /> Add Category
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort("name")}
                    className="flex items-center hover:text-blue-600"
                  >
                    Name <SortIcon field="name" />
                  </button>
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={2} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
                      <p className="text-gray-500 text-sm">
                        Loading categories...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredAndSortedCategories.length > 0 ? (
                filteredAndSortedCategories.map((cat) => (
                  <tr
                    key={cat.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {cat.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDrawerForEdit(cat)}
                          className="flex items-center"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteId(cat.id)}
                          className="flex items-center"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={2}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    {searchTerm.trim() ? (
                      <div className="flex flex-col items-center space-y-2">
                        <p>No categories found matching "{searchTerm}"</p>
                        <button
                          onClick={() => setSearchTerm("")}
                          className="text-blue-600 hover:text-blue-800 text-sm underline"
                        >
                          Clear search
                        </button>
                      </div>
                    ) : (
                      "No categories found."
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer Form */}
      <Drawer
        open={drawerOpen}
        title={editing ? "Edit Category" : "Add Category"}
        onClose={() => setDrawerOpen(false)}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          {/* Category Name */}
          <Input
          label="Category Name"
          placeholder="Enter category name"
          errorMessage={errors.name?.message}
          register={register("name", { required: "Category name is required" })}

          />
       

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDrawerOpen(false)}
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
                  {editing ? "Updating..." : "Creating..."}
                </>
              ) : editing ? (
                "Update Category"
              ) : (
                "Save Category"
              )}
            </Button>
          </div>
        </form>
      </Drawer>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Category"
        description="Are you sure you want to delete this category? This action cannot be undone."
        onCancel={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
