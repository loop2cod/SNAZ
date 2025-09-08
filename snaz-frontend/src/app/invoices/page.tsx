"use client";

import MainLayout from "@/components/layout/MainLayout";
import InvoicesManagement from "@/components/invoices/InvoicesManagement";

export default function InvoicesPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            Generate and manage customer invoices
          </p>
        </div>
        
        <InvoicesManagement />
      </div>
    </MainLayout>
  );
}