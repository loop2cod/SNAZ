"use client";

import MainLayout from "@/components/layout/MainLayout";
import FoodCategoriesManagement from "@/components/food-categories/FoodCategoriesManagement";

export default function CategoriesPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Food Categories</h1>
          <p className="text-muted-foreground">
            Manage food categories and their pricing tiers
          </p>
        </div>
        
        <FoodCategoriesManagement />
      </div>
    </MainLayout>
  );
}