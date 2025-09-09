import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import connectDB from '../config/database';
import { User } from '../models';

dotenv.config();

const seedAdmin = async () => {
  try {
    console.log('🌱 Starting admin user seeding...');
    
    // Connect to database
    await connectDB();
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('❌ Admin user already exists. Skipping seed.');
      process.exit(0);
    }
    
    // Create default admin user
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('admin123', saltRounds);
    
    const adminUser = new User({
      username: 'admin',
      email: 'admin@snaz.com',
      password: hashedPassword,
      role: 'admin'
    });
    
    await adminUser.save();
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@snaz.com');
    console.log('🔑 Username: admin');
    console.log('🔒 Password: admin123');
    console.log('⚠️  Please change the default password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
    process.exit(1);
  }
};

// Run the seeder
seedAdmin();