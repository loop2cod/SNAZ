"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Search, Filter } from "lucide-react";
import { apiClient, Driver } from "@/lib/api";
import { toast } from "sonner";

export default function DriversManagement() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    route: ""
  });

  useEffect(() => {
    loadDrivers();
  }, []);

  useEffect(() => {
    const filtered = drivers.filter(driver =>
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (driver.phone || "").includes(searchTerm)
    );
    setFilteredDrivers(filtered);
  }, [drivers, searchTerm]);

  const loadDrivers = async () => {
    try {
      const data = await apiClient.getDrivers();
      setDrivers(data);
      setFilteredDrivers(data);
    } catch (error) {
      toast.error("Failed to load drivers");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDriver) {
        const updatedDriver = await apiClient.updateDriver(editingDriver._id, formData);
        setDrivers(drivers.map(d => d._id === updatedDriver._id ? updatedDriver : d));
        toast.success("Driver updated successfully");
      } else {
        const newDriver = await apiClient.createDriver(formData);
        setDrivers([...drivers, newDriver]);
        toast.success("Driver created successfully");
      }
      resetForm();
    } catch (error) {
      toast.error(editingDriver ? "Failed to update driver" : "Failed to create driver");
    }
  };

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name,
      phone: driver.phone || "",
      email: driver.email || "",
      route: driver.route
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (driver: Driver) => {
    if (window.confirm(`Are you sure you want to delete driver "${driver.name}"?`)) {
      try {
        await apiClient.deleteDriver(driver._id);
        setDrivers(drivers.filter(d => d._id !== driver._id));
        toast.success("Driver deleted successfully");
      } catch (error) {
        toast.error("Failed to delete driver");
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: "", phone: "", email: "", route: "" });
    setEditingDriver(null);
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Drivers Management</CardTitle>
              <CardDescription>Manage delivery drivers and their routes</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Driver
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editingDriver ? "Edit Driver" : "Add New Driver"}</DialogTitle>
                  <DialogDescription>
                    {editingDriver ? "Update the driver's information." : "Enter the driver's details below."}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="route" className="text-right">Route</Label>
                      <Input
                        id="route"
                        value={formData.route}
                        onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="phone" className="text-right">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingDriver ? "Update" : "Create"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search drivers by name, route, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {loading ? (
            <div className="text-center py-8">Loading drivers...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDrivers.map((driver) => (
                  <TableRow key={driver._id}>
                    <TableCell className="font-medium">{driver.name}</TableCell>
                    <TableCell>{driver.route}</TableCell>
                    <TableCell>{driver.phone || "-"}</TableCell>
                    <TableCell>{driver.email || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={driver.isActive ? "default" : "secondary"}>
                        {driver.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(driver)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(driver)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!loading && filteredDrivers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? "No drivers found matching your search." : "No drivers added yet."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}