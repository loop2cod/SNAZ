import * as XLSX from 'xlsx';
import { Driver, Customer, DailyOrder, FoodCategory } from './api';

export class ExcelExporter {
  
  /**
   * Export drivers data to Excel
   */
  static exportDrivers(drivers: Driver[], filename: string = 'drivers.xlsx') {
    const data = drivers.map(driver => ({
      'Name': driver.name,
      'Phone': driver.phone || '',
      'Email': driver.email || '',
      'Route': driver.route,
      'Status': driver.isActive ? 'Active' : 'Inactive',
      'Created Date': new Date(driver.createdAt).toLocaleDateString()
    }));

    this.downloadExcel(data, 'Drivers', filename);
  }

  /**
   * Export food categories to Excel
   */
  static exportFoodCategories(categories: FoodCategory[], filename: string = 'food-categories.xlsx') {
    const data = categories.map(category => ({
      'Name': category.name,
      'Description': category.description || '',
      'Status': category.isActive ? 'Active' : 'Inactive',
      'Created Date': new Date(category.createdAt).toLocaleDateString()
    }));

    this.downloadExcel(data, 'Food Categories', filename);
  }

  /**
   * Export customers data to Excel
   */
  static exportCustomers(customers: Customer[], filename: string = 'customers.xlsx') {
    const data = customers.map(customer => {
      const driverName = typeof customer.driverId === 'object' ? customer.driverId.name : 'Unknown';
      const packages = customer.packages.map(pkg => {
        const categoryName = typeof pkg.categoryId === 'object' ? pkg.categoryId.name : 'Unknown';
        return `${categoryName}: $${pkg.unitPrice}`;
      }).join(', ');

      return {
        'Name': customer.name,
        'Address': customer.address,
        'Phone': customer.phone || '',
        'Email': customer.email || '',
        'Driver': driverName,
        'Packages': packages,
        'Lunch Format': customer.dailyFood?.lunch || '',
        'Dinner Format': customer.dailyFood?.dinner || '',
        'Start Date': new Date(customer.startDate).toLocaleDateString(),
        'End Date': customer.endDate ? new Date(customer.endDate).toLocaleDateString() : '',
        'Status': customer.isActive ? 'Active' : 'Inactive',
        'Created Date': new Date(customer.createdAt).toLocaleDateString()
      };
    });

    this.downloadExcel(data, 'Customers', filename);
  }

  /**
   * Export daily orders to Excel
   */
  static exportDailyOrders(orders: DailyOrder[], mealType?: string, filename?: string) {
    if (!filename) {
      const date = orders.length > 0 ? new Date(orders[0].date).toISOString().split('T')[0] : 'daily-orders';
      const mealPrefix = mealType ? `${mealType}-` : '';
      filename = `${mealPrefix}orders-${date}.xlsx`;
    }

    // Summary sheet
    const summaryData = orders.map(order => {
      const driverName = typeof order.driverId === 'object' ? order.driverId.name : 'Unknown';
      
      return {
        'Date': new Date(order.date).toLocaleDateString(),
        'Driver': driverName,
        'Total Veg Food': order.totalVegFood,
        'Total Non-Veg Food': order.totalNonVegFood,
        'Total Food Items': order.totalFood,
        'Total Amount': order.totalAmount,
        'NEA Start Time': new Date(order.neaStartTime).toLocaleTimeString(),
        'NEA End Time': new Date(order.neaEndTime).toLocaleTimeString(),
        'Status': order.status.toUpperCase(),
        'Customer Count': new Set(order.orders.map(o => o.customerId)).size
      };
    });

    // Detailed items sheet
    const itemsData: any[] = [];
    orders.forEach(order => {
      const driverName = typeof order.driverId === 'object' ? order.driverId.name : 'Unknown';
      
      order.orders.forEach(item => {
        const customerName = typeof item.customerId === 'object' ? (item.customerId as any).name : 'Unknown';
        const categoryName = typeof item.categoryId === 'object' ? (item.categoryId as any).name : 'Unknown';
        
        itemsData.push({
          'Date': new Date(order.date).toLocaleDateString(),
          'Driver': driverName,
          'Customer': customerName,
          'Category': categoryName,
          'Meal Type': item.mealType.toUpperCase(),
          'Bag Format': item.bagFormat,
          'Non-Veg Count': item.nonVegCount,
          'Veg Count': item.vegCount,
          'Total Count': item.totalCount,
          'Unit Price': item.unitPrice,
          'Total Amount': item.totalAmount
        });
      });
    });

    this.downloadExcelMultiSheet({
      'Summary': summaryData,
      'Order Items': itemsData
    }, filename);
  }

