"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, X } from "lucide-react";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

interface CompanyFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  embedded?: boolean;
}

export default function CompanyForm({ onSubmit, onCancel, embedded = false }: CompanyFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    contactPerson: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.address.trim()) {
      toast.error("Name and address are required");
      return;
    }

    setLoading(true);
    try {
      const company = await apiClient.createCompany(formData);
      toast.success("Company created successfully");
      onSubmit(company);
      
      // Reset form
      setFormData({
        name: "",
        address: "",
        phone: "",
        email: "",
        contactPerson: ""
      });
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to create company";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const FormContent = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Company Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Enter company name"
            required
            disabled={loading}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="contactPerson">Contact Person</Label>
          <Input
            id="contactPerson"
            value={formData.contactPerson}
            onChange={(e) => handleChange('contactPerson', e.target.value)}
            placeholder="Enter contact person name"
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address *</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => handleChange('address', e.target.value)}
          placeholder="Enter company address"
          rows={3}
          required
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="Enter phone number"
            disabled={loading}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="Enter email address"
            disabled={loading}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Company"}
        </Button>
      </div>
    </form>
  );

  if (embedded) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              New Company
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <FormContent />
        </CardContent>
      </Card>
    );
  }

  return <FormContent />;
}