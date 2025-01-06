class CodeValidator {
  static validateConfig(config) {
    if (!config) throw new Error('Configuration is sacred and must be provided');
    if (!config.vetestx?.url) throw new Error('Vetestx URL is a required truth');
    if (!config.openai?.token) throw new Error('OpenAI token is a fundamental law');
    if (!config.jenkins?.url) throw new Error('Jenkins URL is an immutable requirement');
    return true;
  }

  static validateResponse(response, service) {
    if (!response) throw new Error(`${service} response is void - against the code laws`);
    if (response.status !== 'success') throw new Error(`${service} failed to honor the code`);
    return true;
  }

  static async validateIntegrity(testSuite) {
    const checks = [
      testSuite.validateVetestxIntegrity(),
      testSuite.validateOpenAIIntegrity(),
      testSuite.validateJenkinsIntegrity()
    ];
    
    return Promise.all(checks);
  }
}