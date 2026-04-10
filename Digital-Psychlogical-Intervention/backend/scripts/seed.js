import mongoose from 'mongoose';
import dotenv from 'dotenv';
import College from '../models/College.js';
import User from '../models/User.js';

dotenv.config();

/**
 * Database Seeding Script
 * Creates default college and admin user if they don't exist
 */
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mental-health-platform');
    console.log('✅ Connected to MongoDB');

    // Check if college already exists
    let college = await College.findOne({ code: 'DEFAULT' });
    
    if (!college) {
      // Create default college
      college = await College.create({
        name: 'Default College',
        code: 'DEFAULT',
        description: 'Default college created by seeding script',
        isActive: true
      });
      console.log('✅ Created default college:', college.name);
    } else {
      console.log('ℹ️  Default college already exists:', college.name);
    }

    // Check if admin user already exists
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
      // Use plain password - User model's pre('save') hook will hash it (same as registration)
      const admin = await User.create({
        name: 'Admin User',
        email: 'admin@default.com',
        password: 'admin123',
        role: 'admin',
        collegeId: college._id,
        alias: 'Admin',
        isActive: true
      });
      console.log('✅ Created default admin user:', admin.email);
      console.log('   Password: admin123');
      console.log('   ⚠️  Please change this password after first login!');
    } else {
      console.log('ℹ️  Admin user already exists:', adminExists.email);
    }

    console.log('\n✅ Seeding completed successfully!');
    console.log('\n📝 Default Credentials:');
    console.log('   Email: admin@default.com');
    console.log('   Password: admin123');
    console.log('   College: Default College (DEFAULT)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

// Run seeding
seedDatabase();
