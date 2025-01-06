class CircuitBreaker {
  constructor(settings = {}) {
    this.settings = {
      failureThreshold: settings.failureThreshold || 5,
      resetTimeout: settings.resetTimeout || 60000,
      monitorInterval: settings.monitorInterval || 5000
    };
    
    this.state = 'CLOSED';
    this.failures = 0;
    this.lastFailureTime = null;
  }

  async execute(operation) {
    if (this.state === 'OPEN') {
      if (this.shouldReset()) {
        this.halfOpen();
      } else {
        throw new Error('Circuit is OPEN');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error);
      throw error;
    }
  }

  onSuccess() {
    this.failures = 0;
    if (this.state === 'HALF-OPEN') {
      this.close();
    }
  }

  onFailure(error) {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.settings.failureThreshold) {
      this.open();
    }
  }

  open() {
    this.state = 'OPEN';
    console.log('Circuit OPENED due to failures');
  }

  halfOpen() {
    this.state = 'HALF-OPEN';
    console.log('Circuit HALF-OPEN, testing service');
  }

  close() {
    this.state = 'CLOSED';
    this.failures = 0;
    console.log('Circuit CLOSED, service recovered');
  }

  shouldReset() {
    return Date.now() - this.lastFailureTime >= this.settings.resetTimeout;
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailure: this.lastFailureTime
    };
  }
}

module.exports = CircuitBreaker;