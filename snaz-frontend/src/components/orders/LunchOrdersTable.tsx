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
  onExport?: () => void;
}

export function LunchOrdersTable({
  data,
  loading,
  onOrderChange,
  onExport,
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
            <CardTitle className="text-base flex items-center gap-2">
              <Sun className="h-4 w-4 text-orange-500" />
              Daily Lunch Orders
            </CardTitle>
            <CardDescription className="text-xs">
              Excel-style interface for managing customer lunch orders
            </CardDescription>
          </div>
          {onExport && (
            <button
              type="button"
              className="text-sm px-3 py-1.5 border rounded-md hover:bg-slate-50"
              onClick={onExport}
            >
              Export Excel
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto border rounded-lg">
          {/* Table Header */}
          <div className="grid grid-cols-8 gap-0 bg-slate-100 border-b font-medium text-xs sticky top-0 min-w-[1000px]">
            <div className="px-2 py-1.5 border-r">#</div>
            <div className="px-2 py-1.5 border-r">Customer</div>
            <div className="px-2 py-1.5 border-r hidden md:block">Driver</div>
            <div className="px-2 py-1.5 border-r hidden md:block">Category</div>
            <div className="px-2 py-1.5 border-r">Bag Format</div>
            <div className="px-2 py-1.5 border-r hidden sm:block">Non‑Veg</div>
            <div className="px-2 py-1.5 border-r hidden sm:block">Veg</div>
            <div className="px-2 py-1.5">Total</div>
          </div>

          {/* Table Body */}
          <div className="bg-white min-w-[1000px]">
            {data.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No customers found for lunch orders
              </div>
            ) : (
              data.map((row, index) => {
                return (
                  <div key={row.customerId} className="grid grid-cols-8 gap-0 border-b hover:bg-slate-50 text-sm">
                    {/* Row Number */}
                    <div className="px-2 py-2 border-r text-[11px] text-muted-foreground font-mono">
                      {index + 1}
                    </div>

                    {/* Customer Name */}
                    <div className="px-2 py-2 border-r">
                      <div className="font-medium text-sm truncate" title={row.customerName}>{row.customerName}</div>
                    </div>

                    {/* Driver Name */}
                    <div className="px-2 py-2 border-r hidden md:block">
                      <div className="text-xs text-muted-foreground truncate" title={row.driverName}>{row.driverName}</div>
                    </div>

                    {/* Category Name */}
                    <div className="px-2 py-2 border-r hidden md:block">
                      <div className="text-xs text-slate-700 bg-slate-50 px-2 py-0.5 rounded truncate" title={row.categoryName}>{row.categoryName}</div>
                    </div>

                    {/* Bag Format - Editable */}
                    <div className="px-2 py-1.5 border-r">
                      <Input
                        value={row.bagFormat}
                        onChange={(e) => handleBagFormatChange(row.customerId, e.target.value)}
                        className="h-7 text-xs font-mono border-slate-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-200"
                        placeholder="e.g., 5,5+7"
                      />
                    </div>

                    {/* Non-Veg Count - Read Only */}
                    <div className="px-2 py-2 border-r hidden sm:block">
                      <div className="text-xs text-center font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                        {row.nonVegCount}
                      </div>
                    </div>

                    {/* Veg Count - Read Only */}
                    <div className="px-2 py-2 border-r hidden sm:block">
                      <div className="text-xs text-center font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                        {row.vegCount}
                      </div>
                    </div>

                    {/* Total Count - Read Only */}
                    <div className="px-2 py-2">
                      <div className="text-xs text-center font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
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
          <div className="mt-3 bg-slate-50 rounded-lg p-3 border text-xs">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center">
                <div className="font-semibold text-slate-600">Total Customers</div>
                <div className="text-base font-bold text-slate-800">{data.length}</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-red-600">Total Non-Veg</div>
                <div className="text-base font-bold text-red-700">
                  {data.reduce((sum, row) => sum + row.nonVegCount, 0)}
                </div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-green-600">Total Veg</div>
                <div className="text-base font-bold text-green-700">
                  {data.reduce((sum, row) => sum + row.vegCount, 0)}
                </div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-orange-600">Grand Total</div>
                <div className="text-base font-bold text-orange-700">
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
