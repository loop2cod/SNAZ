"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, User, Package, Truck, Calendar } from "lucide-react";
import { apiClient, Customer, DailyOrder } from "@/lib/api";
import { toast } from "sonner";
import { parseBagFormat } from "@/lib/bagFormatParser";

interface MonthlyOrderData {
  [day: string]: {
    date: Date;
    lunch?: {
      bagFormat: string;
      nonVegCount: number;
      vegCount: number;
      totalCount: number;
    };
    dinner?: {
      bagFormat: string;
      nonVegCount: number;
      vegCount: number;
      totalCount: number;
    };
  };
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [monthlyOrders, setMonthlyOrders] = useState<MonthlyOrderData>({});
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(() => {
    // Initialize to current month
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (customerId) {
      loadCustomer();
      loadMonthlyOrders();
    }
  }, [customerId, currentMonth]);

  const loadCustomer = async () => {
    try {
      const data = await apiClient.getCustomer(customerId);
      setCustomer(data);
    } catch (error) {
      toast.error("Failed to load customer details");
      router.push("/customers");
    } finally {
      setLoading(false);
    }
  };

  const loadMonthlyOrders = async () => {
    setOrdersLoading(true);
    try {
      // Fix: Use local date construction to avoid timezone issues
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);
      
      // Format dates properly for API call
      const startDateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-01`;
      const endDateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${endDate.getDate().toString().padStart(2, '0')}`;
      
      console.log('=== MONTH DEBUG ===');
      console.log('currentMonth object:', currentMonth);
      console.log('currentMonth.getMonth():', currentMonth.getMonth(), '(0-based)');
      console.log('currentMonth.getFullYear():', currentMonth.getFullYear());
      console.log('Display month should be:', currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
      console.log('Loading orders for:', {
        customerId,
        year,
        monthIndex: month, // 0-based
        displayMonth: month + 1, // 1-based for display
        startDate: startDateStr,
        endDate: endDateStr
      });
      
      const dailyOrders = await apiClient.getDailyOrders({
        startDate: startDateStr,
        endDate: endDateStr
      });
      
      console.log('Received daily orders:', dailyOrders.length);
      
      // Process orders to create monthly view
      const monthlyData: MonthlyOrderData = {};
      
      dailyOrders.forEach((dayOrder: DailyOrder) => {
        const date = new Date(dayOrder.date);
        const orderMonth = date.getMonth();
        const orderYear = date.getFullYear();
        const day = date.getDate().toString();
        
        console.log('Processing day order:', {
          date: dayOrder.date,
          orderMonth: orderMonth + 1, // 1-based
          currentMonth: month + 1, // 1-based  
          orderYear,
          currentYear: year,
          shouldInclude: orderMonth === month && orderYear === year,
          totalOrders: dayOrder.orders.length,
          orders: dayOrder.orders.map(o => ({ customerId: o.customerId, mealType: o.mealType }))
        });
        
        // Only process orders from the current month/year we're viewing
        if (orderMonth !== month || orderYear !== year) {
          console.log('Skipping order from different month/year');
          return;
        }
        
        const customerOrders = dayOrder.orders.filter(order => {
          // Handle both string IDs and populated objects
          const orderCustomerId = typeof order.customerId === 'string' 
            ? order.customerId 
            : order.customerId?._id || order.customerId;
          const matches = orderCustomerId === customerId;
          console.log('Order match check:', { 
            orderCustomerId, 
            targetCustomerId: customerId, 
            matches 
          });
          return matches;
        });
        
        console.log('Customer orders found:', customerOrders.length);
        
        // Only create entry if customer has orders for this day
        if (customerOrders.length > 0) {
          if (!monthlyData[day]) {
            monthlyData[day] = { date };
          }
          
          customerOrders.forEach(order => {
            const parsed = parseBagFormat(order.bagFormat);
            const orderData = {
              bagFormat: order.bagFormat,
              nonVegCount: parsed.nonVegCount,
              vegCount: parsed.vegCount,
              totalCount: parsed.nonVegCount + parsed.vegCount
            };
            
            if (order.mealType === 'lunch') {
              monthlyData[day].lunch = orderData;
            } else if (order.mealType === 'dinner') {
              monthlyData[day].dinner = orderData;
            }
          });
        }
      });
      
      console.log('Final monthly data:', monthlyData);
      setMonthlyOrders(monthlyData);
    } catch (error) {
      console.error('Error loading monthly orders:', error);
      toast.error("Failed to load monthly orders");
    } finally {
      setOrdersLoading(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    console.log('Navigating to month:', {
      direction,
      from: currentMonth.toLocaleDateString(),
      to: newMonth.toLocaleDateString()
    });
    setCurrentMonth(newMonth);
  };

  const getOrderedDays = () => {
    // Only return days that have actual orders, sorted by day number
    return Object.keys(monthlyOrders)
      .sort((a, b) => parseInt(a) - parseInt(b));
  };

  const calculateMonthTotals = () => {
    let totalLunchCount = 0;
    let totalDinnerCount = 0;
    let totalGrandCount = 0;

    Object.values(monthlyOrders).forEach(dayData => {
      const lunchTotal = dayData.lunch?.totalCount || 0;
      const dinnerTotal = dayData.dinner?.totalCount || 0;
      totalLunchCount += lunchTotal;
      totalDinnerCount += dinnerTotal;
      totalGrandCount += lunchTotal + dinnerTotal;
    });

    // Calculate amount based on customer packages
    let totalAmount = 0;
    if (customer && customer.packages.length > 0) {
      // Assuming first package for simplicity, you might need to adjust this logic
      const unitPrice = customer.packages[0].unitPrice;
      totalAmount = totalGrandCount * unitPrice;
    }

    return {
      totalLunchCount,
      totalDinnerCount,
      totalGrandCount,
      totalAmount,
      daysWithOrders: Object.keys(monthlyOrders).length
    };
  };

  const formatDayLabel = (day: string) => {
    const dayData = monthlyOrders[day];
    if (!dayData) return day;
    
    return dayData.date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getCurrentMonthDisplay = () => {
    return currentMonth.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const formatMonthYear = () => {
    return currentMonth.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const getDriverName = () => {
    if (!customer) return "N/A";
    return typeof customer.driverId === 'object' ? customer.driverId.name : "Unknown Driver";
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          Loading customer details...
        </div>
      </MainLayout>
    );
  }

  if (!customer) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          Customer not found
        </div>
      </MainLayout>
    );
  }

  const days = getOrderedDays();

  return (
    <MainLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push("/customers")}
              className="shrink-0"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Back</span>
            </Button> */}
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2 truncate">
                <User className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
                <span className="truncate">{customer.name}</span>
              </h1>
              <p className="text-sm text-muted-foreground truncate">{customer.address}</p>
            </div>
          </div>
          <Badge variant={customer.isActive ? "default" : "secondary"} className="shrink-0 w-fit">
            {customer.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>

        {/* Customer Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Card className="p-4 col-span-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Driver</span>
              </div>
            </div>
            <div className="text-lg font-bold mt-1 truncate">{getDriverName()}</div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Start Date</span>
              </div>
            </div>
            <div className="text-lg font-bold mt-1">
              {new Date(customer.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          </Card>
        </div>

        {/* Monthly Orders Table */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg">Monthly Orders</CardTitle>
                <CardDescription className="text-sm">
                  Orders for {formatMonthYear()}
                </CardDescription>
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium px-3 min-w-[100px] text-center">
                  {formatMonthYear()}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigateMonth('next')}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="text-center py-8">Loading orders...</div>
            ) : days.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No orders found for {formatMonthYear()}
              </div>
            ) : (
              <div className="overflow-x-auto -mx-6">
                <div className="inline-block min-w-full px-6">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b">
                        <TableHead className="text-xs font-medium px-2 py-3 w-20">Date</TableHead>
                        <TableHead className="text-xs font-medium px-2 py-3 min-w-24">Bag (L)</TableHead>
                        <TableHead className="text-xs font-medium px-2 py-3 text-center w-12">NV</TableHead>
                        <TableHead className="text-xs font-medium px-2 py-3 text-center w-12">V</TableHead>
                        <TableHead className="text-xs font-medium px-2 py-3 text-center w-12">L</TableHead>
                        <TableHead className="text-xs font-medium px-2 py-3 min-w-24">Bag (D)</TableHead>
                        <TableHead className="text-xs font-medium px-2 py-3 text-center w-12">NV</TableHead>
                        <TableHead className="text-xs font-medium px-2 py-3 text-center w-12">V</TableHead>
                        <TableHead className="text-xs font-medium px-2 py-3 text-center w-12">D</TableHead>
                        <TableHead className="text-xs font-medium px-2 py-3 text-center w-16 bg-muted">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                  <TableBody>
                    {days.map((day) => {
                      const dayData = monthlyOrders[day];
                      const lunch = dayData?.lunch;
                      const dinner = dayData?.dinner;
                      const dayTotal = (lunch?.totalCount || 0) + (dinner?.totalCount || 0);
                      
                      return (
                        <TableRow key={day} className="hover:bg-muted/50">
                          <TableCell className="font-medium text-xs px-2 py-3">
                            {formatDayLabel(day)}
                          </TableCell>
                          
                          {/* Lunch columns */}
                          <TableCell className="font-mono text-xs px-2 py-3">
                            {lunch?.bagFormat || "-"}
                          </TableCell>
                          <TableCell className="text-center text-red-600 text-xs px-2 py-3 font-medium">
                            {lunch?.nonVegCount || 0}
                          </TableCell>
                          <TableCell className="text-center text-green-600 text-xs px-2 py-3 font-medium">
                            {lunch?.vegCount || 0}
                          </TableCell>
                          <TableCell className="text-center font-bold text-xs px-2 py-3">
                            {lunch?.totalCount || 0}
                          </TableCell>
                          
                          {/* Dinner columns */}
                          <TableCell className="font-mono text-xs px-2 py-3">
                            {dinner?.bagFormat || "-"}
                          </TableCell>
                          <TableCell className="text-center text-red-600 text-xs px-2 py-3 font-medium">
                            {dinner?.nonVegCount || 0}
                          </TableCell>
                          <TableCell className="text-center text-green-600 text-xs px-2 py-3 font-medium">
                            {dinner?.vegCount || 0}
                          </TableCell>
                          <TableCell className="text-center font-bold text-xs px-2 py-3">
                            {dinner?.totalCount || 0}
                          </TableCell>
                          
                          {/* Day total */}
                          <TableCell className="text-center font-bold text-sm px-2 py-3 bg-muted/50">
                            {dayTotal || 0}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Monthly Summary - Spreadsheet Style */}
            {days.length > 0 && (() => {
              const totals = calculateMonthTotals();
              return (
                <div className="mt-6 pt-4 border-t">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-100">
                          <TableHead className="text-xs font-bold text-center px-3 py-2">Metric</TableHead>
                          <TableHead className="text-xs font-bold text-center px-3 py-2 w-20">Days</TableHead>
                          <TableHead className="text-xs font-bold text-center px-3 py-2 w-20">Lunch</TableHead>
                          <TableHead className="text-xs font-bold text-center px-3 py-2 w-20">Dinner</TableHead>
                          <TableHead className="text-xs font-bold text-center px-3 py-2 w-24 bg-slate-200">Total Items</TableHead>
                          <TableHead className="text-xs font-bold text-center px-3 py-2 w-28 bg-slate-200">Unit Price</TableHead>
                          <TableHead className="text-xs font-bold text-center px-3 py-2 w-32 bg-slate-300">Total Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow className="border-b">
                          <TableCell className="font-medium text-xs px-3 py-3">{formatMonthYear()}</TableCell>
                          <TableCell className="text-center font-bold text-sm px-3 py-3 text-blue-600">
                            {totals.daysWithOrders}
                          </TableCell>
                          <TableCell className="text-center font-bold text-sm px-3 py-3 text-orange-600">
                            {totals.totalLunchCount}
                          </TableCell>
                          <TableCell className="text-center font-bold text-sm px-3 py-3 text-purple-600">
                            {totals.totalDinnerCount}
                          </TableCell>
                          <TableCell className="text-center font-bold text-sm px-3 py-3 bg-slate-50">
                            {totals.totalGrandCount}
                          </TableCell>
                          <TableCell className="text-center font-bold text-sm px-3 py-3 bg-slate-50">
                            ${customer?.packages[0]?.unitPrice || 0}
                          </TableCell>
                          <TableCell className="text-center font-bold text-lg px-3 py-3 bg-slate-100 text-green-700">
                            ${totals.totalAmount.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}