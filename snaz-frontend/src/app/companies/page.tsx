"use client";

import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Plus } from "lucide-react";
import { apiClient, Company } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import QuickCompanyForm from "@/components/companies/QuickCompanyForm";
import { CompaniesDataTable } from "@/components/companies/CompaniesDataTable";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    contactPerson: ""
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const companiesData = await apiClient.getCompanies();
      setCompanies(companiesData);
    } catch (error) {
      toast.error("Failed to load companies");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFormSubmit = async (submittedFormData: any) => {
    try {
      if (editingCompany) {
        const updatedCompany = await apiClient.updateCompany(editingCompany._id, submittedFormData);
        setCompanies(companies.map(c => c._id === updatedCompany._id ? updatedCompany : c));
        toast.success("Company updated successfully");
      } else {
        const newCompany = await apiClient.createCompany(submittedFormData);
        setCompanies([...companies, newCompany]);
        toast.success("Company created successfully");
      }
      setShowAddForm(false);
      setEditingCompany(null);
    } catch (error: any) {
      toast.error(editingCompany ? "Failed to update company" : "Failed to create company");
    }
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      address: company.address,
      phone: company.phone || "",
      email: company.email || "",
      contactPerson: company.contactPerson || ""
    });
    setShowAddForm(true);
  };

  const handleDelete = async (company: Company) => {
    if (window.confirm(`Are you sure you want to delete company "${company.name}"?`)) {
      try {
        await apiClient.deleteCompany(company._id);
        setCompanies(companies.filter(c => c._id !== company._id));
        toast.success("Company deleted successfully");
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to delete company");
      }
    }
  };

  const handleAddNew = () => {
    setEditingCompany(null);
    setFormData({
      name: "",
      address: "",
      phone: "",
      email: "",
      contactPerson: ""
    });
    setShowAddForm(true);
  };

  return (
    <ProtectedRoute requiredRoles={['admin', 'manager']}>
      <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
            <p className="text-muted-foreground">
              Manage companies with tally accounting-style interface
            </p>
          </div>
          <div>
            <Button onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              New Company
            </Button>
          </div>
        </div>

        {showAddForm && (
          <QuickCompanyForm
            embedded
            onSubmit={handleQuickFormSubmit}
            onCancel={() => setShowAddForm(false)}
            initialData={editingCompany ? formData : undefined}
            isEditing={!!editingCompany}
          />
        )}

        {/* Data Table */}
        <CompaniesDataTable
          companies={companies}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </MainLayout>
    </ProtectedRoute>
  );
}