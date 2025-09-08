"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDriver = exports.updateDriver = exports.createDriver = exports.getDriverById = exports.getAllDrivers = void 0;
const Driver_1 = __importDefault(require("../models/Driver"));
const express_validator_1 = require("express-validator");
const getAllDrivers = async (req, res) => {
    try {
        const drivers = await Driver_1.default.find({ isActive: true }).sort({ name: 1 });
        res.json({ success: true, data: drivers });
    }
    catch (error) {
        console.error('Error fetching drivers:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getAllDrivers = getAllDrivers;
const getDriverById = async (req, res) => {
    try {
        const driver = await Driver_1.default.findById(req.params.id);
        if (!driver) {
            return res.status(404).json({ success: false, message: 'Driver not found' });
        }
        res.json({ success: true, data: driver });
    }
    catch (error) {
        console.error('Error fetching driver:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getDriverById = getDriverById;
const createDriver = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        const { name, phone, email, route } = req.body;
        const driver = new Driver_1.default({
            name,
            phone,
            email,
            route
        });
        const savedDriver = await driver.save();
        res.status(201).json({ success: true, data: savedDriver });
    }
    catch (error) {
        console.error('Error creating driver:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.createDriver = createDriver;
const updateDriver = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        const { name, phone, email, route, isActive } = req.body;
        const driver = await Driver_1.default.findByIdAndUpdate(req.params.id, { name, phone, email, route, isActive }, { new: true, runValidators: true });
        if (!driver) {
            return res.status(404).json({ success: false, message: 'Driver not found' });
        }
        res.json({ success: true, data: driver });
    }
    catch (error) {
        console.error('Error updating driver:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.updateDriver = updateDriver;
const deleteDriver = async (req, res) => {
    try {
        const driver = await Driver_1.default.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!driver) {
            return res.status(404).json({ success: false, message: 'Driver not found' });
        }
        res.json({ success: true, message: 'Driver deactivated successfully' });
    }
    catch (error) {
        console.error('Error deactivating driver:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.deleteDriver = deleteDriver;
//# sourceMappingURL=driverController.js.map