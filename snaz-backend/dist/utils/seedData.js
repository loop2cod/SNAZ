"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
const database_1 = __importDefault(require("../config/database"));
const seedData = async () => {
    try {
        await (0, database_1.default)();
        // Clear existing data
        await models_1.Driver.deleteMany({});
        await models_1.FoodCategory.deleteMany({});
        await models_1.Customer.deleteMany({});
        console.log('Cleared existing data...');
        // Seed Food Categories
        const categories = await models_1.FoodCategory.insertMany([
            { name: 'Normal', description: 'Regular meals' },
            { name: 'Special', description: 'Special meals with additional items' },
            { name: 'Premium', description: 'Premium meals with extra variety' }
        ]);
        console.log('Food categories seeded...');
        // Seed Drivers
        const drivers = await models_1.Driver.insertMany([
            { name: 'John Driver', phone: '1234567890', route: 'Downtown Area' },
            { name: 'Mike Delivery', phone: '0987654321', route: 'Suburban Area' },
            { name: 'Sarah Transport', phone: '5555555555', route: 'Industrial Zone' }
        ]);
        console.log('Drivers seeded...');
        // Seed Customers
        const customers = await models_1.Customer.insertMany([
            {
                name: 'ABC Corporation',
                address: '123 Business St, Downtown',
                phone: '1111111111',
                email: 'orders@abccorp.com',
                driverId: drivers[0]._id,
                packages: [
                    { categoryId: categories[0]._id, unitPrice: 50 },
                    { categoryId: categories[1]._id, unitPrice: 75 }
                ],
                dailyFood: {
                    lunch: '5,5+7',
                    dinner: '3+5'
                },
                startDate: new Date('2024-01-01')
            },
            {
                name: 'XYZ Tech Solutions',
                address: '456 Tech Park, Suburban',
                phone: '2222222222',
                email: 'food@xyztech.com',
                driverId: drivers[1]._id,
                packages: [
                    { categoryId: categories[1]._id, unitPrice: 80 },
                    { categoryId: categories[2]._id, unitPrice: 120 }
                ],
                dailyFood: {
                    lunch: '10+15',
                    dinner: '8+10'
                },
                startDate: new Date('2024-01-15')
            },
            {
                name: 'Manufacturing Ltd',
                address: '789 Factory Rd, Industrial Zone',
                phone: '3333333333',
                driverId: drivers[2]._id,
                packages: [
                    { categoryId: categories[0]._id, unitPrice: 45 }
                ],
                dailyFood: {
                    lunch: '20+25',
                    dinner: '15+20'
                },
                startDate: new Date('2024-02-01')
            }
        ]);
        console.log('Customers seeded...');
        console.log('Database seeded successfully!');
        process.exit(0);
    }
    catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};
// Run if called directly
if (require.main === module) {
    seedData();
}
exports.default = seedData;
//# sourceMappingURL=seedData.js.map