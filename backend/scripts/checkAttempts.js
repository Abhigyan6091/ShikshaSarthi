const mongoose = require('mongoose');
const path = require('path');
const ExperimentAttempt = require('../models/ExperimentAttempt');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    const attempts = await ExperimentAttempt.find({});
    console.log(`Found ${attempts.length} attempts:`);
    console.log(JSON.stringify(attempts, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
