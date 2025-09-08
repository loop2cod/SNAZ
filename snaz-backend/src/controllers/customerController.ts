import { Request, Response } from 'express';
import Customer from '../models/Customer';
import { validationResult } from 'express-validator';

export const getAllCustomers = async (req: Request, res: Response) => {
  try {
    const customers = await Customer.find({ isActive: true })
      .populate('driverId', 'name route')
      .populate('packages.categoryId', 'name')
      .sort({ name: 1 });
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

    const { name, address, phone, email, driverId, packages, dailyFood, startDate, endDate } = req.body;
    
    const customer = new Customer({
      name,
      address,
      phone,
      email,
      driverId,
      packages,
      dailyFood,
      startDate,
      endDate
    });

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

    const { name, address, phone, email, driverId, packages, dailyFood, startDate, endDate, isActive } = req.body;
    
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { name, address, phone, email, driverId, packages, dailyFood, startDate, endDate, isActive },
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