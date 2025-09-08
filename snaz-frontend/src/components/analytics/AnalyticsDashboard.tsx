"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, TrendingUp, DollarSign, Package, Users, Calendar, Download } from "lucide-react";
import { apiClient } from "@/lib/api";
import { ExcelExporter } from "@/lib/excel-export";
import { toast } from "sonner";

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [analytics, setAnalytics] = useState<any>(null);
  const [dailyAnalytics, setDailyAnalytics] = useState<any>(null);

  useEffect(() => {
    loadAnalytics();
    loadTodayAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getRangeAnalytics(dateRange.startDate, dateRange.endDate);
      setAnalytics(data);
    } catch (error) {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const loadTodayAnalytics = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const data = await apiClient.getDailyAnalytics(today);
      setDailyAnalytics(data);
    } catch (error) {
      // Today might not have data, that's ok
    }
  };

  const handleExportData = async () => {
    try {
      if (!analytics) {
        toast.error("No data to export");
        return;
      }
      
      ExcelExporter.exportAnalytics(
        analytics.summary,
        analytics.driverSummary || [],
        dateRange,
        `analytics-${dateRange.startDate}-to-${dateRange.endDate}.xlsx`
      );
      
      toast.success("Analytics data exported successfully");
    } catch (error) {
      toast.error("Failed to export data");
    }
  };

  if (!analytics && loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="text-center py-8">
            Loading analytics...
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Range Controls */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="w-5 h-5" />
                Analytics Dashboard
              </CardTitle>
              <CardDescription>Performance insights and key metrics</CardDescription>
            </div>
            <Button onClick={handleExportData} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="startDate">From:</Label>
              <Input
                id="startDate"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="w-auto"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="endDate">To:</Label>
              <Input
                id="endDate"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="w-auto"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Overview */}
      {dailyAnalytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Food Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dailyAnalytics.totalFood}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{dailyAnalytics.totalVegFood} Veg</span> | 
                <span className="text-red-600 ml-1">{dailyAnalytics.totalNonVegFood} Non-Veg</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{dailyAnalytics.totalAmount?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">From {dailyAnalytics.driverBreakdown?.length || 0} drivers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dailyAnalytics.driverBreakdown?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Delivering today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg per Driver</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{dailyAnalytics.driverBreakdown?.length > 0 
                  ? Math.round(dailyAnalytics.totalAmount / dailyAnalytics.driverBreakdown.length).toLocaleString()
                  : 0}
              </div>
              <p className="text-xs text-muted-foreground">Revenue per driver</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Period Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.summary.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                Over {Math.ceil((new Date(dateRange.endDate).getTime() - new Date(dateRange.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Food Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.summary.totalFood}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{analytics.summary.totalVegFood} Veg</span> | 
                <span className="text-red-600 ml-1">{analytics.summary.totalNonVegFood} Non-Veg</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{analytics.summary.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Avg: ₹{Math.round(analytics.summary.averageOrderValue).toLocaleString()} per order
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{Math.round(analytics.summary.totalRevenue / Math.max(1, analytics.summary.totalOrders)).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Per day in period</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Driver Performance */}
      {analytics && analytics.driverSummary && analytics.driverSummary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Driver Performance</CardTitle>
            <CardDescription>Performance breakdown by driver for the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Driver</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Total Orders</TableHead>
                  <TableHead>Food Items</TableHead>
                  <TableHead>Veg/Non-Veg</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Avg Order</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.driverSummary.map((driver: any, index: number) => (
                  <TableRow key={driver._id}>
                    <TableCell className="font-medium">{driver.driverName}</TableCell>
                    <TableCell>{driver.route}</TableCell>
                    <TableCell>{driver.totalOrders}</TableCell>
                    <TableCell className="font-medium">{driver.totalFood}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="text-green-600">{driver.totalVegFood}</span> / 
                        <span className="text-red-600 ml-1">{driver.totalNonVegFood}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">₹{driver.totalRevenue.toLocaleString()}</TableCell>
                    <TableCell>₹{Math.round(driver.totalRevenue / driver.totalOrders).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Today's Driver Breakdown */}
      {dailyAnalytics && dailyAnalytics.driverBreakdown && dailyAnalytics.driverBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Today's Driver Breakdown</CardTitle>
            <CardDescription>Current day performance by driver</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Driver</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Food Items</TableHead>
                  <TableHead>Veg/Non-Veg</TableHead>
                  <TableHead>Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dailyAnalytics.driverBreakdown.map((driver: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{driver.driverName}</TableCell>
                    <TableCell>{driver.route}</TableCell>
                    <TableCell className="font-medium">{driver.totalCount}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="text-green-600">{driver.vegCount}</span> / 
                        <span className="text-red-600 ml-1">{driver.nonVegCount}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">₹{driver.totalAmount.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {!analytics && !loading && (
        <Card>
          <CardContent className="text-center py-8 text-gray-500">
            No analytics data available for the selected period.
          </CardContent>
        </Card>
      )}
    </div>
  );
}