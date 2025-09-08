"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun } from "lucide-react";

interface LunchOrderData {
  customerId: string;
  customerName: string;
  driverName: string;
  categoryName: string;
  bagFormat: string;
  nonVegCount: number;
  vegCount: number;
  totalCount: number;
  isEditable?: boolean;
}

interface LunchOrdersTableProps {
  data: LunchOrderData[];
  loading: boolean;
  onOrderChange: (customerId: string, field: string, value: string) => void;
}

export function LunchOrdersTable({
  data,
  loading,
  onOrderChange
}: LunchOrdersTableProps) {

  const handleBagFormatChange = (customerId: string, value: string) => {
    onOrderChange(customerId, 'bagFormat', value);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div>Loading lunch orders...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sun className="h-5 w-5 text-orange-500" />
              Daily Lunch Orders
            </CardTitle>
            <CardDescription>
              Excel-style interface for managing customer lunch orders
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden border rounded-lg">
          {/* Table Header */}
          <div className="grid grid-cols-8 gap-0 bg-slate-100 border-b font-medium text-sm">
            <div className="p-3 border-r">#</div>
            <div className="p-3 border-r">Customer Name</div>
            <div className="p-3 border-r">Driver Name</div>
            <div className="p-3 border-r">Category</div>
            <div className="p-3 border-r">Bag Format</div>
            <div className="p-3 border-r">Non-Veg Food</div>
            <div className="p-3 border-r">Veg Food</div>
            <div className="p-3">Total Food</div>
          </div>

          {/* Table Body */}
          <div className="bg-white">
            {data.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No customers found for lunch orders
              </div>
            ) : (
              data.map((row, index) => {
                return (
                  <div
                    key={row.customerId}
                    className="grid grid-cols-8 gap-0 border-b hover:bg-slate-50"
                  >
                    {/* Row Number */}
                    <div className="p-3 border-r text-sm text-muted-foreground font-mono">
                      {index + 1}
                    </div>

                    {/* Customer Name */}
                    <div className="p-3 border-r">
                      <div className="font-medium text-sm">{row.customerName}</div>
                    </div>

                    {/* Driver Name */}
                    <div className="p-3 border-r">
                      <div className="text-sm text-muted-foreground">{row.driverName}</div>
                    </div>

                    {/* Category Name */}
                    <div className="p-3 border-r">
                      <div className="text-sm text-slate-600 bg-slate-50 px-2 py-1 rounded">
                        {row.categoryName}
                      </div>
                    </div>

                    {/* Bag Format - Editable */}
                    <div className="p-3 border-r">
                      <Input
                        value={row.bagFormat}
                        onChange={(e) => handleBagFormatChange(row.customerId, e.target.value)}
                        className="h-8 text-sm font-mono border-slate-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-200"
                        placeholder="e.g., 5,5+7"
                      />
                    </div>

                    {/* Non-Veg Count - Read Only */}
                    <div className="p-3 border-r">
                      <div className="text-sm text-center font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">
                        {row.nonVegCount}
                      </div>
                    </div>

                    {/* Veg Count - Read Only */}
                    <div className="p-3 border-r">
                      <div className="text-sm text-center font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                        {row.vegCount}
                      </div>
                    </div>

                    {/* Total Count - Read Only */}
                    <div className="p-3">
                      <div className="text-sm text-center font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {row.totalCount}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Summary Row */}
        {data.length > 0 && (
          <div className="mt-4 bg-slate-50 rounded-lg p-4 border">
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-slate-600">Total Customers</div>
                <div className="text-lg font-bold text-slate-800">{data.length}</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-red-600">Total Non-Veg</div>
                <div className="text-lg font-bold text-red-700">
                  {data.reduce((sum, row) => sum + row.nonVegCount, 0)}
                </div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-green-600">Total Veg</div>
                <div className="text-lg font-bold text-green-700">
                  {data.reduce((sum, row) => sum + row.vegCount, 0)}
                </div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-orange-600">Grand Total</div>
                <div className="text-lg font-bold text-orange-700">
                  {data.reduce((sum, row) => sum + row.totalCount, 0)}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}