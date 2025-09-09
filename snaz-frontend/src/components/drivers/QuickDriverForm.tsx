"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, X, User, MapPin, Phone, Truck } from "lucide-react";

interface QuickDriverFormProps {
  onSubmit: (formData: any) => Promise<void>;
  onCancel: () => void;
  initialData?: any;
  isEditing?: boolean;
  embedded?: boolean;
}

export default function QuickDriverForm({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
  embedded = false
}: QuickDriverFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    phone: initialData?.phone || "",
    route: initialData?.route || ""
  });

  const [loading, setLoading] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className={embedded ? "" : "min-h-screen bg-gradient-to-br from-slate-50 to-slate-100"} onKeyDown={handleKeyDown}>
      <div className={embedded ? "py-3" : "container mx-auto py-6 px-4"}>
        <Card className={embedded ? "shadow-md border-slate-200 bg-white py-0" : "max-w-4xl mx-auto shadow-lg border-0 bg-white py-0"}>
          <CardHeader className={embedded ? "border-b bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl rounded-b-none" : "pb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-slate-200 rounded-xl rounded-b-none"}>
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Truck className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-slate-800">
                    {isEditing ? "Edit Driver" : "New Driver Entry"}
                  </CardTitle>
                  <p className="text-sm text-slate-600 mt-1">
                    {isEditing ? "Update driver information" : "Add a new driver to the system"}
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
            <form onSubmit={handleSubmit} className="">
              {/* Driver Information Section */}
              <div className="">
                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Driver Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Driver Name */}
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
                      Driver Name *
                    </Label>
                    <Input
                      ref={nameInputRef}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className=" border-slate-300 focus:border-green-500 focus:ring-2 focus:ring-green-100"
                      placeholder="Enter driver name"
                    />
                  </div>

                  {/* Route */}
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
                      Route *
                    </Label>
                    <Input
                      value={formData.route}
                      onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                      required
                      className=" border-slate-300 focus:border-green-500 focus:ring-2 focus:ring-green-100"
                      placeholder="Route name/area"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
                      Phone Number
                    </Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className=" border-slate-300 focus:border-green-500 focus:ring-2 focus:ring-green-100"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-3 pt-6 ">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="text-sm border-slate-300 hover:bg-slate-100 order-2 sm:order-1"
                  disabled={loading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel (Esc)
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="text-sm bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg order-1 sm:order-2"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Saving..." : isEditing ? "Update Driver (Alt+S)" : "Save Driver (Alt+S)"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}