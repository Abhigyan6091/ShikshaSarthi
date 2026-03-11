const mongoose = require('mongoose');
require('dotenv').config();
const MATQuestion = require('./models/MATQuestion');
const MATTest = require('./models/MATTest');
const MATProgress = require('./models/MATProgress');

const deleteAllMATData = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB successfully\n');

    console.log('🗑️  Deleting all MAT Questions...');
    const questionsResult = await MATQuestion.deleteMany({});
    console.log(`✅ Deleted ${questionsResult.deletedCount} MAT Questions\n`);

    console.log('🗑️  Deleting all MAT Tests...');
    const testsResult = await MATTest.deleteMany({});
    console.log(`✅ Deleted ${testsResult.deletedCount} MAT Tests\n`);

    console.log('🗑️  Deleting all MAT Progress...');
    const progressResult = await MATProgress.deleteMany({});
    console.log(`✅ Deleted ${progressResult.deletedCount} MAT Progress records\n`);

    console.log('✨ Deletion completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

deleteAllMATData();
