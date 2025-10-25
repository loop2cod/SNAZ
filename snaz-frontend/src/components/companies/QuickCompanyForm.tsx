"use client";

import { useState} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, X } from "lucide-react";
import { Company } from "@/lib/api";

interface QuickCompanyFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
  isEditing?: boolean;
  embedded?: boolean;
}

export default function QuickCompanyForm({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
  embedded = false
}: QuickCompanyFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    address: initialData?.address || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    contactPerson: initialData?.contactPerson || ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.address.trim()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      
      if (!isEditing) {
        // Reset form for new entries
        setFormData({
          name: "",
          address: "",
          phone: "",
          email: "",
          contactPerson: ""
        });
      }
    } catch (error) {
      // Error handling is done in parent
    } finally {
      setLoading(false);
    }
  };


  const handleChange = (field: string, value: string) => {
    setFormData((prevData) => ({ ...prevData, [field]: value }));
  };


  return <Card className="border-2 border-blue-200 bg-blue-50/30">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                {isEditing ? "Edit Company" : "New Company"}
              </CardTitle>
              <CardDescription>
                {isEditing ? "Update company information" : "Create a new company entry"}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onCancel} disabled={loading}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Company Name *</Label>
          <Input
            id="name"
            name="company-name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Enter company name"
            required
            disabled={loading}
            className="h-9 bg-white"
            autoComplete="organization"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="contactPerson">Contact Person</Label>
          <Input
            id="contactPerson"
            name="contact-person"
            value={formData.contactPerson}
            onChange={(e) => handleChange('contactPerson', e.target.value)}
            placeholder="Enter contact person"
            disabled={loading}
            className="h-9 bg-white"
            autoComplete="name"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address *</Label>
        <Textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={(e) => handleChange('address', e.target.value)}
          placeholder="Enter company address"
          rows={2}
          required
          disabled={loading}
          className="resize-none"
          autoComplete="street-address"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="Enter phone number"
            disabled={loading}
            className="h-9 bg-white"
            autoComplete="tel"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="Enter email address"
            disabled={loading}
            className="h-9 bg-white"
            autoComplete="email"
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
        <Button type="submit" disabled={loading || !formData.name.trim() || !formData.address.trim()}>
          {loading ? (isEditing ? "Updating..." : "Creating...") : (isEditing ? "Update Company" : "Create Company")}
        </Button>
      </div>
    </form>
        </CardContent>
      </Card>;
}