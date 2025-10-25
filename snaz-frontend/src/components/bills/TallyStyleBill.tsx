"use client";

import React, { useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface BillItem {
  categoryName: string;
  unitPrice: number;
  quantity: number;
  amount: number;
}

interface DailyOrderData {
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
}

interface BillData {
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
  items: BillItem[];
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
}

interface TallyStyleBillProps {
  bill: BillData;
  companyInfo?: {
    name: string;
    address: string;
    phone?: string;
    email?: string;
    gst?: string;
  };
}

export function TallyStyleBill({ 
  bill, 
  companyInfo = {
    name: "Shafi Catering Services",
    address: "123 Main Street, City, State - 123456",
    phone: "+91 98765 43210",
    email: "info@shaficatering.com",
    gst: "22AAAAA0000A1Z5"
  }
}: TallyStyleBillProps) {
  const billRef = useRef<HTMLDivElement>(null);
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getMonthName = (month: number) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1];
  };

  const handleDownloadPDF = async () => {
    if (!billRef.current) return;

    try {
      // Hide the download button temporarily
      const downloadButton = document.querySelector('.download-btn') as HTMLElement;
      if (downloadButton) downloadButton.style.display = 'none';

      // Wait a moment for UI to update
      await new Promise(resolve => setTimeout(resolve, 100));

      // Configure html2canvas with safer options
      const canvas = await html2canvas(billRef.current, {
        scale: 2, // Slightly lower scale to avoid memory issues
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        removeContainer: true,
        foreignObjectRendering: false, // Disable to avoid OKLCH issues
        onclone: (clonedDoc) => {
          // Force all elements to use standard colors
          const elements = clonedDoc.querySelectorAll('*');
          elements.forEach((el: any) => {
            // Reset problematic CSS properties
            el.style.setProperty('color', 'black', 'important');
            el.style.setProperty('background-color', 'transparent', 'important');
            
            // Apply specific colors based on classes
            if (el.classList.contains('text-gray-600')) {
              el.style.setProperty('color', '#4b5563', 'important');
            }
            if (el.classList.contains('text-gray-800')) {
              el.style.setProperty('color', '#1f2937', 'important');
            }
            if (el.classList.contains('text-red-600')) {
              el.style.setProperty('color', '#dc2626', 'important');
            }
            if (el.classList.contains('text-green-600')) {
              el.style.setProperty('color', '#16a34a', 'important');
            }
            if (el.classList.contains('bg-gray-50')) {
              el.style.setProperty('background-color', '#f9fafb', 'important');
            }
            if (el.classList.contains('bg-gray-100')) {
              el.style.setProperty('background-color', '#f3f4f6', 'important');
            }
            if (el.classList.contains('bg-yellow-50')) {
              el.style.setProperty('background-color', '#fefce8', 'important');
            }
          });
        }
      });

      // Show the download button again
      if (downloadButton) downloadButton.style.display = 'block';

      // Create PDF in A4 format
      const imgData = canvas.toDataURL('image/png', 0.8); // Slightly compressed
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // A4 dimensions in mm
      const pdfWidth = 210;
      const pdfHeight = 297;
      const margin = 4;
      
      // Calculate available space
      const availableWidth = pdfWidth - (2 * margin);
      const availableHeight = pdfHeight - (2 * margin);
      
      // Calculate scaling to fit A4 with margins
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(availableWidth / (imgWidth * 0.264583), availableHeight / (imgHeight * 0.264583));
      
      const scaledWidth = (imgWidth * 0.264583) * ratio;
      const scaledHeight = (imgHeight * 0.264583) * ratio;
      
      // Center the image on the page
      const x = (pdfWidth - scaledWidth) / 2;
      const y = margin;
      
      pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight);
      
      // Download the PDF
      pdf.save(`invoice-${bill.number}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Show the download button again in case of error
      const downloadButton = document.querySelector('.download-btn') as HTMLElement;
      if (downloadButton) downloadButton.style.display = 'block';
      
      alert('Failed to generate PDF. This might be due to browser compatibility. Please try using Chrome or Edge.');
    }
  };

  return (
    <div className="max-w-[210mm] mx-auto">
      {/* Action Buttons */}
      <div className="mb-2 flex justify-end gap-2 print:hidden">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleDownloadPDF}
          className="download-btn"
        >
          <Download className="h-3 w-3 mr-1" />
          Download PDF
        </Button>
      </div>

      {/* Bill Container - A4 sized */}
      <Card ref={billRef} className="min-h-[297mm] w-[210mm] mx-auto relative print:shadow-none border-none rounded-none">
        <div className="p-4 flex flex-col min-h-[289mm] bill-content"> {/* 297mm - 8mm padding */}
          {/* Header */}
          <div className="border-b border-gray-800 pb-3 mb-4">
            <div className="flex justify-between items-start">
              {/* Company Info */}
              <div>
                <h1 className="text-lg font-bold text-gray-800 mb-1">
                  {companyInfo.name}
                </h1>
                <div className="text-xs text-gray-600 space-y-0.5">
                  <div>{companyInfo.address}</div>
                  {companyInfo.phone && <div>Phone: {companyInfo.phone}</div>}
                  {companyInfo.email && <div>Email: {companyInfo.email}</div>}
                  {companyInfo.gst && <div>GST: {companyInfo.gst}</div>}
                </div>
              </div>
              
              {/* Invoice Title */}
              <div className="text-right">
                <h2 className="text-xl font-bold text-gray-800 mb-1">INVOICE</h2>
                <div className="text-xs text-gray-600">
                  <div>Date: {formatDate(bill.generatedAt)}</div>
                  {bill.dueDate && <div>Due Date: {formatDate(bill.dueDate)}</div>}
                </div>
              </div>
            </div>
          </div>

          {/* Bill Details Row */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Bill To */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2 border-b border-gray-300 pb-1">
                BILL TO
              </h3>
              <div className="text-xs space-y-0.5">
                <div className="font-medium text-gray-800">
                  {bill.entityName || 'N/A'}
                </div>
                {bill.entityAddress && (
                  <div className="text-gray-600">{bill.entityAddress}</div>
                )}
                {bill.entityPhone && (
                  <div className="text-gray-600">Phone: {bill.entityPhone}</div>
                )}
                <div className="text-gray-600 capitalize">
                  Type: {bill.entityType}
                </div>
              </div>
            </div>

            {/* Invoice Details */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2 border-b border-gray-300 pb-1">
                INVOICE DETAILS
              </h3>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Invoice No:</span>
                  <span className="font-medium">{bill.number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Period:</span>
                  <span className="font-medium">
                    {getMonthName(bill.periodMonth)} {bill.periodYear}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Period:</span>
                  <span className="font-medium text-xs">
                    {formatDate(bill.startDate)} - {formatDate(bill.endDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium capitalize px-1 py-0.5 rounded text-xs ${
                    bill.status === 'paid' ? 'bg-green-100 text-green-800' :
                    bill.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {bill.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-4 print:break-inside-avoid">
            <table className="w-full border border-gray-300 text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-300">
                  <th className="text-left py-2 px-2 font-semibold text-gray-800 border-r border-gray-300">
                    Sr.
                  </th>
                  <th className="text-left py-2 px-2 font-semibold text-gray-800 border-r border-gray-300">
                    Description
                  </th>
                  <th className="text-right py-2 px-2 font-semibold text-gray-800 border-r border-gray-300">
                    Unit Price
                  </th>
                  <th className="text-right py-2 px-2 font-semibold text-gray-800 border-r border-gray-300">
                    Qty
                  </th>
                  <th className="text-right py-2 px-2 font-semibold text-gray-800">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {bill.items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-2 px-2 text-gray-800 border-r border-gray-200">
                      {index + 1}
                    </td>
                    <td className="py-2 px-2 text-gray-800 border-r border-gray-200">
                      {item.categoryName}
                    </td>
                    <td className="py-2 px-2 text-right text-gray-800 border-r border-gray-200">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="py-2 px-2 text-right text-gray-800 border-r border-gray-200">
                      {item.quantity}
                    </td>
                    <td className="py-2 px-2 text-right text-gray-800">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
                {bill.items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-gray-500 italic">
                      No line items found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Daily Orders Breakdown - Only for customer bills */}
          {bill.entityType === 'customer' && bill.dailyOrders && Object.keys(bill.dailyOrders).length > 0 && (
            <div className="mb-4 print:break-inside-auto">
              <h3 className="text-sm font-semibold text-gray-800 mb-2 border-b border-gray-300 pb-1">
                DAILY ORDERS BREAKDOWN - {getMonthName(bill.periodMonth)} {bill.periodYear}
                {bill.customerPackages && bill.customerPackages.length > 0 && (
                  <span className="text-xs font-normal text-gray-600 ml-2">
                    (Unit Price: {formatCurrency(bill.customerPackages[0].unitPrice)})
                  </span>
                )}
              </h3>
              <table className="w-full border border-gray-300 text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-300">
                    <th className="text-left py-1 px-1 font-semibold text-gray-800 border-r border-gray-300">Date</th>
                    <th className="text-left py-1 px-1 font-semibold text-gray-800 border-r border-gray-300">Lunch</th>
                    <th className="text-center py-1 px-1 font-semibold text-red-700 border-r border-gray-300">NV</th>
                    <th className="text-center py-1 px-1 font-semibold text-green-700 border-r border-gray-300">V</th>
                    <th className="text-center py-1 px-1 font-semibold text-orange-700 border-r border-gray-300">L</th>
                    <th className="text-right py-1 px-1 font-semibold text-orange-700 border-r border-gray-300">L Amt</th>
                    <th className="text-left py-1 px-1 font-semibold text-gray-800 border-r border-gray-300">Dinner</th>
                    <th className="text-center py-1 px-1 font-semibold text-red-700 border-r border-gray-300">NV</th>
                    <th className="text-center py-1 px-1 font-semibold text-green-700 border-r border-gray-300">V</th>
                    <th className="text-center py-1 px-1 font-semibold text-indigo-700 border-r border-gray-300">D</th>
                    <th className="text-right py-1 px-1 font-semibold text-indigo-700 border-r border-gray-300">D Amt</th>
                    <th className="text-right py-1 px-1 font-semibold text-gray-800 bg-gray-100">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(bill.dailyOrders)
                    .sort((a, b) => parseInt(a) - parseInt(b))
                    .map((day) => {
                      const dayData = bill.dailyOrders![day];
                      const lunch = dayData?.lunch;
                      const dinner = dayData?.dinner;
                      
                      return (
                        <tr key={day} className="border-b border-gray-200">
                          <td className="py-1 px-1 text-gray-800 border-r border-gray-200 font-medium">
                            {dayData.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </td>
                          
                          {/* Lunch columns */}
                          <td className="py-1 px-1 text-gray-800 border-r border-gray-200 font-mono text-xs">
                            {lunch?.bagFormat || '-'}
                          </td>
                          <td className="py-1 px-1 text-center text-red-600 border-r border-gray-200 font-medium">
                            {lunch?.nonVegCount || 0}
                          </td>
                          <td className="py-1 px-1 text-center text-green-600 border-r border-gray-200 font-medium">
                            {lunch?.vegCount || 0}
                          </td>
                          <td className="py-1 px-1 text-center font-bold border-r border-gray-200">
                            {lunch?.totalCount || 0}
                          </td>
                          <td className="py-1 px-1 text-right font-bold text-orange-700 border-r border-gray-200">
                            {lunch?.amount ? formatCurrency(lunch.amount) : '-'}
                          </td>
                          
                          {/* Dinner columns */}
                          <td className="py-1 px-1 text-gray-800 border-r border-gray-200 font-mono text-xs">
                            {dinner?.bagFormat || '-'}
                          </td>
                          <td className="py-1 px-1 text-center text-red-600 border-r border-gray-200 font-medium">
                            {dinner?.nonVegCount || 0}
                          </td>
                          <td className="py-1 px-1 text-center text-green-600 border-r border-gray-200 font-medium">
                            {dinner?.vegCount || 0}
                          </td>
                          <td className="py-1 px-1 text-center font-bold border-r border-gray-200">
                            {dinner?.totalCount || 0}
                          </td>
                          <td className="py-1 px-1 text-right font-bold text-indigo-700 border-r border-gray-200">
                            {dinner?.amount ? formatCurrency(dinner.amount) : '-'}
                          </td>
                          
                          {/* Day total */}
                          <td className="py-1 px-1 text-right font-bold bg-gray-50 text-sm">
                            {formatCurrency(dayData.dayTotal)}
                          </td>
                        </tr>
                      );
                    })}
                  
                  {/* Monthly Summary Row */}
                  {(() => {
                    const days = Object.keys(bill.dailyOrders!);
                    let totalLunch = 0, totalDinner = 0, totalLunchNV = 0, totalLunchV = 0, totalDinnerNV = 0, totalDinnerV = 0;
                    let totalLunchAmount = 0, totalDinnerAmount = 0, grandTotalAmount = 0;
                    
                    days.forEach(day => {
                      const dayData = bill.dailyOrders![day];
                      totalLunchNV += dayData.lunch?.nonVegCount || 0;
                      totalLunchV += dayData.lunch?.vegCount || 0;
                      totalLunch += dayData.lunch?.totalCount || 0;
                      totalLunchAmount += dayData.lunch?.amount || 0;
                      
                      totalDinnerNV += dayData.dinner?.nonVegCount || 0;
                      totalDinnerV += dayData.dinner?.vegCount || 0;
                      totalDinner += dayData.dinner?.totalCount || 0;
                      totalDinnerAmount += dayData.dinner?.amount || 0;
                      
                      grandTotalAmount += dayData.dayTotal || 0;
                    });
                    
                    return (
                      <tr className="bg-blue-50 border-t-2 border-blue-300 font-bold">
                        <td className="py-2 px-1 text-gray-800 border-r border-gray-300 text-xs">
                          TOTAL ({days.length} days)
                        </td>
                        <td className="py-2 px-1 text-center text-gray-600 border-r border-gray-300">—</td>
                        <td className="py-2 px-1 text-center text-red-700 border-r border-gray-300">{totalLunchNV}</td>
                        <td className="py-2 px-1 text-center text-green-700 border-r border-gray-300">{totalLunchV}</td>
                        <td className="py-2 px-1 text-center text-orange-700 border-r border-gray-300">{totalLunch}</td>
                        <td className="py-2 px-1 text-right text-orange-700 border-r border-gray-300 font-bold">
                          {formatCurrency(totalLunchAmount)}
                        </td>
                        <td className="py-2 px-1 text-center text-gray-600 border-r border-gray-300">—</td>
                        <td className="py-2 px-1 text-center text-red-700 border-r border-gray-300">{totalDinnerNV}</td>
                        <td className="py-2 px-1 text-center text-green-700 border-r border-gray-300">{totalDinnerV}</td>
                        <td className="py-2 px-1 text-center text-indigo-700 border-r border-gray-300">{totalDinner}</td>
                        <td className="py-2 px-1 text-right text-indigo-700 border-r border-gray-300 font-bold">
                          {formatCurrency(totalDinnerAmount)}
                        </td>
                        <td className="py-2 px-1 text-right bg-blue-100 text-blue-800 font-bold">
                          {formatCurrency(grandTotalAmount)}
                        </td>
                      </tr>
                    );
                  })()}
                </tbody>
              </table>
            </div>
          )}

          {/* Totals Section */}
          <div className="flex justify-end mb-3">
            <div className="w-full max-w-xs">
              <div className="text-xs space-y-1">
                <div className="flex justify-between py-1">
                  <span className="text-right font-medium text-gray-800">Subtotal:</span>
                  <span className="text-right text-gray-800">{formatCurrency(bill.subtotal)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-right font-medium text-gray-800">Tax:</span>
                  <span className="text-right text-gray-800">{formatCurrency(bill.tax)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-right font-bold text-gray-800">Total Amount:</span>
                  <span className="text-right font-bold text-gray-800 text-sm">{formatCurrency(bill.totalAmount)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-right font-medium text-gray-800">Paid Amount:</span>
                  <span className="text-right text-green-600 font-medium">{formatCurrency(bill.paidAmount)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-right font-bold text-gray-800">Balance Due:</span>
                  <span className="text-right font-bold text-red-600 text-sm">{formatCurrency(bill.balanceAmount)}</span>
                </div>
              </div>
            </div>
          </div>


          {/* Footer - Always at bottom */}
          <div className="mt-auto  pt-3 print:break-inside-avoid bill-footer">
          
            
            {/* Bottom Note */}
            <div className="text-center mt-4 pt-2 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                Thank you for your business!
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}