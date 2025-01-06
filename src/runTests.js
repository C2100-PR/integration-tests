const IntegrationTestSuite = require('./IntegrationTestSuite');

const config = {
    vetestx: {
        url: process.env.VETESTX_URL || 'http://vetestx-api',
        token: process.env.VETESTX_TOKEN || 'test-token'
    },
    openai: {
        token: process.env.OPENAI_TOKEN || 'test-token'
    },
    jenkins: {
        url: process.env.JENKINS_URL || 'http://jenkins',
        user: process.env.JENKINS_USER || 'test-user',
        token: process.env.JENKINS_TOKEN || 'test-token'
    }
};

const testSuite = new IntegrationTestSuite(config);

async function runTests() {
    console.log('Starting integration tests...');
    const results = await testSuite.runAllTests();
    console.log('Test Results:', JSON.stringify(results, null, 2));
}

runTests().catch(console.error);