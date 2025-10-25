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
import { Save, X, Sun, Truck, Calendar, Clock } from "lucide-react";
import { Driver, Customer } from "@/lib/api";

interface QuickLunchOrderFormProps {
  customers: Customer[];
  drivers: Driver[];
  onSubmit: (formData: any) => Promise<void>;
  onCancel: () => void;
  initialData?: any;
  isEditing?: boolean;
  embedded?: boolean;
}

export function QuickLunchOrderForm({
  customers,
  drivers,
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
  embedded = false
}: QuickLunchOrderFormProps) {
  const [formData, setFormData] = useState({
    date: initialData?.date || new Date().toISOString().split('T')[0],
    driverId: initialData?.driverId || "",
    neaStartTime: initialData?.neaStartTime || "11:00",
    neaEndTime: initialData?.neaEndTime || "15:00",
    mealType: "lunch" as const
  });

  const [loading, setLoading] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus on date input when form opens
    if (dateInputRef.current) {
      dateInputRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Create NEA time stamps
      const neaStartTime = new Date(`${formData.date}T${formData.neaStartTime}:00.000Z`).toISOString();
      const neaEndTime = new Date(`${formData.date}T${formData.neaEndTime}:00.000Z`).toISOString();
      
      await onSubmit({
        ...formData,
        neaStartTime,
        neaEndTime,
        // Auto-generate orders from active customers for this meal
        orders: await generateLunchOrders(formData.driverId)
      });
    } finally {
      setLoading(false);
    }
  };

  const generateLunchOrders = async (driverId: string) => {
    // Filter customers by driver and generate lunch orders
    const driverCustomers = customers.filter(customer => 
      (typeof customer.driverId === 'string' ? customer.driverId : customer.driverId._id) === driverId
    );

    return driverCustomers.map(customer => ({
      customerId: customer._id,
      // Parse lunch bag format and create orders for each package
      items: customer.packages.map(pkg => ({
        categoryId: typeof pkg.categoryId === 'string' ? pkg.categoryId : pkg.categoryId._id,
        quantity: parseBagQuantity(customer.dailyFood?.lunch || ""),
        unitPrice: pkg.unitPrice
      }))
    })).flat();
  };

  const parseBagQuantity = (bagFormat: string) => {
    // Parse formats like "5,5+7" or "3+5"
    const parts = bagFormat.split('+');
    if (parts.length === 2) {
      const nonVeg = parts[0].includes(',') ? 
        parts[0].split(',').reduce((sum, n) => sum + parseInt(n.trim()), 0) : 
        parseInt(parts[0].trim());
      const veg = parseInt(parts[1].trim());
      return nonVeg + veg;
    }
    return parseInt(bagFormat) || 0;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Alt+S to save
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

  return (
    <div className={embedded ? "" : "min-h-screen bg-gradient-to-br from-slate-50 to-slate-100"} onKeyDown={handleKeyDown}>
      <div className={embedded ? "py-3" : "container mx-auto py-6 px-4"}>
        <Card className={embedded ? "shadow-md border-slate-200 bg-white" : "max-w-4xl mx-auto shadow-lg border-0 bg-white"}>
          <CardHeader className={embedded ? "pb-4 border-b bg-gradient-to-r from-orange-50 to-amber-50" : "pb-6 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-slate-200"}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Sun className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-slate-800">
                    {isEditing ? "Edit Lunch Order" : "New Lunch Order Entry"}
                  </CardTitle>
                  <p className="text-sm text-slate-600 mt-1">
                    {isEditing ? "Update lunch order information" : "Create a new daily lunch order"}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onCancel}
                className="h-9 px-3 hover:bg-white/60"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className={embedded ? "p-4" : "p-6"}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Order Information Section */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  Lunch Order Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Date */}
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
                      Order Date *
                    </Label>
                    <Input
                      ref={dateInputRef}
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                      className="h-10 border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    />
                  </div>

                  {/* Driver */}
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
                      Driver *
                    </Label>
                    <Select
                      value={formData.driverId}
                      onValueChange={(value) => setFormData({ ...formData, driverId: value })}
                    >
                      <SelectTrigger className="h-10 border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100">
                        <SelectValue placeholder="Select driver" />
                      </SelectTrigger>
                      <SelectContent>
                        {drivers.map(driver => (
                          <SelectItem key={driver._id} value={driver._id}>
                            {driver.name} - {driver.route}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* NEA Start Time */}
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
                      Start Time *
                    </Label>
                    <Input
                      type="time"
                      value={formData.neaStartTime}
                      onChange={(e) => setFormData({ ...formData, neaStartTime: e.target.value })}
                      required
                      className="h-10 border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    />
                  </div>

                  {/* NEA End Time */}
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
                      End Time *
                    </Label>
                    <Input
                      type="time"
                      value={formData.neaEndTime}
                      onChange={(e) => setFormData({ ...formData, neaEndTime: e.target.value })}
                      required
                      className="h-10 border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    />
                  </div>
                </div>
              </div>

              {/* Info Section */}
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <h3 className="text-sm font-semibold text-orange-800 mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Order Generation Info
                </h3>
                <p className="text-xs text-orange-700">
                  Orders will be automatically generated for all active customers assigned to the selected driver based on their lunch bag format requirements.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-3 pt-6 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="h-11 px-8 text-sm border-slate-300 hover:bg-slate-100 order-2 sm:order-1"
                  disabled={loading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel (Esc)
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-11 px-8 text-sm bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 shadow-lg order-1 sm:order-2"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Saving..." : isEditing ? "Update Lunch Order (Alt+S)" : "Save Lunch Order (Alt+S)"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}