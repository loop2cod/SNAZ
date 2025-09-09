"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCompany = exports.updateCompany = exports.createCompany = exports.getCompanyCustomers = exports.getCompanyById = exports.getAllCompanies = void 0;
const models_1 = require("../models");
const express_validator_1 = require("express-validator");
const getAllCompanies = async (req, res) => {
    try {
        const companies = await models_1.Company.find({ isActive: true })
            .sort({ name: 1 });
        res.json({ success: true, data: companies });
    }
    catch (error) {
        console.error('Error fetching companies:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getAllCompanies = getAllCompanies;
const getCompanyById = async (req, res) => {
    try {
        const company = await models_1.Company.findById(req.params.id);
        if (!company) {
            return res.status(404).json({ success: false, message: 'Company not found' });
        }
        res.json({ success: true, data: company });
    }
    catch (error) {
        console.error('Error fetching company:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getCompanyById = getCompanyById;
const getCompanyCustomers = async (req, res) => {
    try {
        const { id } = req.params;
        // Verify company exists
        const company = await models_1.Company.findById(id);
        if (!company) {
            return res.status(404).json({ success: false, message: 'Company not found' });
        }
        // Get all customers for this company
        const customers = await models_1.Customer.find({
            companyId: id,
            isActive: true
        })
            .populate('driverId', 'name route')
            .populate('packages.categoryId', 'name')
            .sort({ name: 1 });
        res.json({ success: true, data: customers });
    }
    catch (error) {
        console.error('Error fetching company customers:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getCompanyCustomers = getCompanyCustomers;
const createCompany = async (req, res) => {
    try {
        // Check validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: errors.array()
            });
        }
        const { name, address, phone, email, contactPerson } = req.body;
        // Check if company with same name already exists
        const existingCompany = await models_1.Company.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        if (existingCompany) {
            return res.status(400).json({
                success: false,
                message: 'Company with this name already exists'
            });
        }
        const company = new models_1.Company({
            name,
            address,
            phone,
            email,
            contactPerson
        });
        await company.save();
        res.status(201).json({ success: true, data: company });
    }
    catch (error) {
        console.error('Error creating company:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.createCompany = createCompany;
const updateCompany = async (req, res) => {
    try {
        // Check validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: errors.array()
            });
        }
        const { name, address, phone, email, contactPerson, isActive } = req.body;
        // Check if another company with same name exists
        const existingCompany = await models_1.Company.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            _id: { $ne: req.params.id }
        });
        if (existingCompany) {
            return res.status(400).json({
                success: false,
                message: 'Company with this name already exists'
            });
        }
        const company = await models_1.Company.findByIdAndUpdate(req.params.id, {
            name,
            address,
            phone,
            email,
            contactPerson,
            isActive
        }, { new: true, runValidators: true });
        if (!company) {
            return res.status(404).json({ success: false, message: 'Company not found' });
        }
        res.json({ success: true, data: company });
    }
    catch (error) {
        console.error('Error updating company:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.updateCompany = updateCompany;
const deleteCompany = async (req, res) => {
    try {
        const company = await models_1.Company.findById(req.params.id);
        if (!company) {
            return res.status(404).json({ success: false, message: 'Company not found' });
        }
        // Check if company has customers
        const customerCount = await models_1.Customer.countDocuments({ companyId: req.params.id });
        if (customerCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete company. It has ${customerCount} associated customers. Please reassign or delete customers first.`
            });
        }
        await models_1.Company.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Company deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting company:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.deleteCompany = deleteCompany;
//# sourceMappingURL=companyController.js.map