// backend/scripts/createAdmin.js - COMPLETE PRODUCTION READY
require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Admin = require('../models/adminModel');

console.log('🔧 Starting Admin Creation Script...');
console.log('📁 MongoDB URI:', process.env.MONGODB_URI);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/committee-system', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('✅ Connected to MongoDB successfully');
    createAdminUser();
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Create admin function
async function createAdminUser() {
  try {
    console.log('\n🔍 Checking for existing admin...');
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Username:', existingAdmin.username);
      console.log('👑 Role:', existingAdmin.role);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('\n💡 You can login with this username and your password.');
      console.log('🔐 If you forgot the password, delete this user and run the script again.\n');
      
      await mongoose.connection.close();
      process.exit(0);
    }

    console.log('📝 Creating new admin user...');

    // Create new admin
    const admin = await Admin.create({
      username: 'admin',
      email: 'admin@committee.com',
      password: 'Admin@123',
      role: 'superadmin'
    });

    console.log('\n✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', admin.email);
    console.log('👤 Username:', admin.username);
    console.log('🔑 Password: Admin@123');
    console.log('👑 Role:', admin.role);
    console.log('🆔 ID:', admin._id);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🎉 You can now login to the system!');
    console.log('🌐 Go to: http://localhost:3000/login');
    console.log('⚠️  IMPORTANT: Change the password after first login!\n');

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error creating admin:', error.message);
    console.error('📋 Full error:', error);
    
    await mongoose.connection.close();
    process.exit(1);
  }
}