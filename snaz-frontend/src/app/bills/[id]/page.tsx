"use client";
import { useEffect, useState } from 'react';

export const runtime = 'edge';
import { useParams } from 'next/navigation';
import { apiClient, DailyOrder } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { TallyStyleBill } from '@/components/bills/TallyStyleBill';
import { parseBagFormat } from '@/lib/bagFormatParser';

type Bill = {
  _id: string;
  number: string;
  entityType: 'customer' | 'company';
  entityId: string;
  entityName?: string;
  entityAddress?: string;
  entityPhone?: string;
  periodYear: number;
  periodMonth: number;
  startDate: string;
  endDate: string;
  items: { categoryName: string; unitPrice: number; quantity: number; amount: number }[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: 'unpaid' | 'partial' | 'paid' | 'cancelled';
  generatedAt: string;
  dueDate?: string;
  dailyOrders?: DailyOrderData;
  customerPackages?: Array<{ categoryId: string; categoryName: string; unitPrice: number }>;
};

type DailyOrderData = {
  [day: string]: {
    date: Date;
    lunch?: {
      bagFormat: string;
      nonVegCount: number;
      vegCount: number;
      totalCount: number;
      amount: number;
    };
    dinner?: {
      bagFormat: string;
      nonVegCount: number;
      vegCount: number;
      totalCount: number;
      amount: number;
    };
    dayTotal: number;
  };
};

export default function BillDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data: any = await apiClient.getBill(id);
      
      // Fetch entity details to enrich the bill
      let customer = null;
      if (data && !data.entityName) {
        try {
          if (data.entityType === 'customer') {
            customer = await apiClient.getCustomer(data.entityId);
            data.entityName = customer.name;
            data.entityAddress = customer.address;
            data.entityPhone = customer.phone;
            
            // Extract package pricing information
            data.customerPackages = customer.packages.map((pkg: any) => ({
              categoryId: typeof pkg.categoryId === 'string' ? pkg.categoryId : pkg.categoryId._id,
              categoryName: typeof pkg.categoryId === 'string' ? 'Unknown' : pkg.categoryId.name,
              unitPrice: pkg.unitPrice
            }));
          } else if (data.entityType === 'company') {
            const company = await apiClient.getCompany(data.entityId);
            data.entityName = company.name;
            data.entityAddress = company.address;
            data.entityPhone = company.phone;
          }
        } catch (e) {
          console.error('Failed to fetch entity details:', e);
        }
      }

      // Fetch detailed daily orders for the bill period
      if (data && data.entityType === 'customer') {
        try {
          const startDate = data.startDate;
          const endDate = data.endDate;
          
          const dailyOrders = await apiClient.getDailyOrders({
            startDate,
            endDate
          });

          // Process orders to create daily breakdown similar to customer monthly view
          const dailyOrdersData: DailyOrderData = {};
          
          console.log('Processing daily orders for bill:', {
            billPeriod: `${data.startDate} to ${data.endDate}`,
            totalDailyOrders: dailyOrders.length,
            customerId: data.entityId,
            billStartDate: new Date(data.startDate),
            billEndDate: new Date(data.endDate)
          });

          dailyOrders.forEach((dayOrder: DailyOrder) => {
            const orderDate = new Date(dayOrder.date);
            const billStartDate = new Date(data.startDate);
            const billEndDate = new Date(data.endDate);
            
            // Normalize dates to compare only year, month, day (ignore time)
            const orderDateOnly = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());
            const startDateOnly = new Date(billStartDate.getFullYear(), billStartDate.getMonth(), billStartDate.getDate());
            const endDateOnly = new Date(billEndDate.getFullYear(), billEndDate.getMonth(), billEndDate.getDate());
            
            console.log(`Checking order date: ${dayOrder.date} -> ${orderDateOnly.toISOString().split('T')[0]} vs ${startDateOnly.toISOString().split('T')[0]} to ${endDateOnly.toISOString().split('T')[0]}`);
            
            if (orderDateOnly < startDateOnly || orderDateOnly > endDateOnly) {
              console.log(`Skipping order outside bill period: ${dayOrder.date} (${orderDateOnly.toISOString().split('T')[0]} not between ${startDateOnly.toISOString().split('T')[0]} and ${endDateOnly.toISOString().split('T')[0]})`);
              return; // Skip orders outside the bill period
            }
            
            const day = orderDate.getDate().toString();
            
            const customerOrders = dayOrder.orders.filter(order => {
              const orderCustomerId = typeof order.customerId === 'string' 
                ? order.customerId 
                : (order.customerId as any)?._id || order.customerId;
              return orderCustomerId === data.entityId;
            });
            
            console.log(`Day ${day} (${dayOrder.date}):`, {
              totalOrdersForDay: dayOrder.orders.length,
              customerOrdersForDay: customerOrders.length,
              customerOrders: customerOrders.map(o => ({ mealType: o.mealType, bagFormat: o.bagFormat }))
            });
            
            if (customerOrders.length > 0) {
              if (!dailyOrdersData[day]) {
                dailyOrdersData[day] = { date: orderDate, dayTotal: 0 };
              }
              
              customerOrders.forEach(order => {
                const parsed = parseBagFormat(order.bagFormat);
                const totalCount = parsed.nonVegCount + parsed.vegCount;
                
                // Calculate amount based on customer packages (use first package for simplicity)
                let unitPrice = 0;
                if (data.customerPackages && data.customerPackages.length > 0) {
                  unitPrice = data.customerPackages[0].unitPrice;
                }
                const amount = totalCount * unitPrice;
                
                const orderData = {
                  bagFormat: order.bagFormat,
                  nonVegCount: parsed.nonVegCount,
                  vegCount: parsed.vegCount,
                  totalCount,
                  amount
                };
                
                if (order.mealType === 'lunch') {
                  dailyOrdersData[day].lunch = orderData;
                } else if (order.mealType === 'dinner') {
                  dailyOrdersData[day].dinner = orderData;
                }
              });
              
              // Calculate day total after all orders are processed
              const lunchAmount = dailyOrdersData[day].lunch?.amount || 0;
              const dinnerAmount = dailyOrdersData[day].dinner?.amount || 0;
              dailyOrdersData[day].dayTotal = lunchAmount + dinnerAmount;
            }
          });
          
          console.log('Final daily orders data:', dailyOrdersData);
          data.dailyOrders = dailyOrdersData;
        } catch (e) {
          console.error('Failed to fetch daily orders:', e);
        }
      }
      
      setBill(data);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load bill');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (id) load(); }, [id]);



  if (loading) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-lg">Loading bill details...</div>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  if (!bill) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-lg text-red-600">Bill not found</div>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <TallyStyleBill bill={bill} />
      </MainLayout>
    </ProtectedRoute>
  );
}