  /**
   * Export analytics data to Excel
   */
  static exportAnalytics(
    summary: any,
    driverBreakdown: any[],
    dateRange: { startDate: string; endDate: string },
    filename?: string
  ) {
    if (!filename) {
      filename = `analytics-${dateRange.startDate}-to-${dateRange.endDate}.xlsx`;
    }

    // Summary data
    const summaryData = [{
      'Metric': 'Total Orders',
      'Value': summary.totalOrders
    }, {
      'Metric': 'Total Food Items',
      'Value': summary.totalFood
    }, {
      'Metric': 'Total Veg Food',
      'Value': summary.totalVegFood
    }, {
      'Metric': 'Total Non-Veg Food',
      'Value': summary.totalNonVegFood
    }, {
      'Metric': 'Total Revenue',
      'Value': summary.totalRevenue
    }, {
      'Metric': 'Average Order Value',
      'Value': Math.round(summary.averageOrderValue || 0)
    }, {
      'Metric': 'Date Range',
      'Value': `${dateRange.startDate} to ${dateRange.endDate}`
    }];

    // Driver breakdown
    const driverData = driverBreakdown.map(driver => ({
      'Driver Name': driver.driverName,
      'Route': driver.route,
      'Total Orders': driver.totalOrders,
      'Total Food Items': driver.totalFood,
      'Veg Food': driver.totalVegFood,
      'Non-Veg Food': driver.totalNonVegFood,
      'Total Revenue': driver.totalRevenue,
      'Average Order Value': Math.round(driver.totalRevenue / driver.totalOrders)
    }));

    this.downloadExcelMultiSheet({
      'Summary': summaryData,
      'Driver Performance': driverData
    }, filename);
  }

  /**
   * Download single sheet Excel file
   */
  private static downloadExcel(data: any[], sheetName: string, filename: string) {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Auto-fit columns
    const cols = Object.keys(data[0] || {}).map(() => ({ wch: 20 }));
    worksheet['!cols'] = cols;

    XLSX.writeFile(workbook, filename);
  }

  /**
   * Download multi-sheet Excel file
   */
  private static downloadExcelMultiSheet(sheets: { [sheetName: string]: any[] }, filename: string) {
    const workbook = XLSX.utils.book_new();

    Object.entries(sheets).forEach(([sheetName, data]) => {
      if (data.length > 0) {
        const worksheet = XLSX.utils.json_to_sheet(data);
        
        // Auto-fit columns
        const cols = Object.keys(data[0]).map(() => ({ wch: 15 }));
        worksheet['!cols'] = cols;
        
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      }
    });

    XLSX.writeFile(workbook, filename);
  }

  /**
   * Export bag format analysis
   */
  static exportBagFormatAnalysis(data: any[], filename: string = 'bag-format-analysis.xlsx') {
    this.downloadExcel(data, 'Bag Format Analysis', filename);
  }

  /**
   * Generate customer monthly report Excel
   */
  static exportCustomerMonthlyReport(
    customer: Customer,
    monthlyData: any,
    filename?: string
  ) {
    if (!filename) {
      const customerName = customer.name.replace(/[^a-zA-Z0-9]/g, '-');
      const month = new Date(monthlyData.startDate).toISOString().slice(0, 7);
      filename = `${customerName}-monthly-report-${month}.xlsx`;
    }

    // Customer info
    const customerInfo = [{
      'Field': 'Customer Name',
      'Value': customer.name
    }, {
      'Field': 'Address',
      'Value': customer.address
    }, {
      'Field': 'Phone',
      'Value': customer.phone || ''
    }, {
      'Field': 'Email',
      'Value': customer.email || ''
    }, {
      'Field': 'Period',
      'Value': `${new Date(monthlyData.startDate).toLocaleDateString()} - ${new Date(monthlyData.endDate).toLocaleDateString()}`
    }, {
      'Field': 'Total Days',
      'Value': monthlyData.totalDays
    }, {
      'Field': 'Total Food Items',
      'Value': monthlyData.totalFood
    }, {
      'Field': 'Veg Food',
      'Value': monthlyData.totalVegFood
    }, {
      'Field': 'Non-Veg Food',
      'Value': monthlyData.totalNonVegFood
    }, {
      'Field': 'Subtotal',
      'Value': monthlyData.subtotal
    }, {
      'Field': 'Tax',
      'Value': monthlyData.tax
    }, {
      'Field': 'Total Amount',
      'Value': monthlyData.totalAmount
    }];

    // Package breakdown
    const packageData = monthlyData.packageBreakdown.map((pkg: any) => ({
      'Category': pkg.categoryName,
      'Unit Price': pkg.unitPrice,
      'Total Quantity': pkg.totalQuantity,
      'Total Amount': pkg.totalAmount
    }));

    this.downloadExcelMultiSheet({
      'Customer Info': customerInfo,
      'Package Breakdown': packageData
    }, filename);
  }
}