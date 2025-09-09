"use client";

import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Plus } from "lucide-react";
import { apiClient, Driver } from "@/lib/api";
import { ExcelExporter } from "@/lib/excel-export";
import { DriversDataTable } from "@/components/drivers/DriversDataTable";
import QuickDriverForm from "@/components/drivers/QuickDriverForm";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    route: ""
  });

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    try {
      const data = await apiClient.getDrivers();
      setDrivers(data);
    } catch (error) {
      toast.error("Failed to load drivers");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFormSubmit = async (submittedFormData: any) => {
    try {
      if (editingDriver) {
        const updatedDriver = await apiClient.updateDriver(editingDriver._id, submittedFormData);
        setDrivers(drivers.map(d => d._id === updatedDriver._id ? updatedDriver : d));
        toast.success("Driver updated successfully");
      } else {
        const newDriver = await apiClient.createDriver(submittedFormData);
        setDrivers([...drivers, newDriver]);
        toast.success("Driver created successfully");
      }
      setShowAddForm(false);
      setEditingDriver(null);
    } catch (error) {
      toast.error(editingDriver ? "Failed to update driver" : "Failed to create driver");
    }
  };

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name,
      phone: driver.phone || "",
      route: driver.route
    });
    setShowAddForm(true);
  };

  const handleDelete = async (driver: Driver) => {
    if (window.confirm(`Are you sure you want to delete driver "${driver.name}"?`)) {
      try {
        await apiClient.deleteDriver(driver._id);
        setDrivers(drivers.filter(d => d._id !== driver._id));
        toast.success("Driver deleted successfully");
      } catch (error) {
        toast.error("Failed to delete driver");
      }
    }
  };

  const handleAddNew = () => {
    setEditingDriver(null);
    setFormData({
      name: "",
      phone: "",
      route: ""
    });
    setShowAddForm(true);
  };

  const handleExportDrivers = () => {
    try {
      ExcelExporter.exportDrivers(drivers);
      toast.success("Drivers data exported successfully");
    } catch (error) {
      toast.error("Failed to export drivers data");
    }
  };

  return (
    <ProtectedRoute>
      <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Drivers</h1>
            <p className="text-muted-foreground">
              Manage delivery drivers with tally accounting-style interface
            </p>
          </div>
          <div>
            <Button onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              New Driver
            </Button>
          </div>
        </div>

        {showAddForm && (
          <QuickDriverForm
            embedded
            onSubmit={handleQuickFormSubmit}
            onCancel={() => setShowAddForm(false)}
            initialData={editingDriver ? formData : undefined}
            isEditing={!!editingDriver}
          />
        )}

        {/* Data Table */}
        <DriversDataTable
          drivers={drivers}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddNew={handleAddNew}
          onExport={handleExportDrivers}
        />
      </div>
    </MainLayout>
    </ProtectedRoute>
  );
}