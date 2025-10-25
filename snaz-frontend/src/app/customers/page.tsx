"use client";

import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Plus } from "lucide-react";
import { apiClient, Customer, Driver, FoodCategory } from "@/lib/api";
import { ExcelExporter } from "@/lib/excel-export";
import { CustomersDataTable } from "@/components/customers/CustomersDataTable";
import QuickCustomerForm from "@/components/customers/QuickCustomerForm";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [foodCategories, setFoodCategories] = useState<FoodCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
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

  const loadData = async () => {
    try {
      const [customersData, driversData, categoriesData] = await Promise.all([
        apiClient.getCustomers(),
        apiClient.getDrivers(),
        apiClient.getFoodCategories()
      ]);
      setCustomers(customersData);
      setDrivers(driversData);
      setFoodCategories(categoriesData);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFormSubmit = async (submittedFormData: any) => {
    try {
      console.log("Submitted form data:", submittedFormData);
      
      const validPackages = submittedFormData.packages.filter((pkg: any) => pkg.categoryId && pkg.unitPrice > 0);
      if (validPackages.length === 0) {
        toast.error("At least one package with valid category and price is required");
        return;
      }

      const customerData = {
        ...submittedFormData,
        packages: validPackages,
        // Ensure companyId is properly handled
        companyId: submittedFormData.companyId || undefined
      };
      
      console.log("Final customer data:", customerData);

      if (editingCustomer) {
        const updatedCustomer = await apiClient.updateCustomer(editingCustomer._id, customerData);
        setCustomers(customers.map(c => c._id === updatedCustomer._id ? updatedCustomer : c));
        toast.success("Customer updated successfully");
      } else {
        const newCustomer = await apiClient.createCustomer(customerData);
        setCustomers([...customers, newCustomer]);
        toast.success("Customer created successfully");
      }
      setShowAddForm(false);
      setEditingCustomer(null);
    } catch (error) {
      console.error("Error in handleQuickFormSubmit:", error);
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
    setShowAddForm(true);
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

  const handleAddNew = () => {
    setEditingCustomer(null);
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
    setShowAddForm(true);
  };

  const handleExportCustomers = () => {
    try {
      ExcelExporter.exportCustomers(customers);
      toast.success("Customers data exported successfully");
    } catch (error) {
      toast.error("Failed to export customers data");
    }
  };

  return (
    <ProtectedRoute requiredRoles={['admin', 'manager']}>
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
            <p className="text-muted-foreground">
              Manage customers with tally accounting-style interface
            </p>
          </div>
          <div>
            <Button onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              New Customer
            </Button>
          </div>
        </div>

        {showAddForm && (
          <QuickCustomerForm
            embedded
            drivers={drivers}
            foodCategories={foodCategories}
            onSubmit={handleQuickFormSubmit}
            onCancel={() => setShowAddForm(false)}
            initialData={editingCustomer ? formData : undefined}
            isEditing={!!editingCustomer}
          />
        )}

        {/* Data Table */}
        <CustomersDataTable
          customers={customers}
          drivers={drivers}
          foodCategories={foodCategories}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onExport={handleExportCustomers}
        />
      </div>
    </MainLayout>
    </ProtectedRoute>
  );
}
