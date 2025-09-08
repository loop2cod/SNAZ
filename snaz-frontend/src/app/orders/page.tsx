"use client";

import MainLayout from "@/components/layout/MainLayout";
import DailyOrdersManagement from "@/components/daily-orders/DailyOrdersManagement";

export default function OrdersPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Daily Orders</h1>
          <p className="text-muted-foreground">
            Generate and manage daily food orders by driver and customer
          </p>
        </div>
        
        <DailyOrdersManagement />
      </div>
    </MainLayout>
  );
}