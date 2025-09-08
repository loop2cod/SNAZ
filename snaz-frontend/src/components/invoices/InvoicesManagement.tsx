"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Download, Eye, Send, DollarSign } from "lucide-react";
import { toast } from "sonner";

export default function InvoicesManagement() {
  const [invoices] = useState([
    {
      _id: "1",
      invoiceNumber: "INV-2024-001",
      customerName: "ABC Corporation",
      driverName: "John Driver",
      startDate: "2024-01-01",
      endDate: "2024-01-31",
      totalAmount: 25000,
      status: "sent",
      createdAt: "2024-02-01"
    },
    {
      _id: "2",
      invoiceNumber: "INV-2024-002",
      customerName: "XYZ Tech Solutions",
      driverName: "Mike Delivery",
      startDate: "2024-01-01",
      endDate: "2024-01-31",
      totalAmount: 42000,
      status: "paid",
      createdAt: "2024-02-01"
    },
    {
      _id: "3",
      invoiceNumber: "INV-2024-003",
      customerName: "Manufacturing Ltd",
      driverName: "Sarah Transport",
      startDate: "2024-01-01",
      endDate: "2024-01-31",
      totalAmount: 18500,
      status: "draft",
      createdAt: "2024-02-01"
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'default';
      case 'sent': return 'secondary';
      case 'overdue': return 'destructive';
      case 'draft': return 'outline';
      default: return 'outline';
    }
  };

  const handleGenerateInvoice = () => {
    toast.success("Invoice generation will be implemented");
  };

  const handleViewInvoice = (invoiceId: string) => {
    toast.success("Invoice viewer will be implemented");
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    toast.success("Invoice download will be implemented");
  };

  const handleSendInvoice = (invoiceId: string) => {
    toast.success("Invoice sending will be implemented");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>All Invoices</CardTitle>
            <Button onClick={handleGenerateInvoice}>
              <Plus className="w-4 h-4 mr-2" />
              Generate Invoice
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{invoices.length}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${invoices.reduce((sum, inv) => sum + inv.totalAmount, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Outstanding revenue</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Paid</CardTitle>
                <Badge variant="default" className="h-4 px-1 text-xs">PAID</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.totalAmount, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {invoices.filter(inv => inv.status === 'paid').length} invoices
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Badge variant="secondary" className="h-4 px-1 text-xs">PENDING</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${invoices.filter(inv => inv.status !== 'paid').reduce((sum, inv) => sum + inv.totalAmount, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {invoices.filter(inv => inv.status !== 'paid').length} invoices
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Invoices List */}
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <Card key={invoice._id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{invoice.invoiceNumber}</h3>
                        <Badge variant={getStatusColor(invoice.status)}>
                          {invoice.status.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <div><strong>Customer:</strong> {invoice.customerName}</div>
                        <div><strong>Driver:</strong> {invoice.driverName}</div>
                        <div><strong>Period:</strong> {new Date(invoice.startDate).toLocaleDateString()} - {new Date(invoice.endDate).toLocaleDateString()}</div>
                        <div><strong>Created:</strong> {new Date(invoice.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    
                    <div className="text-right space-y-3">
                      <div className="text-2xl font-bold">${invoice.totalAmount.toLocaleString()}</div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewInvoice(invoice._id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadInvoice(invoice._id)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        
                        {invoice.status !== 'paid' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendInvoice(invoice._id)}
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {invoices.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No invoices generated yet.
            </div>
          )}
        </CardContent>
      </Card>
  );
}