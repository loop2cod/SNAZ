"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { DinnerOrdersTable } from "@/components/orders/DinnerOrdersTable";
import { apiClient, DailyOrder } from "@/lib/api";
import { ExcelExporter } from "@/lib/excel-export";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Save, RefreshCw } from "lucide-react";
import { parseBagFormat } from "@/lib/bagFormatParser";

interface DinnerOrderRow {
  orderId: string;
  orderItemId: string;
  customerId: string;
  driverId: string;
  categoryId: string;
  customerName: string;
  categoryName: string;
  driverName: string;
  bagFormat: string;
  nonVegCount: number;
  vegCount: number;
  totalCount: number;
}

export default function DinnerOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DinnerOrderRow[]>([]);
  const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [noOrders, setNoOrders] = useState(false);
  const [rawOrders, setRawOrders] = useState<DailyOrder[]>([]);
  const [filterDriverId, setFilterDriverId] = useState<string>('all');
  const [filterCategoryId, setFilterCategoryId] = useState<string>('all');

  const loadOrders = async () => {
    setLoading(true);
    try {
      const orders: DailyOrder[] = await apiClient.getDailyOrders({ date: currentDate });
      if (!orders || orders.length === 0) {
        setNoOrders(true);
        setData([]);
      } else {
        setNoOrders(false);
        const rows: DinnerOrderRow[] = [];
        orders.forEach((o) => {
          const drObj = o.driverId as any;
          const driverName = typeof o.driverId === 'object' ? drObj.name : 'Unknown';
          o.orders.forEach((it: any) => {
            if (it.mealType !== 'dinner') return;
            const customerName = it.customerId && typeof it.customerId === 'object' ? (it.customerId as any).name : 'Unknown';
            const catObj = it.categoryId as any;
            const categoryName = it.categoryId && typeof it.categoryId === 'object' ? catObj.name : 'Unknown';
            rows.push({
              orderId: o._id,
              orderItemId: it._id,
              customerId: typeof it.customerId === 'object' ? it.customerId._id : it.customerId,
              customerName,
              driverId: typeof o.driverId === 'object' ? drObj._id : (o.driverId as any),
              categoryName,
              categoryId: typeof it.categoryId === 'object' ? catObj._id : it.categoryId,
              driverName,
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
      setRawOrders(orders || []);
    } catch (e) {
      toast.error('Failed to load dinner orders');
    } finally {
      setLoading(false);
      setHasChanges(false);
    }
  };

  const handleExport = () => {
    try {
      const filtered = (rawOrders || []).map((o) => {
        const drId = typeof o.driverId === 'object' ? (o.driverId as any)._id : (o.driverId as any);
        const orders = (o.orders as any[]).filter((it) => {
          const catId = typeof it.categoryId === 'object' ? (it.categoryId as any)._id : it.categoryId;
          const okMeal = it.mealType === 'dinner';
          const okDriver = filterDriverId === 'all' || filterDriverId === drId;
          const okCat = filterCategoryId === 'all' || filterCategoryId === catId;
          return okMeal && okDriver && okCat;
        });
        return { ...o, orders };
      }).filter((o) => (o as any).orders.length > 0) as any as DailyOrder[];
      ExcelExporter.exportDailyOrders(filtered, `daily-orders-dinner-${currentDate}.xlsx`);
    } catch (e) {
      toast.error('Failed to export Excel');
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
      toast.success(`Dinner orders saved for ${new Date(currentDate).toLocaleDateString()}`);
      setHasChanges(false);
      await loadOrders();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save dinner orders');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async () => {
    if (hasChanges && !confirm('Generating orders will discard unsaved changes. Continue?')) return;
    try {
      setGenerating(true);
      const start = new Date(currentDate);
      start.setHours(8, 0, 0, 0);
      await apiClient.generateDailyOrders({ date: currentDate, neaStartTime: start.toISOString() });
      toast.success('Daily dinner orders generated');
      await loadOrders();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to generate dinner orders');
    } finally {
      setGenerating(false);
    }
  };

  const uniqueDrivers = Array.from(
    new Map(data.map((r) => [(r as any).driverId, { id: (r as any).driverId, name: r.driverName }])).values()
  );
  const uniqueCategories = Array.from(
    new Map(data.map((r) => [(r as any).categoryId, { id: (r as any).categoryId, name: r.categoryName }])).values()
  );
  const filteredData = data.filter(
    (r: any) => (filterDriverId === 'all' || r.driverId === filterDriverId) && (filterCategoryId === 'all' || r.categoryId === filterCategoryId)
  );

  return (
    <ProtectedRoute requiredRoles={['admin', 'manager', 'staff']}>
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dinner Orders</h1>
            <p className="text-muted-foreground">Manage daily dinner bag formats</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <Button variant="outline" size="sm" onClick={handlePreviousDay}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-[140px] text-sm text-center">
              {new Date(currentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            </div>
            <Button variant="outline" size="sm" onClick={handleNextDay}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Select value={filterDriverId} onValueChange={setFilterDriverId}>
              <SelectTrigger className="h-8 w-[160px] text-xs">
                <SelectValue placeholder="All Drivers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Drivers</SelectItem>
                {uniqueDrivers.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterCategoryId} onValueChange={setFilterCategoryId}>
              <SelectTrigger className="h-8 w-[180px] text-xs">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          <DinnerOrdersTable
            data={filteredData.map((r: any) => ({
              customerId: r.customerId,
              customerName: r.customerName,
              categoryName: r.categoryName,
              driverName: r.driverName,
              bagFormat: r.bagFormat,
              nonVegCount: r.nonVegCount,
              vegCount: r.vegCount,
              totalCount: r.totalCount,
            }))}
            loading={loading}
            onOrderChange={handleOrderChange}
            onExport={handleExport}
          />
        )}
      </div>
    </MainLayout>
    </ProtectedRoute>
  );
}
