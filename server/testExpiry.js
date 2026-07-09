require('dotenv').config();
const mongoose = require('mongoose');


mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('Connected to MongoDB');
  const { runExpiryCheck } = require('./src/utils/expiryChecker');
  await runExpiryCheck();
  console.log('Done!');
  process.exit(0);
}); 