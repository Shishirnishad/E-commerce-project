const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const config = require('../DB');
const Product = require('../product/product.model');

async function run() {
  try {
    if (!config.URL) {
      console.error('MONGODB_URL not set in environment (.env)');
      process.exit(1);
    }

    await mongoose.connect(config.URL, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const testPid = 9999;
    const doc = {
      pid: testPid,
      pname: 'AutomatedTestProduct',
      ppprice: 10,
      opprice: 20,
      ppicname: '',
      pcatgid: 1,
      vid: 1,
      status: 'Active',
      pdesc: 'Inserted by db_test_product.js'
    };

    const upsertRes = await Product.updateOne({ pid: testPid }, { $set: doc }, { upsert: true });
    console.log('Upsert result:', upsertRes);

    const found = await Product.findOne({ pid: testPid }).lean();
    console.log('Found product:', found);

    await mongoose.disconnect();
    console.log('Disconnected and done');
    process.exit(0);
  } catch (err) {
    console.error('Error in test script:', err);
    try { await mongoose.disconnect(); } catch(e){}
    process.exit(1);
  }
}

run();
