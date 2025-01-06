class RateLimiter {
  constructor(options = {}) {
    this.maxRequests = options.maxRequests || 100;
    this.timeWindow = options.timeWindow || 60000; // 1 minute
    this.requests = new Map(); // timestamp -> count
  }

  async acquire() {
    this.cleanup();
    const now = Date.now();
    const currentCount = this.getCurrentRequestCount();

    if (currentCount >= this.maxRequests) {
      throw new Error('Rate limit exceeded');
    }

    this.requests.set(now, (this.requests.get(now) || 0) + 1);
  }

  getCurrentRequestCount() {
    let count = 0;
    for (const [timestamp, requestCount] of this.requests) {
      count += requestCount;
    }
    return count;
  }

  cleanup() {
    const cutoff = Date.now() - this.timeWindow;
    for (const [timestamp] of this.requests) {
      if (timestamp < cutoff) {
        this.requests.delete(timestamp);
      }
    }
  }
}

module.exports = RateLimiter;