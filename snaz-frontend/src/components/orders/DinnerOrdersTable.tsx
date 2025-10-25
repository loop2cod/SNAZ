"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Moon, Truck, Group } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DinnerOrderData {
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

interface DinnerOrdersTableProps {
  data: DinnerOrderData[];
  loading: boolean;
  onOrderChange: (customerId: string, field: string, value: string) => void;
  onExport?: () => void;
}

export function DinnerOrdersTable({
  data,
  loading,
  onOrderChange,
  onExport,
}: DinnerOrdersTableProps) {
  const [groupByDriver, setGroupByDriver] = React.useState(true); // Default to grouped view

  const handleBagFormatChange = (customerId: string, value: string) => {
    onOrderChange(customerId, 'bagFormat', value);
  };

  // Group data by driver
  const groupedData = React.useMemo(() => {
    if (!groupByDriver) return { ungrouped: data };
    
    const groups: Record<string, DinnerOrderData[]> = {};
    
    data.forEach(order => {
      const driverName = order.driverName || 'Unknown Driver';
      
      if (!groups[driverName]) {
        groups[driverName] = [];
      }
      groups[driverName].push(order);
    });
    
    return groups;
  }, [data, groupByDriver]);

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div>Loading dinner orders...</div>
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
              <Moon className="h-4 w-4 text-indigo-500" />
              Daily Dinner Orders
            </CardTitle>
            <CardDescription className="text-xs">
              Excel-style interface for managing customer dinner orders
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => setGroupByDriver(!groupByDriver)}
              variant={groupByDriver ? "default" : "outline"} 
              size="sm"
            >
              <Group className="h-3 w-3 mr-2" />
              {groupByDriver ? "Ungrouped" : "Group by Driver"}
            </Button>
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
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-auto">
          <Table className="border-collapse">
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50 border-b">
                <TableHead className="w-12 text-center font-semibold text-slate-700 border-r text-xs">#</TableHead>
                <TableHead className="min-w-[140px] font-semibold text-slate-700 border-r text-xs">Customer</TableHead>
                <TableHead className="min-w-[100px] font-semibold text-slate-700 border-r text-xs hidden md:table-cell">Driver</TableHead>
                <TableHead className="min-w-[100px] font-semibold text-slate-700 border-r text-xs hidden md:table-cell">Category</TableHead>
                <TableHead className="min-w-[120px] font-semibold text-slate-700 border-r text-xs">Bag Format</TableHead>
                <TableHead className="w-20 text-center font-semibold text-red-700 border-r text-xs hidden sm:table-cell">Non-Veg</TableHead>
                <TableHead className="w-20 text-center font-semibold text-green-700 border-r text-xs hidden sm:table-cell">Veg</TableHead>
                <TableHead className="w-20 text-center font-semibold text-indigo-700 text-xs">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupByDriver ? (
                /* Grouped View by Driver */
                Object.entries(groupedData).map(([driverName, driverOrders]) => (
                  <React.Fragment key={driverName}>
                    {/* Driver Header Row */}
                    <TableRow className="bg-indigo-50 hover:bg-indigo-50 border-b-2 border-indigo-200">
                      <TableCell className="text-center font-bold text-indigo-700 border-r">
                        <Truck className="h-3 w-3 inline mr-1" />
                      </TableCell>
                      <TableCell className="font-bold text-sm text-indigo-700 border-r" colSpan={3}>
                        <div className="flex items-center gap-2">
                          <span>{driverName}</span>
                          <Badge variant="secondary" className="text-xs">
                            {driverOrders.length} customer{driverOrders.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="border-r text-center text-xs font-bold text-slate-600">
                        Driver Total
                      </TableCell>
                      <TableCell className="text-center border-r hidden sm:table-cell">
                        <div className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-red-800 bg-red-200 rounded">
                          {driverOrders.reduce((sum, order) => sum + order.nonVegCount, 0)}
                        </div>
                      </TableCell>
                      <TableCell className="text-center border-r hidden sm:table-cell">
                        <div className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-green-800 bg-green-200 rounded">
                          {driverOrders.reduce((sum, order) => sum + order.vegCount, 0)}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-indigo-800 bg-indigo-200 rounded">
                          {driverOrders.reduce((sum, order) => sum + order.totalCount, 0)}
                        </div>
                      </TableCell>
                    </TableRow>
                    {/* Customer Rows for this Driver */}
                    {driverOrders.map((row, index) => (
                      <TableRow key={row.customerId} className="hover:bg-slate-50/50 border-b">
                        {/* Row Number */}
                        <TableCell className="text-center text-xs text-muted-foreground font-mono border-r bg-slate-50/30">
                          {index + 1}
                        </TableCell>

                        {/* Customer Name */}
                        <TableCell className="font-medium text-sm border-r">
                          <div className="truncate" title={row.customerName}>
                            {row.customerName}
                          </div>
                        </TableCell>

                        {/* Driver Name - Hidden in grouped view */}
                        <TableCell className="text-xs text-muted-foreground border-r hidden md:table-cell">
                          <div className="text-xs text-slate-400 italic">
                            {/* Empty or minimal indicator since grouped by driver */}
                            —
                          </div>
                        </TableCell>

                        {/* Category Name */}
                        <TableCell className="border-r hidden md:table-cell">
                          <div className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-700 truncate" title={row.categoryName}>
                            {row.categoryName}
                          </div>
                        </TableCell>

                        {/* Bag Format - Editable */}
                        <TableCell className="border-r p-1">
                          <Input
                            value={row.bagFormat}
                            onChange={(e) => handleBagFormatChange(row.customerId, e.target.value)}
                            className="h-8 text-xs font-mono border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 bg-white"
                            placeholder="e.g., 3+5"
                          />
                        </TableCell>

                        {/* Non-Veg Count - Read Only */}
                        <TableCell className="text-center border-r hidden sm:table-cell">
                          <div className="inline-flex items-center justify-center w-8 h-6 text-xs font-bold text-red-700 bg-red-100 rounded">
                            {row.nonVegCount}
                          </div>
                        </TableCell>

                        {/* Veg Count - Read Only */}
                        <TableCell className="text-center border-r hidden sm:table-cell">
                          <div className="inline-flex items-center justify-center w-8 h-6 text-xs font-bold text-green-700 bg-green-100 rounded">
                            {row.vegCount}
                          </div>
                        </TableCell>

                        {/* Total Count - Read Only */}
                        <TableCell className="text-center">
                          <div className="inline-flex items-center justify-center w-8 h-6 text-xs font-bold text-indigo-700 bg-indigo-100 rounded">
                            {row.totalCount}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                ))
              ) : (
                /* Ungrouped View */
                data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No customers found for dinner orders
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((row, index) => (
                    <TableRow key={row.customerId} className="hover:bg-slate-50/50 border-b">
                      {/* Row Number */}
                      <TableCell className="text-center text-xs text-muted-foreground font-mono border-r bg-slate-50/30">
                        {index + 1}
                      </TableCell>

                      {/* Customer Name */}
                      <TableCell className="font-medium text-sm border-r">
                        <div className="truncate" title={row.customerName}>
                          {row.customerName}
                        </div>
                      </TableCell>

                      {/* Driver Name */}
                      <TableCell className="text-xs text-muted-foreground border-r hidden md:table-cell">
                        <div className="truncate" title={row.driverName}>
                          {row.driverName}
                        </div>
                      </TableCell>

                      {/* Category Name */}
                      <TableCell className="border-r hidden md:table-cell">
                        <div className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-700 truncate" title={row.categoryName}>
                          {row.categoryName}
                        </div>
                      </TableCell>

                      {/* Bag Format - Editable */}
                      <TableCell className="border-r p-1">
                        <Input
                          value={row.bagFormat}
                          onChange={(e) => handleBagFormatChange(row.customerId, e.target.value)}
                          className="h-8 text-xs font-mono border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 bg-white"
                          placeholder="e.g., 3+5"
                        />
                      </TableCell>

                      {/* Non-Veg Count - Read Only */}
                      <TableCell className="text-center border-r hidden sm:table-cell">
                        <div className="inline-flex items-center justify-center w-8 h-6 text-xs font-bold text-red-700 bg-red-100 rounded">
                          {row.nonVegCount}
                        </div>
                      </TableCell>

                      {/* Veg Count - Read Only */}
                      <TableCell className="text-center border-r hidden sm:table-cell">
                        <div className="inline-flex items-center justify-center w-8 h-6 text-xs font-bold text-green-700 bg-green-100 rounded">
                          {row.vegCount}
                        </div>
                      </TableCell>

                      {/* Total Count - Read Only */}
                      <TableCell className="text-center">
                        <div className="inline-flex items-center justify-center w-8 h-6 text-xs font-bold text-indigo-700 bg-indigo-100 rounded">
                          {row.totalCount}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )
              )}
            </TableBody>
          </Table>
        </div>

        {/* Summary Row - Spreadsheet Style */}
        {data.length > 0 && (
          <Table className="border-t-2 border-slate-300">
            <TableBody>
              <TableRow className="bg-indigo-50 hover:bg-indigo-50 border-b font-semibold">
                <TableCell className="text-center text-xs border-r bg-slate-100">∑</TableCell>
                <TableCell className="font-bold text-sm border-r">
                  GRAND TOTAL ({data.length} customers{groupByDriver ? `, ${Object.keys(groupedData).length} drivers` : ''})
                </TableCell>
                <TableCell className="border-r hidden md:table-cell"></TableCell>
                <TableCell className="border-r hidden md:table-cell"></TableCell>
                <TableCell className="border-r text-center text-xs font-bold text-slate-600">
                  Summary
                </TableCell>
                <TableCell className="text-center border-r hidden sm:table-cell">
                  <div className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-red-800 bg-red-200 rounded">
                    {data.reduce((sum, row) => sum + row.nonVegCount, 0)}
                  </div>
                </TableCell>
                <TableCell className="text-center border-r hidden sm:table-cell">
                  <div className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-green-800 bg-green-200 rounded">
                    {data.reduce((sum, row) => sum + row.vegCount, 0)}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-indigo-800 bg-indigo-200 rounded">
                    {data.reduce((sum, row) => sum + row.totalCount, 0)}
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
