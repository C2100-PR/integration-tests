class RetryHandler {
  constructor(options = {}) {
    this.maxRetries = options.maxRetries || 3;
    this.baseDelay = options.baseDelay || 1000;
    this.maxDelay = options.maxDelay || 30000;
    this.backoffMultiplier = options.backoffMultiplier || 2;
  }

  async executeWithRetry(operation) {
    let lastError;
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        const delay = Math.min(
          this.baseDelay * Math.pow(this.backoffMultiplier, attempt),
          this.maxDelay
        );
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw lastError;
  }
}

module.exports = RetryHandler;