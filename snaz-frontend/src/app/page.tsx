"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Users, Truck, Package, DollarSign, FileText } from "lucide-react";
import DriversManagement from "@/components/drivers/DriversManagement";
import CustomersManagement from "@/components/customers/CustomersManagement";
import FoodCategoriesManagement from "@/components/food-categories/FoodCategoriesManagement";
import DailyOrdersManagement from "@/components/daily-orders/DailyOrdersManagement";
import AnalyticsDashboard from "@/components/analytics/AnalyticsDashboard";
import InvoicesManagement from "@/components/invoices/InvoicesManagement";

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">SNAZ Catering Management System</h1>
          <p className="text-sm text-gray-600">Complete order management and delivery tracking</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="drivers" className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Drivers
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Customers
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Daily Orders
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Invoices
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">
                    <Badge variant="secondary" className="mr-1">+2</Badge>
                    from yesterday
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">48</div>
                  <p className="text-xs text-muted-foreground">
                    <Badge variant="secondary" className="mr-1">+5</Badge>
                    this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Food Items</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,847</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">852 Veg</span> | <span className="text-red-600">995 Non-Veg</span>
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Daily Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹92,847</div>
                  <p className="text-xs text-muted-foreground">
                    <Badge variant="default" className="mr-1">+8.2%</Badge>
                    from last week
                  </p>
                </CardContent>
              </Card>
            </div>

            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="drivers">
            <DriversManagement />
          </TabsContent>

          <TabsContent value="customers">
            <CustomersManagement />
          </TabsContent>

          <TabsContent value="categories">
            <FoodCategoriesManagement />
          </TabsContent>

          <TabsContent value="orders">
            <DailyOrdersManagement />
          </TabsContent>

          <TabsContent value="invoices">
            <InvoicesManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}