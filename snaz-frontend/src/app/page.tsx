"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Users, Truck, Package, DollarSign, FileText, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Redirect staff users to their first available page
  useEffect(() => {
    if (!loading && user?.role === 'staff') {
      router.push('/orders/lunch');
    }
  }, [user, loading, router]);

  return (
    <ProtectedRoute requiredRoles={['admin', 'manager']}>
      <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome to your catering management system
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today&apos;s Orders</CardTitle>
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
              <div className="text-2xl font-bold">$92,847</div>
              <p className="text-xs text-muted-foreground">
                <Badge variant="default" className="mr-1">+8.2%</Badge>
                from last week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarDays className="w-5 h-5 mr-2" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>New order from ABC Corp</span>
                <span className="text-muted-foreground">2 min ago</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Driver John completed delivery</span>
                <span className="text-muted-foreground">15 min ago</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Invoice #INV-001 generated</span>
                <span className="text-muted-foreground">1 hour ago</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="w-5 h-5 mr-2" />
                Driver Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">John Driver</span>
                <Badge variant="default" className="bg-green-500">Delivering</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Mike Delivery</span>
                <Badge variant="secondary">Available</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Sarah Transport</span>
                <Badge variant="default" className="bg-green-500">Delivering</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Orders Completed</span>
                <span className="font-semibold text-green-600">98.5%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>On-Time Delivery</span>
                <span className="font-semibold text-blue-600">94.2%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Customer Satisfaction</span>
                <span className="font-semibold text-yellow-600">4.8/5</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">152</div>
                <div className="text-sm text-muted-foreground">Veg Meals</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">198</div>
                <div className="text-sm text-muted-foreground">Non-Veg Meals</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">8</div>
                <div className="text-sm text-muted-foreground">Active Routes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">$15,240</div>
                <div className="text-sm text-muted-foreground">Avg Order Value</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </MainLayout>
    </ProtectedRoute>
  );
}