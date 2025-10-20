"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Users, Truck, Package, DollarSign, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface DashboardData {
  todaysStats: {
    totalOrders: number;
    totalFood: number;
    totalAmount: number;
    vegFood: number;
    nonVegFood: number;
    activeCustomers: number;
    activeDrivers: number;
    totalCategories: number;
  };
  comparisons: {
    ordersChange: number;
    foodChange: number;
    amountChange: number;
  };
  recentActivity: Array<{
    id: string;
    driverName: string;
    totalFood: number;
    totalAmount: number;
    status: string;
    createdAt: string;
  }>;
  driverStatus: Array<{
    id: string;
    name: string;
    status: string;
    route: string;
  }>;
  performance: {
    completionRate: number;
    onTimeDelivery: number;
    customerSatisfaction: number;
  };
}

export default function Dashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Redirect staff users to their first available page
  useEffect(() => {
    if (!loading && user?.role === 'staff') {
      router.push('/orders/lunch');
    }
  }, [user, loading, router]);

  const loadDashboardData = async () => {
    try {
      setDashboardLoading(true);
      const data = await apiClient.getDashboardData() as DashboardData;
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setDashboardLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const data = await apiClient.getDashboardData() as DashboardData;
      setDashboardData(data);
      toast.success('Dashboard data refreshed');
    } catch (error) {
      console.error('Error refreshing dashboard data:', error);
      toast.error('Failed to refresh dashboard data');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!loading && user?.role !== 'staff') {
      loadDashboardData();
    }
  }, [loading, user]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (dashboardLoading) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager']}>
        <MainLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

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
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <div className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.todaysStats.activeCustomers || 0}</div>
              <p className="text-xs text-muted-foreground">
                <Badge variant="secondary" className="mr-1">{dashboardData?.todaysStats.activeDrivers || 0}</Badge>
                active drivers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Food Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.todaysStats.totalFood || 0}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{dashboardData?.todaysStats.vegFood || 0} Veg</span> | <span className="text-red-600">{dashboardData?.todaysStats.nonVegFood || 0} Non-Veg</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(dashboardData?.todaysStats.totalAmount || 0)}</div>
              <p className="text-xs text-muted-foreground">
                <Badge 
                  variant={(dashboardData?.comparisons.amountChange ?? 0) >= 0 ? "default" : "destructive"} 
                  className="mr-1"
                >
                  {(dashboardData?.comparisons.amountChange ?? 0) >= 0 ? '+' : ''}{formatCurrency(dashboardData?.comparisons.amountChange || 0)}
                </Badge>
                from yesterday
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarDays className="w-5 h-5 mr-2" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dashboardData?.recentActivity?.slice(0, 5).map((activity, index) => (
                <div key={activity.id} className="flex items-center justify-between text-sm">
                  <div className="flex flex-col">
                    <span>Order by {activity.driverName}</span>
                    <span className="text-xs text-muted-foreground">
                      {activity.totalFood} items • {formatCurrency(activity.totalAmount)}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <Badge className={getStatusBadgeColor(activity.status)}>
                      {activity.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground mt-1">
                      {format(new Date(activity.createdAt), 'HH:mm')}
                    </span>
                  </div>
                </div>
              )) || (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No recent activity
                </div>
              )}
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
              {dashboardData?.driverStatus?.slice(0, 5).map((driver) => (
                <div key={driver.id} className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{driver.name}</span>
                    <span className="text-xs text-muted-foreground">{driver.route}</span>
                  </div>
                  <Badge 
                    variant={driver.status === 'Available' ? 'secondary' : 'default'}
                    className={driver.status === 'Delivering' ? 'bg-green-500' : ''}
                  >
                    {driver.status}
                  </Badge>
                </div>
              )) || (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No drivers available
                </div>
              )}
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
                <div className="text-2xl font-bold text-green-600">
                  {dashboardData?.todaysStats.vegFood || 0}
                </div>
                <div className="text-sm text-muted-foreground">Veg Meals</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {dashboardData?.todaysStats.nonVegFood || 0}
                </div>
                <div className="text-sm text-muted-foreground">Non-Veg Meals</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {dashboardData?.todaysStats.activeDrivers || 0}
                </div>
                <div className="text-sm text-muted-foreground">Active Drivers</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {dashboardData?.todaysStats.totalOrders && dashboardData.todaysStats.totalOrders > 0 
                    ? formatCurrency((dashboardData.todaysStats.totalAmount || 0) / dashboardData.todaysStats.totalOrders)
                    : formatCurrency(0)
                  }
                </div>
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