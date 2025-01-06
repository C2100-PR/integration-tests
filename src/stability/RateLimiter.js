class RateLimiter {
  constructor(options = {}) {
    this.maxRequests = options.maxRequests || 100;
    this.timeWindow = options.timeWindow || 60000; // 1 minute
    this.requests = new Map();
  }

  async checkLimit(serviceId) {
    this.cleanup();
    
    const now = Date.now();
    const serviceRequests = this.requests.get(serviceId) || [];
    
    // Remove old requests
    const validRequests = serviceRequests.filter(time => 
      now - time < this.timeWindow
    );

    if (validRequests.length >= this.maxRequests) {
      throw new Error(`Rate limit exceeded for ${serviceId}`);
    }

    // Add new request
    validRequests.push(now);
    this.requests.set(serviceId, validRequests);

    return {
      remaining: this.maxRequests - validRequests.length,
      reset: now + this.timeWindow
    };
  }

  cleanup() {
    const now = Date.now();
    for (const [serviceId, requests] of this.requests.entries()) {
      const validRequests = requests.filter(time => 
        now - time < this.timeWindow
      );
      if (validRequests.length === 0) {
        this.requests.delete(serviceId);
      } else {
        this.requests.set(serviceId, validRequests);
      }
    }
  }

  reset(serviceId) {
    this.requests.delete(serviceId);
  }
}

module.exports = RateLimiter;