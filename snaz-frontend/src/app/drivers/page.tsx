"use client";

import MainLayout from "@/components/layout/MainLayout";
import DriversManagement from "@/components/drivers/DriversManagement";

export default function DriversPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Drivers</h1>
          <p className="text-muted-foreground">
            Manage delivery drivers and their routes
          </p>
        </div>
        
        <DriversManagement />
      </div>
    </MainLayout>
  );
}