import { Request, Response } from 'express';
import { Company, Customer } from '../models';
import { validationResult } from 'express-validator';

export const getAllCompanies = async (req: Request, res: Response) => {
  try {
    const companies = await Company.find({ isActive: true })
      .sort({ name: 1 });
    res.json({ success: true, data: companies });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getCompanyById = async (req: Request, res: Response) => {
  try {
    const company = await Company.findById(req.params.id);
      
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }
    res.json({ success: true, data: company });
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getCompanyCustomers = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verify company exists
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    // Get all customers for this company
    const customers = await Customer.find({ 
      companyId: id,
      isActive: true 
    })
      .populate('driverId', 'name route')
      .populate('packages.categoryId', 'name')
      .sort({ name: 1 });

    res.json({ success: true, data: customers });
  } catch (error) {
    console.error('Error fetching company customers:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createCompany = async (req: Request, res: Response) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        errors: errors.array() 
      });
    }

    const { name, address, phone, email, contactPerson } = req.body;
    
    // Check if company with same name already exists
    const existingCompany = await Company.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingCompany) {
      return res.status(400).json({ 
        success: false, 
        message: 'Company with this name already exists' 
      });
    }

    const company = new Company({
      name,
      address,
      phone,
      email,
      contactPerson
    });

    await company.save();
    res.status(201).json({ success: true, data: company });
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateCompany = async (req: Request, res: Response) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        errors: errors.array() 
      });
    }

    const { name, address, phone, email, contactPerson, isActive } = req.body;
    
    // Check if another company with same name exists
    const existingCompany = await Company.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      _id: { $ne: req.params.id }
    });
    if (existingCompany) {
      return res.status(400).json({ 
        success: false, 
        message: 'Company with this name already exists' 
      });
    }

    const company = await Company.findByIdAndUpdate(
      req.params.id,
      {
        name,
        address,
        phone,
        email,
        contactPerson,
        isActive
      },
      { new: true, runValidators: true }
    );

    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    res.json({ success: true, data: company });
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteCompany = async (req: Request, res: Response) => {
  try {
    const company = await Company.findById(req.params.id);
    
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    // Check if company has customers
    const customerCount = await Customer.countDocuments({ companyId: req.params.id });
    if (customerCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete company. It has ${customerCount} associated customers. Please reassign or delete customers first.` 
      });
    }

    await Company.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};