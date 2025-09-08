"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Search, Filter, Download } from "lucide-react";
import { apiClient, Driver } from "@/lib/api";
import { ExcelExporter } from "@/lib/excel-export";
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
    setFormData({ name: "", phone: "", route: "" });
    setEditingDriver(null);
    setIsDialogOpen(false);
  };

  const handleExportDrivers = () => {
    try {
      ExcelExporter.exportDrivers(filteredDrivers);
      toast.success("Drivers data exported successfully");
    } catch (error) {
      toast.error("Failed to export drivers data");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>All Drivers</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportDrivers}>
                <Download className="w-4 h-4 mr-2" />
                Export Excel
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => resetForm()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Driver
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[380px] p-4">
                <DialogHeader>
                  <DialogTitle className="text-lg">{editingDriver ? "Edit Driver" : "Add New Driver"}</DialogTitle>
                  <DialogDescription className="text-xs">
                    {editingDriver ? "Update the driver's information." : "Enter the driver's details below."}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-3 py-2">
                    <div className="grid grid-cols-4 items-center gap-3">
                      <Label htmlFor="name" className="text-right text-sm">Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="col-span-3 h-9"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-3">
                      <Label htmlFor="route" className="text-right text-sm">Route</Label>
                      <Input
                        id="route"
                        value={formData.route}
                        onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                        className="col-span-3 h-9"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-3">
                      <Label htmlFor="phone" className="text-right text-sm">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="col-span-3 h-9"
                      />
                    </div>
                  </div>
                  <DialogFooter className="gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button type="submit" size="sm">
                      {editingDriver ? "Update" : "Create"}
                    </Button>
                  </DialogFooter>
                </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search drivers by name, route, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 w-[180px] sm:w-[250px]"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading drivers...</div>
          ) : (
            <Table className="min-w-[700px] md:min-w-0">
              <TableHeader>
                <TableRow>
                  <TableHead className="px-2">Name</TableHead>
                  <TableHead className="px-2 hidden sm:table-cell">Route</TableHead>
                  <TableHead className="px-2 hidden md:table-cell">Phone</TableHead>
                  <TableHead className="px-2 hidden md:table-cell">Status</TableHead>
                  <TableHead className="px-2 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDrivers.map((driver) => (
                  <TableRow key={driver._id}>
                    <TableCell className="font-medium px-2">{driver.name}</TableCell>
                    <TableCell className="px-2 hidden sm:table-cell">{driver.route}</TableCell>
                    <TableCell className="px-2 hidden md:table-cell">{driver.phone || "-"}</TableCell>
                    <TableCell className="px-2 hidden md:table-cell">
                      <Badge variant={driver.isActive ? "default" : "secondary"}>
                        {driver.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-2 text-right">
                      <div className="flex justify-end space-x-2">
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
  );
}
