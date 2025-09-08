import { Request, Response } from 'express';
import Driver from '../models/Driver';
import { validationResult } from 'express-validator';

export const getAllDrivers = async (req: Request, res: Response) => {
  try {
    const drivers = await Driver.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, data: drivers });
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getDriverById = async (req: Request, res: Response) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.json({ success: true, data: driver });
  } catch (error) {
    console.error('Error fetching driver:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createDriver = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, phone, email, route } = req.body;
    
    const driver = new Driver({
      name,
      phone,
      email,
      route
    });

    const savedDriver = await driver.save();
    res.status(201).json({ success: true, data: savedDriver });
  } catch (error) {
    console.error('Error creating driver:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateDriver = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, phone, email, route, isActive } = req.body;
    
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { name, phone, email, route, isActive },
      { new: true, runValidators: true }
    );

    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    res.json({ success: true, data: driver });
  } catch (error) {
    console.error('Error updating driver:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteDriver = async (req: Request, res: Response) => {
  try {
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    res.json({ success: true, message: 'Driver deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating driver:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};