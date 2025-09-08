"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Search, Package, Truck } from "lucide-react";
import { apiClient, Customer, Driver, FoodCategory } from "@/lib/api";
import { toast } from "sonner";

export default function CustomersManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [foodCategories, setFoodCategories] = useState<FoodCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    driverId: "",
    packages: [{ categoryId: "", unitPrice: 0 }],
    dailyFood: {
      lunch: "",
      dinner: ""
    },
    startDate: "",
    endDate: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.phone || "").includes(searchTerm)
    );
    setFilteredCustomers(filtered);
  }, [customers, searchTerm]);

  const loadData = async () => {
    try {
      const [customersData, driversData, categoriesData] = await Promise.all([
        apiClient.getCustomers(),
        apiClient.getDrivers(),
        apiClient.getFoodCategories()
      ]);
      setCustomers(customersData);
      setFilteredCustomers(customersData);
      setDrivers(driversData);
      setFoodCategories(categoriesData);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validate packages
      const validPackages = formData.packages.filter(pkg => pkg.categoryId && pkg.unitPrice > 0);
      if (validPackages.length === 0) {
        toast.error("At least one package with valid category and price is required");
        return;
      }

      const customerData = {
        ...formData,
        packages: validPackages
      };

      if (editingCustomer) {
        const updatedCustomer = await apiClient.updateCustomer(editingCustomer._id, customerData);
        setCustomers(customers.map(c => c._id === updatedCustomer._id ? updatedCustomer : c));
        toast.success("Customer updated successfully");
      } else {
        const newCustomer = await apiClient.createCustomer(customerData);
        setCustomers([...customers, newCustomer]);
        toast.success("Customer created successfully");
      }
      resetForm();
    } catch (error) {
      toast.error(editingCustomer ? "Failed to update customer" : "Failed to create customer");
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      address: customer.address,
      phone: customer.phone || "",
      driverId: typeof customer.driverId === 'string' ? customer.driverId : customer.driverId._id,
      packages: customer.packages.map(pkg => ({
        categoryId: typeof pkg.categoryId === 'string' ? pkg.categoryId : pkg.categoryId._id,
        unitPrice: pkg.unitPrice
      })),
      dailyFood: customer.dailyFood,
      startDate: customer.startDate.split('T')[0],
      endDate: customer.endDate ? customer.endDate.split('T')[0] : ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (customer: Customer) => {
    if (window.confirm(`Are you sure you want to delete customer "${customer.name}"?`)) {
      try {
        await apiClient.deleteCustomer(customer._id);
        setCustomers(customers.filter(c => c._id !== customer._id));
        toast.success("Customer deleted successfully");
      } catch (error) {
        toast.error("Failed to delete customer");
      }
    }
  };

  const addPackage = () => {
    setFormData({
      ...formData,
      packages: [...formData.packages, { categoryId: "", unitPrice: 0 }]
    });
  };

  const removePackage = (index: number) => {
    setFormData({
      ...formData,
      packages: formData.packages.filter((_, i) => i !== index)
    });
  };

  const updatePackage = (index: number, field: string, value: string | number) => {
    const updatedPackages = [...formData.packages];
    updatedPackages[index] = { ...updatedPackages[index], [field]: value };
    setFormData({ ...formData, packages: updatedPackages });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      phone: "",
      driverId: "",
      packages: [{ categoryId: "", unitPrice: 0 }],
      dailyFood: { lunch: "", dinner: "" },
      startDate: "",
      endDate: ""
    });
    setEditingCustomer(null);
    setIsDialogOpen(false);
  };

  const getDriverName = (driverId: string | Driver) => {
    if (typeof driverId === 'object') return driverId.name;
    const driver = drivers.find(d => d._id === driverId);
    return driver?.name || "Unknown Driver";
  };

  const getCategoryName = (categoryId: string | FoodCategory) => {
    if (typeof categoryId === 'object') return categoryId.name;
    const category = foodCategories.find(c => c._id === categoryId);
    return category?.name || "Unknown Category";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Customers Management</CardTitle>
              <CardDescription>Manage customers, their packages, and daily food requirements</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Customer
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingCustomer ? "Edit Customer" : "Add New Customer"}</DialogTitle>
                  <DialogDescription>
                    {editingCustomer ? "Update the customer's information." : "Enter the customer's details below."}
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
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="address" className="text-right">Address</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="col-span-3"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="driverId" className="text-right">Driver</Label>
                      <select
                        id="driverId"
                        value={formData.driverId}
                        onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                        className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                        required
                      >
                        <option value="">Select Driver</option>
                        {drivers.map(driver => (
                          <option key={driver._id} value={driver._id}>
                            {driver.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="phone" className="text-right">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="col-span-3"
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="col-span-3"
                      />
                    </div>

                    <div className="col-span-4">
                      <Label className="text-sm font-medium">Package Pricing</Label>
                      <div className="space-y-2 mt-2">
                        {formData.packages.map((pkg, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <select
                              value={pkg.categoryId}
                              onChange={(e) => updatePackage(index, 'categoryId', e.target.value)}
                              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                            >
                              <option value="">Select Category</option>
                              {foodCategories.map(category => (
                                <option key={category._id} value={category._id}>
                                  {category.name}
                                </option>
                              ))}
                            </select>
                            <Input
                              type="number"
                              placeholder="Unit Price"
                              value={pkg.unitPrice || ""}
                              onChange={(e) => updatePackage(index, 'unitPrice', Number(e.target.value))}
                              className="w-32"
                            />
                            {formData.packages.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removePackage(index)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={addPackage}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Package
                        </Button>
                      </div>
                    </div>

                    <div className="col-span-4">
                      <Label className="text-sm font-medium">Daily Food Requirements</Label>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <Label htmlFor="lunch" className="text-sm">Lunch (Bag Format)</Label>
                          <Input
                            id="lunch"
                            placeholder="e.g., 5,5+7"
                            value={formData.dailyFood.lunch}
                            onChange={(e) => setFormData({
                              ...formData,
                              dailyFood: { ...formData.dailyFood, lunch: e.target.value }
                            })}
                            required
                          />
                          <p className="text-xs text-gray-500 mt-1">Format: Non-veg counts + veg count (e.g., "5,5+7" = 10 non-veg + 7 veg)</p>
                        </div>
                        <div>
                          <Label htmlFor="dinner" className="text-sm">Dinner (Bag Format)</Label>
                          <Input
                            id="dinner"
                            placeholder="e.g., 3+5"
                            value={formData.dailyFood.dinner}
                            onChange={(e) => setFormData({
                              ...formData,
                              dailyFood: { ...formData.dailyFood, dinner: e.target.value }
                            })}
                            required
                          />
                          <p className="text-xs text-gray-500 mt-1">Format: Non-veg counts + veg count</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startDate" className="text-sm">Start Date</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="endDate" className="text-sm">End Date (Optional)</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingCustomer ? "Update" : "Create"}
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
              placeholder="Search customers by name, address, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {loading ? (
            <div className="text-center py-8">Loading customers...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Packages</TableHead>
                  <TableHead>Daily Food</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer._id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        {customer.phone && (
                          <div className="text-sm text-gray-500">{customer.phone}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{customer.address}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Truck className="w-4 h-4 text-gray-400" />
                        {getDriverName(customer.driverId)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {customer.packages.map((pkg, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            <Package className="w-3 h-3 mr-1" />
                            {getCategoryName(pkg.categoryId)}: ${pkg.unitPrice}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>L: {customer.dailyFood.lunch}</div>
                        <div>D: {customer.dailyFood.dinner}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={customer.isActive ? "default" : "secondary"}>
                        {customer.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(customer)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(customer)}
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

          {!loading && filteredCustomers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? "No customers found matching your search." : "No customers added yet."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
