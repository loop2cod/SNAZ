"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Plus, Edit, Clock, Truck, Package, Users, FileText, Search, Filter, Download } from "lucide-react";
import { apiClient, DailyOrder, Driver, Customer, FoodCategory } from "@/lib/api";
import { ExcelExporter } from "@/lib/excel-export";
import { toast } from "sonner";

export default function DailyOrdersManagement() {
  const [dailyOrders, setDailyOrders] = useState<DailyOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<DailyOrder[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<DailyOrder | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [generateForm, setGenerateForm] = useState({
    date: new Date().toISOString().split('T')[0],
    neaStartTime: "09:00"
  });
  const [editForm, setEditForm] = useState({
    bagFormat: ""
  });

  useEffect(() => {
    loadDrivers();
    loadDailyOrders();
  }, []);

  useEffect(() => {
    loadDailyOrders();
  }, [selectedDate, selectedDriver]);

  useEffect(() => {
    filterOrders();
  }, [dailyOrders, selectedDriver]);

  const loadDrivers = async () => {
    try {
      const data = await apiClient.getDrivers();
      setDrivers(data);
    } catch (error) {
      toast.error("Failed to load drivers");
    }
  };

  const loadDailyOrders = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedDate) params.date = selectedDate;
      if (selectedDriver) params.driverId = selectedDriver;
      
      const data = await apiClient.getDailyOrders(params);
      setDailyOrders(data);
    } catch (error) {
      toast.error("Failed to load daily orders");
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = dailyOrders;
    if (selectedDriver) {
      filtered = dailyOrders.filter(order => {
        const driverId = typeof order.driverId === 'string' ? order.driverId : order.driverId._id;
        return driverId === selectedDriver;
      });
    }
    setFilteredOrders(filtered);
  };

  const handleGenerateOrders = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const neaStartDateTime = new Date(`${generateForm.date}T${generateForm.neaStartTime}:00`);
      const data = await apiClient.generateDailyOrders({
        date: generateForm.date,
        neaStartTime: neaStartDateTime.toISOString()
      });
      
      setDailyOrders([...dailyOrders, ...data]);
      toast.success(`Generated ${data.length} daily orders successfully`);
      setIsGenerateDialogOpen(false);
    } catch (error) {
      toast.error("Failed to generate daily orders");
    }
  };

  const handleEditOrderItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder || !editingItem) return;

    try {
      const updatedOrder = await apiClient.updateOrderItem(
        editingOrder._id,
        editingItem._id,
        { bagFormat: editForm.bagFormat }
      );
      
      setDailyOrders(dailyOrders.map(order => 
        order._id === updatedOrder._id ? updatedOrder : order
      ));
      
      toast.success("Order item updated successfully");
      setIsEditDialogOpen(false);
      setEditingOrder(null);
      setEditingItem(null);
    } catch (error) {
      toast.error("Failed to update order item");
    }
  };

  const handleStatusChange = async (order: DailyOrder, newStatus: string) => {
    try {
      const updatedOrder = await apiClient.updateOrderStatus(order._id, newStatus);
      setDailyOrders(dailyOrders.map(o => o._id === updatedOrder._id ? updatedOrder : o));
      toast.success("Order status updated successfully");
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  const openEditDialog = (order: DailyOrder, item: any) => {
    setEditingOrder(order);
    setEditingItem(item);
    setEditForm({ bagFormat: item.bagFormat });
    setIsEditDialogOpen(true);
  };

  const getDriverName = (driverId: string | Driver) => {
    if (typeof driverId === 'object') return driverId.name;
    const driver = drivers.find(d => d._id === driverId);
    return driver?.name || "Unknown Driver";
  };

  const handleExportOrders = () => {
    try {
      if (filteredOrders.length === 0) {
        toast.error("No orders to export");
        return;
      }
      ExcelExporter.exportDailyOrders(filteredOrders);
      toast.success("Daily orders exported successfully");
    } catch (error) {
      toast.error("Failed to export daily orders");
    }
  };

  const getCustomerName = (customerId: any) => {
    if (typeof customerId === 'object') return customerId.name;
    return "Customer";
  };

  const getCategoryName = (categoryId: any) => {
    if (typeof categoryId === 'object') return categoryId.name;
    return "Category";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour12: true, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Order Controls</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportOrders}>
                <Download className="w-4 h-4 mr-2" />
                Export Excel
              </Button>
              <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Generate Orders
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Generate Daily Orders</DialogTitle>
                  <DialogDescription>
                    Generate orders for all active customers for a specific date
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleGenerateOrders}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="date" className="text-right">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={generateForm.date}
                        onChange={(e) => setGenerateForm({ ...generateForm, date: e.target.value })}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="neaStartTime" className="text-right">NEA Start Time</Label>
                      <Input
                        id="neaStartTime"
                        type="time"
                        value={generateForm.neaStartTime}
                        onChange={(e) => setGenerateForm({ ...generateForm, neaStartTime: e.target.value })}
                        className="col-span-3"
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Generate Orders</Button>
                  </DialogFooter>
                </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
                className="flex h-9 w-auto rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                <option value="">All Drivers</option>
                {drivers.map(driver => (
                  <option key={driver._id} value={driver._id}>
                    {driver.name} - {driver.route}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {loading ? (
        <Card>
          <CardContent className="text-center py-8">
            Loading daily orders...
          </CardContent>
        </Card>
      ) : filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8 text-gray-500">
            No orders found for the selected date and filters.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      <CardTitle className="text-lg">{getDriverName(order.driverId)}</CardTitle>
                      <Badge variant={getStatusColor(order.status)}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <CardDescription>
                      <div className="flex items-center gap-4 text-sm">
                        <span>{formatDate(order.date)}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          NEA: {formatTime(order.neaStartTime)} - {formatTime(order.neaEndTime)}
                        </span>
                      </div>
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">${order.totalAmount.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">{order.totalFood} items</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Veg: {order.totalVegFood}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-red-600" />
                    <span className="text-sm">Non-Veg: {order.totalNonVegFood}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">Customers: {new Set(order.orders.map(o => o.customerId)).size}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex gap-2">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order, e.target.value)}
                      className="flex h-8 w-32 rounded-md border border-input bg-transparent px-2 py-1 text-xs"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Meal</TableHead>
                      <TableHead>Bag Format</TableHead>
                      <TableHead>Non-Veg</TableHead>
                      <TableHead>Veg</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.orders.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {getCustomerName(item.customerId)}
                        </TableCell>
                        <TableCell>{getCategoryName(item.categoryId)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {item.mealType.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{item.bagFormat}</TableCell>
                        <TableCell className="text-red-600">{item.nonVegCount}</TableCell>
                        <TableCell className="text-green-600">{item.vegCount}</TableCell>
                        <TableCell className="font-medium">{item.totalCount}</TableCell>
                        <TableCell>${item.totalAmount}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(order, item)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Order Item</DialogTitle>
            <DialogDescription>
              Update the bag format for this order item
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditOrderItem}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="bagFormat" className="text-right">Bag Format</Label>
                <Input
                  id="bagFormat"
                  value={editForm.bagFormat}
                  onChange={(e) => setEditForm({ bagFormat: e.target.value })}
                  className="col-span-3"
                  placeholder="e.g., 5,5+7"
                  required
                />
              </div>
              <div className="col-span-4 text-sm text-gray-500">
                Format: Non-veg counts separated by commas + veg count
                <br />
                Example: "5,5+7" = 5 + 5 non-veg bags + 7 veg bags = 17 total
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}