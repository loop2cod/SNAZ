"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, X, User, MapPin, Phone, Truck, Package, Utensils, Calendar } from "lucide-react";
import { Driver, FoodCategory } from "@/lib/api";

interface QuickCustomerFormProps {
  drivers: Driver[];
  foodCategories: FoodCategory[];
  onSubmit: (formData: any) => Promise<void>;
  onCancel: () => void;
  initialData?: any;
  isEditing?: boolean;
  embedded?: boolean;
}

export default function QuickCustomerForm({
  drivers,
  foodCategories,
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
  embedded = false
}: QuickCustomerFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    address: initialData?.address || "",
    phone: initialData?.phone || "",
    driverId: initialData?.driverId || "",
    packages: initialData?.packages || [{ categoryId: "", unitPrice: 0 }],
    dailyFood: initialData?.dailyFood || { lunch: "", dinner: "" },
    startDate: initialData?.startDate || "",
    endDate: initialData?.endDate || ""
  });

  const [loading, setLoading] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  
  // Ensure exactly one package entry exists in the form (single selection flow)
  useEffect(() => {
    setFormData((prev) => {
      const first = prev.packages?.[0] || { categoryId: "", unitPrice: 0 };
      return { ...prev, packages: [first] };
    });
  // run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Focus on name input when form opens (tally-style)
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Alt+S to save (tally-style shortcut)
    if (e.altKey && e.key === 's') {
      e.preventDefault();
      handleSubmit(e as any);
    }
    // Escape to cancel
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  const setSinglePackageField = (field: 'categoryId' | 'unitPrice', value: string | number) => {
    const first = formData.packages?.[0] || { categoryId: "", unitPrice: 0 };
    const updated = { ...first, [field]: value } as { categoryId: string; unitPrice: number };
    setFormData({ ...formData, packages: [updated] });
  };

  return (
    <div className={embedded ? "" : "min-h-screen bg-gradient-to-br from-slate-50 to-slate-100"} onKeyDown={handleKeyDown}>
      <div className={embedded ? "" : "container mx-auto"}>
        <Card className={embedded ? "shadow-md border-slate-200 bg-white py-0" : "max-w-5xl mx-auto shadow-lg border-0 bg-white py-0"}>
          <CardHeader className={embedded ? "border-b bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl rounded-b-none" : "bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200 rounded-xl rounded-b-none"}>
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-slate-800">
                    {isEditing ? "Edit Customer" : "New Customer Entry"}
                  </CardTitle>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {isEditing ? "Update customer information" : "Add a new customer to the system"}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onCancel}
                className="h-8 px-2 hover:bg-white/60"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className={embedded ? "p-4" : "p-6"}>
            <form onSubmit={handleSubmit} className="">
              {/* Basic Info Section */}
              <div className="">
                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Customer Name */}
                  <div>
                    <Label className="text-xs font-medium text-slate-700 mb-1 block">
                      Customer Name *
                    </Label>
                    <Input
                      ref={nameInputRef}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="h-8 border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                      placeholder="Enter customer name"
                    />
                  </div>

                  {/* Driver */}
                  <div>
                    <Label className="text-xs font-medium text-slate-700 mb-1 block">
                      Driver *
                    </Label>
                    <Select
                      value={formData.driverId}
                      onValueChange={(value) => setFormData({ ...formData, driverId: value })}
                    >
                      <SelectTrigger className="h-8 border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 w-full">
                        <SelectValue placeholder="Select driver" />
                      </SelectTrigger>
                      <SelectContent>
                        {drivers.map(driver => (
                          <SelectItem key={driver._id} value={driver._id}>
                            {driver.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Phone */}
                  <div>
                    <Label className="text-xs font-medium text-slate-700 mb-1 block">
                      Phone Number
                    </Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="h-8 border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                      placeholder="Enter phone number"
                    />
                  </div>

                  {/* Start Date */}
                  <div>
                    <Label className="text-xs font-medium text-slate-700 mb-1 block">
                      Start Date *
                    </Label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                      className="h-8 border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  <div className="lg:col-span-2">
                    <Label className="text-xs font-medium text-slate-700 mb-1 block">
                      Full Address *
                    </Label>
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                      className="h-8 border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                      placeholder="Enter complete delivery address"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-slate-700 mb-1 block">
                      End Date (Optional)
                    </Label>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="h-8 border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </div>

              {/* Package Pricing Section (single selection) */}
              <div className="">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-3 rounded-lg">
                  <div className="">
                    <Label className="text-xs font-medium text-slate-700 mb-1 block">Food Category *</Label>
                    <Select
                      value={formData.packages[0]?.categoryId || ""}
                      onValueChange={(value) => setSinglePackageField('categoryId', value)}
                    >
                      <SelectTrigger className="h-8 border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-100">
                        <SelectValue placeholder="Select food category" />
                      </SelectTrigger>
                      <SelectContent>
                        {foodCategories.map(category => (
                          <SelectItem key={category._id} value={category._id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-slate-700 mb-1 block">Unit Price (S$) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.packages[0]?.unitPrice || ""}
                      onChange={(e) => setSinglePackageField('unitPrice', Number(e.target.value))}
                      className="h-8 text-right border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Daily Food Requirements Section */}
              <div className="">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-4">
                    <Label className="text-xs font-medium text-slate-700 mb-1.5 block">
                      Lunch (Bag Format) *
                    </Label>
                    <Input
                      value={formData.dailyFood.lunch}
                      onChange={(e) => setFormData({
                        ...formData,
                        dailyFood: { ...formData.dailyFood, lunch: e.target.value }
                      })}
                      required
                      className="h-8 font-mono border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                      placeholder="e.g., 5,5+7"
                    />
                    <p className="text-[11px] text-slate-500 mt-2 bg-blue-50 p-2 rounded">
                      <strong>Format:</strong> Non-veg counts + veg count (e.g., 5,5+7 = 10 non-veg + 7 veg)
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <Label className="text-xs font-medium text-slate-700 mb-1.5 block">
                      Dinner (Bag Format) *
                    </Label>
                    <Input
                      value={formData.dailyFood.dinner}
                      onChange={(e) => setFormData({
                        ...formData,
                        dailyFood: { ...formData.dailyFood, dinner: e.target.value }
                      })}
                      required
                      className="h-8 font-mono border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                      placeholder="e.g., 3+5"
                    />
                    <p className="text-[11px] text-slate-500 mt-2 bg-blue-50 p-2 rounded">
                      <strong>Format:</strong> Non-veg counts + veg count (e.g., 3+5 = 3 non-veg + 5 veg)
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="h-9 px-6 text-sm border-slate-300 hover:bg-slate-100 order-2 sm:order-1"
                  disabled={loading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel (Esc)
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-9 px-6 text-sm bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg order-1 sm:order-2"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Saving..." : isEditing ? "Update Customer (Alt+S)" : "Save Customer (Alt+S)"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
