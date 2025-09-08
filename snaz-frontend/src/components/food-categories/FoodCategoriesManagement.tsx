"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { apiClient, FoodCategory } from "@/lib/api";
import { toast } from "sonner";

export default function FoodCategoriesManagement() {
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<FoodCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<FoodCategory | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    const filtered = categories.filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCategories(filtered);
  }, [categories, searchTerm]);

  const loadCategories = async () => {
    try {
      const data = await apiClient.getFoodCategories();
      setCategories(data);
      setFilteredCategories(data);
    } catch (error) {
      toast.error("Failed to load food categories");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        const updatedCategory = await apiClient.updateFoodCategory(editingCategory._id, formData);
        setCategories(categories.map(c => c._id === updatedCategory._id ? updatedCategory : c));
        toast.success("Food category updated successfully");
      } else {
        const newCategory = await apiClient.createFoodCategory(formData);
        setCategories([...categories, newCategory]);
        toast.success("Food category created successfully");
      }
      resetForm();
    } catch (error) {
      toast.error(editingCategory ? "Failed to update food category" : "Failed to create food category");
    }
  };

  const handleEdit = (category: FoodCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (category: FoodCategory) => {
    if (window.confirm(`Are you sure you want to delete category "${category.name}"?`)) {
      try {
        await apiClient.deleteFoodCategory(category._id);
        setCategories(categories.filter(c => c._id !== category._id));
        toast.success("Food category deleted successfully");
      } catch (error) {
        toast.error("Failed to delete food category");
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "" });
    setEditingCategory(null);
    setIsDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>All Food Categories</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editingCategory ? "Edit Food Category" : "Add New Food Category"}</DialogTitle>
                  <DialogDescription>
                    {editingCategory ? "Update the food category's information." : "Enter the food category details below."}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="col-span-3"
                        required
                        placeholder="e.g., Normal, Special, Premium"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">Description</Label>
                      <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="col-span-3"
                        placeholder="Brief description (optional)"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingCategory ? "Update" : "Create"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search categories by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {loading ? (
            <div className="text-center py-8">Loading food categories...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category._id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.description || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={category.isActive ? "default" : "secondary"}>
                        {category.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(category.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(category)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!loading && filteredCategories.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? "No food categories found matching your search." : "No food categories added yet."}
            </div>
          )}
        </CardContent>
      </Card>
  );
}