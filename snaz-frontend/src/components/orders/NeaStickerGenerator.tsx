"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Sticker, Download, Clock } from "lucide-react";
import { toast } from "sonner";
import { format, addHours } from "date-fns";

interface NeaStickerData {
  customerName: string;
  driverName: string;
  bagFormat: string;
  readyTime: Date;
  consumeByTime: Date;
  date: string;
}

interface NeaStickerGeneratorProps {
  mealType: 'lunch' | 'dinner';
  orderData?: any[];
}

export function NeaStickerGenerator({ mealType, orderData = [] }: NeaStickerGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [startTime, setStartTime] = useState('09:00');
  const [generating, setGenerating] = useState(false);

  const calculateEndTime = (start: string) => {
    const [hours, minutes] = start.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    const endDate = addHours(startDate, 4);
    return format(endDate, 'HH:mm');
  };

  const generateStickers = async () => {
    setGenerating(true);
    try {
      const [hours, minutes] = startTime.split(':').map(Number);
      const readyTime = new Date();
      readyTime.setHours(hours, minutes, 0, 0);
      const consumeByTime = addHours(readyTime, 4);
      
      const currentDate = format(new Date(), 'dd/MM/yyyy');
      
      if (orderData.length === 0) {
        toast.error('No orders found for sticker generation');
        return;
      }

      // Create sticker data for each order (one sticker per customer order)
      const stickers: NeaStickerData[] = orderData.map(order => ({
        customerName: order.customerName,
        driverName: order.driverName,
        bagFormat: order.bagFormat || '',
        readyTime,
        consumeByTime,
        date: currentDate
      }));

      // Generate PDF
      await generateStickerPDF(stickers);
      
      toast.success(`${stickers.length} NEA stickers generated successfully`);
      setIsOpen(false);
    } catch (error) {
      console.error('Error generating stickers:', error);
      toast.error('Failed to generate stickers');
    } finally {
      setGenerating(false);
    }
  };

  const generateStickerPDF = async (stickers: NeaStickerData[]) => {
    // We'll implement this with jsPDF
    const { jsPDF } = await import('jspdf');
    
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // A4 dimensions: 210mm x 297mm
    // Sticker dimensions for 3x10 layout: 70mm x 29.7mm each
    const stickerWidth = 70;
    const stickerHeight = 29.7;
    const cols = 3;
    const rows = 10;
    const marginX = 0;
    const marginY = 0;

    let currentPage = 0;
    let currentRow = 0;
    let currentCol = 0;

    stickers.forEach((sticker, index) => {
      // Add new page if needed
      if (index > 0 && index % (cols * rows) === 0) {
        doc.addPage();
        currentPage++;
        currentRow = 0;
        currentCol = 0;
      }

      const x = marginX + (currentCol * stickerWidth);
      const y = marginY + (currentRow * stickerHeight);

      // Draw sticker border
      doc.rect(x, y, stickerWidth, stickerHeight);

      // Add sticker content
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      
      // Customer name + bag format (top line)
      const customerBagFormat = `${sticker.customerName}-${sticker.bagFormat}`;
      doc.text(customerBagFormat, x + 2, y + 5);
      
      // Driver name (bigger and red-highlighted)
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(200, 0, 0); // Red color
      doc.text(`Driver: ${sticker.driverName}`, x + 2, y + 9);
      
      // Reset color to black
      doc.setTextColor(0, 0, 0);
      
      // Company name
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text('SNAZ Catering Pte Ltd', x + 2, y + 13);
      doc.text('SFA License No: NW12957L000', x + 2, y + 16);
      
      // Times
      doc.text(`Food Ready To Eat: ${sticker.date} at ${format(sticker.readyTime, 'hh:mm a')}`, x + 2, y + 20);
      doc.text(`Consume By: ${sticker.date} at ${format(sticker.consumeByTime, 'hh:mm a')}`, x + 2, y + 23);
      
      // Contact
      doc.text('Contact us at: 88376467/31002206', x + 2, y + 27);

      // Move to next position
      currentCol++;
      if (currentCol >= cols) {
        currentCol = 0;
        currentRow++;
      }
    });

    // Download the PDF
    doc.save(`NEA-${mealType}-stickers-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-purple-600 hover:text-purple-700">
          <Sticker className="w-4 h-4 mr-2" />
          Generate NEA Stickers
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Generate NEA Compliance Stickers</DialogTitle>
          <DialogDescription>
            Generate food safety stickers for {mealType} orders with NEA compliance information.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Time Selection */}
          <div className="space-y-3">
            <Label htmlFor="start-time">Food Ready Time</Label>
            <div className="flex items-center space-x-3">
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-32"
              />
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Consume by: {calculateEndTime(startTime)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Consume by time is automatically calculated as 4 hours after ready time
            </p>
          </div>

          {/* Preview */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-3">Sticker Preview</h4>
              <div className="border border-gray-300 p-3 rounded text-xs space-y-1 bg-white">
                <div className="font-bold">[Customer Name]-[Bag Format]</div>
                <div className="font-bold text-red-600 text-sm">Driver: [Driver Name]</div>
                <div>SNAZ Catering Pte Ltd</div>
                <div>SFA License No: NW12957L000</div>
                <div>Food Ready To Eat: {format(new Date(), 'dd/MM/yyyy')} at {startTime}</div>
                <div>Consume By: {format(new Date(), 'dd/MM/yyyy')} at {calculateEndTime(startTime)}</div>
                <div>Contact us at: 88376467/31002206</div>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <div className="space-y-2">
            <Label>Orders Summary</Label>
            <div className="text-sm space-y-1">
              <div>Total Orders: {orderData.length}</div>
              <div>Unique Drivers: {Array.from(new Set(orderData.map(o => o.driverName))).filter(Boolean).length}</div>
              <div className="text-muted-foreground">
                One sticker will be generated per customer order
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={generateStickers} disabled={generating}>
              {generating ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </div>
              ) : (
                <div className="flex items-center">
                  <Download className="w-4 h-4 mr-2" />
                  Generate PDF
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}