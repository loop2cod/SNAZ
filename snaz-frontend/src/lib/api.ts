const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface Driver {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
  route: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FoodCategory {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  _id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerPackage {
  categoryId: string | FoodCategory;
  unitPrice: number;
}

export interface Customer {
  _id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  companyId?: string | Company;
  driverId: string | Driver;
  packages: CustomerPackage[];
  dailyFood: {
    lunch: string;
    dinner: string;
  };
  startDate: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  _id?: string;
  customerId: string;
  categoryId: string;
  mealType: 'lunch' | 'dinner';
  bagFormat: string;
  nonVegCount: number;
  vegCount: number;
  totalCount: number;
  unitPrice: number;
  totalAmount: number;
}

export interface DailyOrder {
  _id: string;
  date: string;
  driverId: string | Driver;
  orders: OrderItem[];
  totalVegFood: number;
  totalNonVegFood: number;
  totalFood: number;
  totalAmount: number;
  neaStartTime: string;
  neaEndTime: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: any[];
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Drivers
  async getDrivers(): Promise<Driver[]> {
    const response = await this.request<Driver[]>('/drivers');
    return response.data;
  }

  async createDriver(driver: Partial<Driver>): Promise<Driver> {
    const response = await this.request<Driver>('/drivers', {
      method: 'POST',
      body: JSON.stringify(driver),
    });
    return response.data;
  }

  async updateDriver(id: string, driver: Partial<Driver>): Promise<Driver> {
    const response = await this.request<Driver>(`/drivers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(driver),
    });
    return response.data;
  }

  async deleteDriver(id: string): Promise<void> {
    await this.request(`/drivers/${id}`, {
      method: 'DELETE',
    });
  }

  // Food Categories
  async getFoodCategories(): Promise<FoodCategory[]> {
    const response = await this.request<FoodCategory[]>('/food-categories');
    return response.data;
  }

  async createFoodCategory(category: Partial<FoodCategory>): Promise<FoodCategory> {
    const response = await this.request<FoodCategory>('/food-categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
    return response.data;
  }

  async updateFoodCategory(id: string, category: Partial<FoodCategory>): Promise<FoodCategory> {
    const response = await this.request<FoodCategory>(`/food-categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category),
    });
    return response.data;
  }

  async deleteFoodCategory(id: string): Promise<void> {
    await this.request(`/food-categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Companies
  async getCompanies(): Promise<Company[]> {
    const response = await this.request<Company[]>('/companies');
    return response.data;
  }

  async getCompany(id: string): Promise<Company> {
    const response = await this.request<Company>(`/companies/${id}`);
    return response.data;
  }

  async createCompany(company: Partial<Company>): Promise<Company> {
    const response = await this.request<Company>('/companies', {
      method: 'POST',
      body: JSON.stringify(company),
    });
    return response.data;
  }

  async updateCompany(id: string, company: Partial<Company>): Promise<Company> {
    const response = await this.request<Company>(`/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(company),
    });
    return response.data;
  }

  async deleteCompany(id: string): Promise<void> {
    await this.request(`/companies/${id}`, {
      method: 'DELETE',
    });
  }

  async getCompanyCustomers(companyId: string): Promise<Customer[]> {
    const response = await this.request<Customer[]>(`/companies/${companyId}/customers`);
    return response.data;
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    const response = await this.request<Customer[]>('/customers');
    return response.data;
  }

  async getCustomer(id: string): Promise<Customer> {
    const response = await this.request<Customer>(`/customers/${id}`);
    return response.data;
  }

  async createCustomer(customer: Partial<Customer>): Promise<Customer> {
    const response = await this.request<Customer>('/customers', {
      method: 'POST',
      body: JSON.stringify(customer),
    });
    return response.data;
  }

  async updateCustomer(id: string, customer: Partial<Customer>): Promise<Customer> {
    const response = await this.request<Customer>(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customer),
    });
    return response.data;
  }

  async deleteCustomer(id: string): Promise<void> {
    await this.request(`/customers/${id}`, {
      method: 'DELETE',
    });
  }

  async updateCustomerDailyFood(id: string, dailyFood: { lunch?: string; dinner?: string }): Promise<Customer> {
    const response = await this.request<Customer>(`/customers/${id}/daily-food`, {
      method: 'PATCH',
      body: JSON.stringify(dailyFood),
    });
    return response.data;
  }

  async bulkUpdateCustomerDailyFood(updates: { customerId: string; mealType: 'lunch' | 'dinner'; bagFormat: string }[]): Promise<Customer[]> {
    const response = await this.request<Customer[]>('/customers/bulk-update-daily-food', {
      method: 'PATCH',
      body: JSON.stringify({ updates }),
    });
    return response.data;
  }

  // Daily Orders
  async getDailyOrders(params?: { date?: string; driverId?: string; startDate?: string; endDate?: string }): Promise<DailyOrder[]> {
    const queryString = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    const response = await this.request<DailyOrder[]>(`/daily-orders${queryString}`);
    return response.data;
  }

  async generateDailyOrders(data: { date: string; neaStartTime: string }): Promise<DailyOrder[]> {
    const response = await this.request<DailyOrder[]>('/daily-orders/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async updateOrderItem(
    orderId: string,
    orderItemId: string,
    data: { bagFormat: string }
  ): Promise<DailyOrder> {
    const response = await this.request<DailyOrder>(`/daily-orders/${orderId}/items/${orderItemId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async updateOrderStatus(orderId: string, status: string): Promise<DailyOrder> {
    const response = await this.request<DailyOrder>(`/daily-orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return response.data;
  }

  // Analytics
  async getDailyAnalytics(date: string) {
    const response = await this.request(`/analytics/daily?date=${date}`);
    return response.data;
  }

  async getRangeAnalytics(startDate: string, endDate: string) {
    const response = await this.request(`/analytics/range?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  }

  async validateBagFormat(bagFormat: string) {
    const response = await this.request('/analytics/validate-bag-format', {
      method: 'POST',
      body: JSON.stringify({ bagFormat }),
    });
    return response.data;
  }
}

export const apiClient = new ApiClient();