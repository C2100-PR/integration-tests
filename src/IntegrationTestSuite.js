const axios = require('axios');

class IntegrationTestSuite {
    constructor(config) {
        this.config = config;
        this.setupClients();
    }

    setupClients() {
        this.vetestxClient = axios.create({
            baseURL: this.config.vetestx.url,
            headers: { 'Authorization': `Bearer ${this.config.vetestx.token}` }
        });

        this.openaiClient = axios.create({
            baseURL: 'https://api.openai.com/v1',
            headers: { 'Authorization': `Bearer ${this.config.openai.token}` }
        });

        this.jenkinsClient = axios.create({
            baseURL: this.config.jenkins.url,
            auth: {
                username: this.config.jenkins.user,
                password: this.config.jenkins.token
            }
        });
    }

    async testVetestx() {
        try {
            console.log('Testing Vetestx connection...');
            const response = await this.vetestxClient.get('/health');
            return {
                status: 'success',
                service: 'Vetestx',
                response: response.data
            };
        } catch (error) {
            console.error('Vetestx test failed:', error.message);
            return {
                status: 'failed',
                service: 'Vetestx',
                error: error.message
            };
        }
    }

    async testOpenAI() {
        try {
            console.log('Testing OpenAI connection...');
            const response = await this.openaiClient.get('/models');
            return {
                status: 'success',
                service: 'OpenAI',
                response: response.data
            };
        } catch (error) {
            console.error('OpenAI test failed:', error.message);
            return {
                status: 'failed',
                service: 'OpenAI',
                error: error.message
            };
        }
    }

    async testJenkins() {
        try {
            console.log('Testing Jenkins connection...');
            const response = await this.jenkinsClient.get('/api/json');
            return {
                status: 'success',
                service: 'Jenkins',
                response: response.data
            };
        } catch (error) {
            console.error('Jenkins test failed:', error.message);
            return {
                status: 'failed',
                service: 'Jenkins',
                error: error.message
            };
        }
    }

    async runAllTests() {
        try {
            const results = await Promise.allSettled([
                this.testVetestx(),
                this.testOpenAI(),
                this.testJenkins()
            ]);

            const summary = {
                status: results.every(r => r.value?.status === 'success') ? 'success' : 'partial_failure',
                timestamp: new Date().toISOString(),
                results: {
                    vetestx: results[0].value,
                    openai: results[1].value,
                    jenkins: results[2].value
                }
            };

            console.log('Test Summary:', JSON.stringify(summary, null, 2));
            return summary;
        } catch (error) {
            console.error('Test suite failed:', error);
            return {
                status: 'failed',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
}

module.exports = IntegrationTestSuite;