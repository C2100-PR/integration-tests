const CircuitBreaker = require('./CircuitBreaker');
const RateLimiter = require('./RateLimiter');
const RetryHandler = require('./RetryHandler');
const ResourceQuota = require('./ResourceQuota');

class StabilityController {
  constructor(options = {}) {
    this.circuitBreakers = new Map();
    this.rateLimiters = new Map();
    this.retryHandler = new RetryHandler(options.retry);
    this.resourceQuota = new ResourceQuota(options.quota);
    
    this.config = {
      maxRetries: 3,
      backoffMultiplier: 1.5,
      failureThreshold: 5,
      resetTimeout: 30000,
      rateLimit: {
        maxRequests: 100,
        timeWindow: 60000
      },
      resourceLimits: {
        cpu: '2',
        memory: '2Gi',
        storage: '10Gi',
        pods: 10
      },
      maxServices: 1000 // Prevent memory exhaustion
    };

    // Initialize security measures
    this.lastCleanup = Date.now();
    this.cleanupInterval = 300000; // 5 minutes
  }

  validateServiceName(serviceName) {
    if (typeof serviceName !== 'string') {
      throw new Error('Invalid service name type');
    }
    if (serviceName.length > 255) {
      throw new Error('Service name too long');
    }
    if (!/^[a-zA-Z0-9-_.]+$/.test(serviceName)) {
      throw new Error('Invalid service name format');
    }
  }

  validateResources(resources) {
    if (!resources || typeof resources !== 'object') {
      throw new Error('Invalid resources format');
    }
    const validKeys = ['cpu', 'memory', 'storage', 'pods'];
    Object.keys(resources).forEach(key => {
      if (!validKeys.includes(key)) {
        throw new Error(`Invalid resource type: ${key}`);
      }
    });
  }

  cleanup() {
    const now = Date.now();
    if (now - this.lastCleanup >= this.cleanupInterval) {
      // Clean up old circuit breakers and rate limiters
      for (const [service, breaker] of this.circuitBreakers) {
        if (breaker.getState().state === 'CLOSED' && 
            breaker.getState().lastFailureTime && 
            now - breaker.getState().lastFailureTime > this.cleanupInterval) {
          this.circuitBreakers.delete(service);
        }
      }
      this.lastCleanup = now;
    }
  }

  getCircuitBreaker(serviceName) {
    this.validateServiceName(serviceName);
    this.cleanup();

    if (this.circuitBreakers.size >= this.config.maxServices) {
      throw new Error('Maximum service limit reached');
    }

    if (!this.circuitBreakers.has(serviceName)) {
      this.circuitBreakers.set(serviceName, new CircuitBreaker({
        failureThreshold: this.config.failureThreshold,
        resetTimeout: this.config.resetTimeout
      }));
    }
    return this.circuitBreakers.get(serviceName);
  }

  getRateLimiter(serviceName) {
    this.validateServiceName(serviceName);
    if (!this.rateLimiters.has(serviceName)) {
      if (this.rateLimiters.size >= this.config.maxServices) {
        throw new Error('Maximum service limit reached');
      }
      this.rateLimiters.set(serviceName, new RateLimiter(this.config.rateLimit));
    }
    return this.rateLimiters.get(serviceName);
  }

  async monitorService(serviceName, resources = {}) {
    this.validateServiceName(serviceName);
    this.validateResources(resources);
    
    const circuitBreaker = this.getCircuitBreaker(serviceName);
    const rateLimiter = this.getRateLimiter(serviceName);
    
    try {
      await rateLimiter.acquire();
      await this.resourceQuota.allocate(resources);
      
      return await this.retryHandler.executeWithRetry(async () => {
        return await circuitBreaker.execute(async () => {
          const health = await this.checkServiceHealth(serviceName);
          if (!health.healthy) {
            throw new Error('Service health check failed');
          }
          return health;
        });
      });
    } catch (error) {
      this.handleError(serviceName, error);
      // Sanitize error message
      throw new Error('Service monitoring failed');
    } finally {
      if (resources) {
        await this.resourceQuota.deallocate(resources);
      }
    }
  }

  async checkServiceHealth(serviceName) {
    // Implement actual health checks here
    return { healthy: true, metrics: this.getCurrentMetrics(serviceName) };
  }

  getCurrentMetrics(serviceName) {
    return {
      cpu: Math.random(),
      memory: Math.random() * 2,
      requestCount: Math.floor(Math.random() * 1000)
    };
  }

  handleError(serviceName, error) {
    // Sanitize error logging
    console.error(`Service monitoring error for ${serviceName}`);
  }

  getServiceState(serviceName) {
    this.validateServiceName(serviceName);
    const circuitBreaker = this.getCircuitBreaker(serviceName);
    return {
      ...circuitBreaker.getState(),
      metrics: this.getCurrentMetrics(serviceName),
      resourceUsage: this.resourceQuota.getCurrentUsage(),
      resourceLimits: this.resourceQuota.getLimits()
    };
  }
}

module.exports = StabilityController;