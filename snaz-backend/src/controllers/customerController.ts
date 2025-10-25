import { Request, Response } from 'express';
import Customer from '../models/Customer';
import { validationResult } from 'express-validator';
import { CalculationEngine } from '../utils/calculationEngine';

export const getAllCustomers = async (req: Request, res: Response) => {
  try {
    const customers = await Customer.find({ isActive: true })
      .populate('driverId', 'name route')
      .populate('companyId', 'name address')
      .populate('packages.categoryId', 'name')
      .sort({ companyId: 1, name: 1 }); // Sort by company first, then name
    res.json({ success: true, data: customers });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate('driverId', 'name route')
      .populate('companyId', 'name')
      .populate('packages.categoryId', 'name');
      
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, data: customer });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getCustomersByDriver = async (req: Request, res: Response) => {
  try {
    const { driverId } = req.params;
    const customers = await Customer.find({ driverId, isActive: true })
      .populate('driverId', 'name route')
      .populate('packages.categoryId', 'name')
      .sort({ name: 1 });
    res.json({ success: true, data: customers });
  } catch (error) {
    console.error('Error fetching customers by driver:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, address, phone, email, companyId, driverId, packages, dailyFood, billingType, startDate, endDate } = req.body;
    
    // Auto-determine billingType if not provided
    const finalBillingType = billingType || (companyId ? 'company' : 'individual');
    
    const customerData: any = {
      name,
      address,
      phone,
      email,
      companyId: companyId || undefined,
      driverId,
      packages,
      billingType: finalBillingType,
      startDate,
      endDate
    };
    
    if (dailyFood) {
      customerData.dailyFood = dailyFood;
    }
    
    const customer = new Customer(customerData);

    const savedCustomer = await customer.save();
    await savedCustomer.populate('driverId', 'name route');
    await savedCustomer.populate('packages.categoryId', 'name');
    
    res.status(201).json({ success: true, data: savedCustomer });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, address, phone, email, companyId, driverId, packages, dailyFood, billingType, startDate, endDate, isActive } = req.body;
    
    // Auto-determine billingType if not provided
    const finalBillingType = billingType || (companyId ? 'company' : 'individual');
    
    const updateData: any = {
      name,
      address,
      phone,
      email,
      companyId: companyId || undefined,
      driverId,
      packages,
      billingType: finalBillingType,
      startDate,
      endDate,
      isActive
    };
    
    if (dailyFood) {
      updateData.dailyFood = dailyFood;
    }
    
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('driverId', 'name route')
     .populate('packages.categoryId', 'name');

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.json({ success: true, data: customer });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.json({ success: true, message: 'Customer deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating customer:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateCustomerDailyFood = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id } = req.params;
    const { lunch, dinner } = req.body as { lunch?: string; dinner?: string };

    const update: any = {};
    if (typeof lunch === 'string') {
      const v = CalculationEngine.validateAndParseBagFormat(lunch);
      if (!v.isValid && lunch.trim() !== '') {
        return res.status(400).json({ success: false, message: v.error || 'Invalid lunch format' });
      }
      update['dailyFood.lunch'] = lunch;
    }
    if (typeof dinner === 'string') {
      const v = CalculationEngine.validateAndParseBagFormat(dinner);
      if (!v.isValid && dinner.trim() !== '') {
        return res.status(400).json({ success: false, message: v.error || 'Invalid dinner format' });
      }
      update['dailyFood.dinner'] = dinner;
    }

    const customer = await Customer.findByIdAndUpdate(id, { $set: update }, { new: true })
      .populate('driverId', 'name route')
      .populate('packages.categoryId', 'name');

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.json({ success: true, data: customer });
  } catch (error) {
    console.error('Error updating daily food:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const bulkUpdateCustomerDailyFood = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { updates } = req.body as { updates: { customerId: string; mealType: 'lunch' | 'dinner'; bagFormat: string }[] };

    // Validate each bag format (allow empty to clear)
    for (const u of updates) {
      if (u.bagFormat && u.bagFormat.trim() !== '') {
        const v = CalculationEngine.validateAndParseBagFormat(u.bagFormat);
        if (!v.isValid) {
          return res.status(400).json({ success: false, message: `Invalid bag format for customer ${u.customerId}` });
        }
      }
    }

    const ops = updates.map(u => {
      const set: any = {};
      if (u.mealType === 'lunch') set['dailyFood.lunch'] = u.bagFormat;
      else set['dailyFood.dinner'] = u.bagFormat;
      return {
        updateOne: {
          filter: { _id: u.customerId },
          update: { $set: set }
        }
      } as any;
    });

    if (ops.length > 0) {
      await (Customer as any).bulkWrite(ops);
    }

    const ids = Array.from(new Set(updates.map(u => u.customerId)));
    const updated = await Customer.find({ _id: { $in: ids } })
      .populate('driverId', 'name route')
      .populate('packages.categoryId', 'name');

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error bulk updating daily food:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
