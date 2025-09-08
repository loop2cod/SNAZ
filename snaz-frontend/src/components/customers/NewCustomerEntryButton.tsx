"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import QuickCustomerForm from "@/components/customers/QuickCustomerForm";
import { apiClient, Driver, FoodCategory } from "@/lib/api";
import { toast } from "sonner";

export default function NewCustomerEntryButton() {
  const [open, setOpen] = useState(false);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [loading, setLoading] = useState(false);

  // Load supporting data when sheet opens
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [d, c] = await Promise.all([
          apiClient.getDrivers(),
          apiClient.getFoodCategories(),
        ]);
        if (!cancelled) {
          setDrivers(d);
          setCategories(c);
        }
      } catch {
        toast.error("Failed to load drivers/categories");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const handleCreate = async (form: any) => {
    try {
      // Validate packages
      const validPackages = (form.packages || []).filter(
        (p: any) => p.categoryId && Number(p.unitPrice) > 0
      );
      if (validPackages.length === 0) {
        toast.error("Please add at least one package with price");
        return;
      }

      await apiClient.createCustomer({ ...form, packages: validPackages });
      toast.success("Customer created");
      setOpen(false);
    } catch {
      toast.error("Failed to create customer");
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm">
          <Plus className="h-3 w-3 mr-2" />
          New Customer
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>New Customer Entry</SheetTitle>
          <SheetDescription>Quickly add a new customer</SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-6 overflow-y-auto">
          {loading ? (
            <div className="text-sm text-muted-foreground py-8">Loading…</div>
          ) : (
            <QuickCustomerForm
              embedded
              drivers={drivers}
              foodCategories={categories}
              onSubmit={handleCreate}
              onCancel={() => setOpen(false)}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

