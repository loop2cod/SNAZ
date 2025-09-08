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
import { ArrowUpDown, ChevronDown, MoreHorizontal, Edit, Trash2, Moon, Search, Download, Clock, DollarSign } from "lucide-react"

import { Button } from "@/components/ui/button"
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
import { DailyOrder, Driver } from "@/lib/api"

interface DinnerOrdersDataTableProps {
  orders: DailyOrder[]
  loading: boolean
  onEdit: (order: DailyOrder) => void
  onDelete: (order: DailyOrder) => void
  onAddNew: () => void
  onExport: () => void
}

export function DinnerOrdersDataTable({
  orders,
  loading,
  onEdit,
  onDelete,
  onAddNew,
  onExport
}: DinnerOrdersDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const columns: ColumnDef<DailyOrder>[] = [
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
      accessorKey: "date",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Date
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium">
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4 text-indigo-600" />
            <span>{new Date(row.getValue("date")).toLocaleDateString()}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "driverId",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Driver
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => {
        const driver = row.original.driverId as Driver;
        return (
          <div className="text-sm">
            <div className="font-medium">{typeof driver === 'string' ? driver : driver.name}</div>
            {typeof driver !== 'string' && (
              <div className="text-muted-foreground text-xs">{driver.route}</div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "totalFood",
      header: "Total Food",
      cell: ({ row }) => (
        <div className="text-sm">
          <div className="font-medium">{row.getValue("totalFood")} items</div>
          <div className="text-xs text-muted-foreground">
            {row.original.totalNonVegFood} non-veg + {row.original.totalVegFood} veg
          </div>
        </div>
      ),
    },
    {
      accessorKey: "totalAmount",
      header: "Amount",
      cell: ({ row }) => (
        <div className="text-sm font-medium flex items-center gap-1">
          <DollarSign className="h-3 w-3 text-muted-foreground" />
          <span>S$ {Number(row.getValue("totalAmount")).toFixed(2)}</span>
        </div>
      ),
    },
    {
      accessorKey: "neaStartTime",
      header: "NEA Time",
      cell: ({ row }) => (
        <div className="text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>
              {new Date(row.original.neaStartTime).toLocaleTimeString('en-US', {hour12: false, hour: '2-digit', minute:'2-digit'})} - 
              {new Date(row.original.neaEndTime).toLocaleTimeString('en-US', {hour12: false, hour: '2-digit', minute:'2-digit'})}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const order = row.original

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
              <DropdownMenuItem onClick={() => onEdit(order)}>
                <Edit className="mr-2 h-3 w-3" />
                Edit Order
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(order)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-3 w-3" />
                Delete Order
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: orders,
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
          <div>Loading dinner orders...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Moon className="h-5 w-5 text-indigo-500" />
              Dinner Orders Database
            </CardTitle>
            <CardDescription>Manage daily dinner orders and delivery schedules</CardDescription>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter orders..."
                value={(table.getColumn("date")?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                  table.getColumn("date")?.setFilterValue(event.target.value)
                }
                className="h-8 w-[250px]"
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
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="bg-muted/50">
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} className="h-8 px-2">
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
                        <TableCell key={cell.id} className="px-2 py-2">
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
                      No dinner orders found.
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
              {table.getFilteredRowModel().rows.length} order(s) selected.
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