"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { LunchOrdersTable } from "@/components/orders/LunchOrdersTable";
import { apiClient, DailyOrder } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";
import { parseBagFormat } from "@/lib/bagFormatParser";

interface LunchOrderRow {
  orderId: string;
  orderItemId: string;
  customerId: string;
  customerName: string;
  driverName: string;
  categoryName: string;
  bagFormat: string;
  nonVegCount: number;
  vegCount: number;
  totalCount: number;
}

export default function LunchOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<LunchOrderRow[]>([]);
  const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [noOrders, setNoOrders] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const orders: DailyOrder[] = await apiClient.getDailyOrders({ date: currentDate });
      if (!orders || orders.length === 0) {
        setNoOrders(true);
        setData([]);
      } else {
        setNoOrders(false);
        const rows: LunchOrderRow[] = [];
        orders.forEach((o) => {
          const driverName = typeof o.driverId === 'object' ? (o.driverId as any).name : 'Unknown';
          o.orders.forEach((it: any) => {
            if (it.mealType !== 'lunch') return;
            const customerName = it.customerId && typeof it.customerId === 'object' ? (it.customerId as any).name : 'Unknown';
            const categoryName = it.categoryId && typeof it.categoryId === 'object' ? (it.categoryId as any).name : 'Unknown';
            rows.push({
              orderId: o._id,
              orderItemId: it._id,
              customerId: typeof it.customerId === 'object' ? it.customerId._id : it.customerId,
              customerName,
              driverName,
              categoryName,
              bagFormat: it.bagFormat,
              nonVegCount: it.nonVegCount,
              vegCount: it.vegCount,
              totalCount: it.totalCount,
            });
          });
        });
        rows.sort((a, b) => a.customerName.localeCompare(b.customerName));
        setData(rows);
      }
    } catch (e) {
      toast.error('Failed to load lunch orders');
    } finally {
      setLoading(false);
      setHasChanges(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [currentDate]);

  const handleOrderChange = (customerId: string, field: string, value: string) => {
    if (field !== 'bagFormat') return;
    setData((prev) =>
      prev.map((row) => {
        if (row.customerId !== customerId) return row;
        const parsed = parseBagFormat(value);
        return { ...row, bagFormat: value, nonVegCount: parsed.nonVegCount, vegCount: parsed.vegCount, totalCount: parsed.totalCount };
      })
    );
    setHasChanges(true);
  };

  const handlePreviousDay = () => {
    if (hasChanges && !confirm('Discard unsaved changes?')) return;
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 1);
    setCurrentDate(prev.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    if (hasChanges && !confirm('Discard unsaved changes?')) return;
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    setCurrentDate(next.toISOString().split('T')[0]);
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      const invalid = data.filter((r) => r.bagFormat && parseBagFormat(r.bagFormat).totalCount === 0);
      if (invalid.length > 0) {
        toast.error(`Invalid bag format for ${invalid.length} customer(s).`);
        setSaving(false);
        return;
      }
      await Promise.all(
        data.map((row) =>
          apiClient.updateOrderItem(row.orderId, row.orderItemId, { bagFormat: row.bagFormat })
        )
      );
      toast.success(`Lunch orders saved for ${new Date(currentDate).toLocaleDateString()}`);
      setHasChanges(false);
      await loadOrders();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save lunch orders');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async () => {
    try {
      const start = new Date(currentDate);
      start.setHours(8, 0, 0, 0);
      await apiClient.generateDailyOrders({ date: currentDate, neaStartTime: start.toISOString() });
      toast.success('Daily orders generated');
      await loadOrders();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to generate orders');
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Lunch Orders</h1>
            <p className="text-muted-foreground">Manage daily lunch bag formats</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePreviousDay}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-[140px] text-sm text-center">
              {new Date(currentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            </div>
            <Button variant="outline" size="sm" onClick={handleNextDay}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={handleSaveChanges} disabled={!hasChanges || saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {noOrders ? (
          <div className="rounded-md border p-4 bg-amber-50 text-amber-900 flex items-center justify-between">
            <div>No daily orders found for this date.</div>
            <Button size="sm" onClick={handleGenerate}>Generate Orders</Button>
          </div>
        ) : (
          <LunchOrdersTable
            data={data.map(r => ({
              customerId: r.customerId,
              customerName: r.customerName,
              driverName: r.driverName,
              categoryName: r.categoryName,
              bagFormat: r.bagFormat,
              nonVegCount: r.nonVegCount,
              vegCount: r.vegCount,
              totalCount: r.totalCount,
            }))}
            loading={loading}
            onOrderChange={handleOrderChange}
          />
        )}
      </div>
    </MainLayout>
  );
}
