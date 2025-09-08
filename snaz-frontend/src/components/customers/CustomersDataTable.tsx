"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal, Edit, Trash2, Package, Truck, Search, Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Customer, Driver, FoodCategory } from "@/lib/api"
import { parseBagFormat } from "@/lib/bagFormatParser"

interface CustomersDataTableProps {
  customers: Customer[]
  drivers: Driver[]
  foodCategories: FoodCategory[]
  loading: boolean
  onEdit: (customer: Customer) => void
  onDelete: (customer: Customer) => void
  onExport: () => void
}

export function CustomersDataTable({
  customers,
  drivers,
  foodCategories,
  loading,
  onEdit,
  onDelete,
  onExport
}: CustomersDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const getDriverName = (driverId: string | Driver) => {
    if (typeof driverId === 'object') return driverId.name;
    const driver = drivers.find(d => d._id === driverId);
    return driver?.name || "Unknown";
  }

  const getCategoryName = (categoryId: string | FoodCategory) => {
    if (typeof categoryId === 'object') return categoryId.name;
    const category = foodCategories.find(c => c._id === categoryId);
    return category?.name || "Unknown";
  }

  const formatPackages = (packages: any[]) => {
    return packages.map(pkg => `${getCategoryName(pkg.categoryId)}: $${pkg.unitPrice}`).join(", ");
  }

  const columns: ColumnDef<Customer>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Customer Name
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium">
          <div>{row.getValue("name")}</div>
          {row.original.phone && (
            <div className="text-xs text-muted-foreground">{row.original.phone}</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => (
        <div className="max-w-[150px] truncate text-sm" title={row.getValue("address")}>
          {row.getValue("address")}
        </div>
      ),
    },
    {
      accessorKey: "driverId",
      header: "Driver",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Truck className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm">{getDriverName(row.getValue("driverId"))}</span>
        </div>
      ),
    },
    {
      accessorKey: "packages",
      header: "Packages",
      cell: ({ row }) => (
        <div className="max-w-[200px]">
          <div className="flex flex-wrap gap-1">
            {row.original.packages.slice(0, 2).map((pkg, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                <Package className="w-2 h-2 mr-1" />
                {getCategoryName(pkg.categoryId)}: ${pkg.unitPrice}
              </Badge>
            ))}
            {row.original.packages.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{row.original.packages.length - 2}
              </Badge>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "dailyFood",
      header: "Daily Food",
      cell: ({ row }) => {
        const lunchParsed = parseBagFormat(row.original.dailyFood.lunch);
        const dinnerParsed = parseBagFormat(row.original.dailyFood.dinner);
        
        return (
          <div className="text-xs space-y-1 min-w-[120px]">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1">
                <span className="text-orange-600 font-medium">L:</span>
                <span className="font-mono text-xs">{row.original.dailyFood.lunch}</span>
              </div>
              <div className="text-[10px] text-muted-foreground ml-3">
                {lunchParsed.nonVegCount} Non-veg, {lunchParsed.vegCount} Veg
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-1">
                <span className="text-purple-600 font-medium">D:</span>
                <span className="font-mono text-xs">{row.original.dailyFood.dinner}</span>
              </div>
              <div className="text-[10px] text-muted-foreground ml-3">
                {dinnerParsed.nonVegCount} Non-veg, {dinnerParsed.vegCount} Veg
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "dailyTotals",
      header: "Daily Totals",
      cell: ({ row }) => {
        const lunchParsed = parseBagFormat(row.original.dailyFood.lunch);
        const dinnerParsed = parseBagFormat(row.original.dailyFood.dinner);
        const totalNonVeg = lunchParsed.nonVegCount + dinnerParsed.nonVegCount;
        const totalVeg = lunchParsed.vegCount + dinnerParsed.vegCount;
        const grandTotal = totalNonVeg + totalVeg;
        
        return (
          <div className="text-xs text-center">
            <div className="font-medium text-gray-900">{grandTotal}</div>
            <div className="text-[10px] text-muted-foreground">
              <span className="text-red-600">{totalNonVeg}NV</span> • <span className="text-green-600">{totalVeg}V</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.getValue("isActive") ? "default" : "secondary"} className="text-xs">
          {row.getValue("isActive") ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
      cell: ({ row }) => (
        <div className="text-xs">
          {new Date(row.getValue("startDate")).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const customer = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-6 w-6 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(customer)}>
                <Edit className="mr-2 h-3 w-3" />
                Edit Customer
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(customer)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-3 w-3" />
                Delete Customer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: customers,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div>Loading customers...</div>
        </CardContent>
      </Card>
    )
  }

  // Responsive visibility classes per column
  const responsiveColClasses: Record<string, string> = {
    select: "hidden sm:table-cell",
    address: "hidden xl:table-cell",
    driverId: "hidden sm:table-cell",
    packages: "hidden md:table-cell",
    dailyFood: "hidden lg:table-cell",
    isActive: "hidden md:table-cell",
    startDate: "hidden md:table-cell",
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Customer Database</CardTitle>
            <CardDescription>Manage customer information and packages</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={onExport} variant="outline" size="sm">
              <Download className="h-3 w-3 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filters and Controls */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter customers..."
                value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                  table.getColumn("name")?.setFilterValue(event.target.value)
                }
                className="h-8 w-[180px] sm:w-[250px]"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Columns <ChevronDown className="ml-2 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Data Table */}
          <div className="rounded-md border">
            <Table className="min-w-[900px] md:min-w-0">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="bg-muted/50">
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} className={cn("h-8 px-2", responsiveColClasses[header.column.id as string])}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="h-12 hover:bg-muted/50"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className={cn("px-2 py-2", responsiveColClasses[cell.column.id as string])}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No customers found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between space-x-2 py-2">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} customer(s) selected.
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
