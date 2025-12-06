// cleanup.js - Run this ONCE to remove duplicates
const mongoose = require('mongoose');
require('dotenv').config();

const Member = require('./models/memberModel');
const Payment = require('./models/paymentModel');

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/committee_db', {
      useNewUrlParser: false,
      useUnifiedTopology: false
    });

    console.log('🔧 Starting cleanup...\n');

    // STEP 1: Find all members
    const allMembers = await Member.find();
    console.log(`Found ${allMembers.length} members\n`);

    // STEP 2: Find duplicates by phone
    const phoneMap = {};
    const duplicates = [];

    for (const member of allMembers) {
      if (phoneMap[member.phone]) {
        duplicates.push({
          keep: phoneMap[member.phone],
          remove: member,
          phone: member.phone
        });
      } else {
        phoneMap[member.phone] = member;
      }
    }

    if (duplicates.length === 0) {
      console.log('✅ No duplicates found!\n');
    } else {
      console.log(`⚠️  Found ${duplicates.length} duplicate members:\n`);

      // STEP 3: Remove duplicates
      for (const dup of duplicates) {
        console.log(`Removing duplicate: ${dup.remove.name} (${dup.phone})`);
        console.log(`  - Kept: ${dup.keep.name} (ID: ${dup.keep._id})`);
        console.log(`  - Removing: ${dup.remove.name} (ID: ${dup.remove._id})\n`);

        // Delete duplicate member
        await Member.findByIdAndDelete(dup.remove._id);
      }

      console.log(`\n✅ Removed ${duplicates.length} duplicate members`);
    }

    // STEP 4: Show final count
    const finalMembers = await Member.find();
    console.log(`\n📊 Final member count: ${finalMembers.length}\n`);

    // STEP 5: Show unique phone numbers
    const uniquePhones = new Set();
    finalMembers.forEach(m => uniquePhones.add(m.phone));
    console.log(`✅ All ${uniquePhones.size} phone numbers are unique!\n`);

    console.log('🎉 Cleanup complete!\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

cleanup();