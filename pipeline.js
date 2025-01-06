const axios = require('axios');
const config = require('./config.json');

async function runPipeline() {
  console.log('Starting integration pipeline...');
  try {
    // Execute tests
    const results = await executeTests();
    // Report results
    await reportResults(results);
    return results;
  } catch (error) {
    console.error('Pipeline failed:', error);
    throw error;
  }
}

module.exports = { runPipeline };