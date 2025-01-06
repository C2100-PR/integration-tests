const StabilityController = require('../stability/StabilityController');

class ServiceOrchestrator {
  constructor(options = {}) {
    this.services = new Map();
    this.stabilityController = new StabilityController(options);
    
    this.config = {
      maxServices: 100,
      cleanupInterval: 300000, // 5 minutes
      healthCheckInterval: 60000, // 1 minute
    };

    this.lastCleanup = Date.now();
    this.activeHealthChecks = new Set();
  }

  validateService(service) {
    if (!service || typeof service !== 'object') {
      throw new Error('Invalid service configuration');
    }
    const required = ['name', 'type', 'resources'];
    required.forEach(field => {
      if (!service[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    });
  }

  async registerService(service) {
    this.validateService(service);
    
    if (this.services.size >= this.config.maxServices) {
      throw new Error('Maximum service limit reached');
    }

    // Sanitize and validate resources
    const safeResources = {
      cpu: service.resources.cpu || '0.5',
      memory: service.resources.memory || '512Mi',
      storage: service.resources.storage || '1Gi',
      pods: service.resources.pods || 1
    };

    this.services.set(service.name, {
      ...service,
      resources: safeResources,
      registered: Date.now(),
      lastHealthCheck: null
    });

    await this.stabilityController.monitorService(service.name, safeResources);
    return { status: 'registered', name: service.name };
  }

  async startHealthChecks() {
    for (const [name, service] of this.services) {
      if (!this.activeHealthChecks.has(name)) {
        this.activeHealthChecks.add(name);
        this.scheduleHealthCheck(name, service);
      }
    }
  }

  async scheduleHealthCheck(name, service) {
    try {
      const health = await this.stabilityController.monitorService(name, service.resources);
      service.lastHealthCheck = Date.now();
      service.healthy = health.healthy;
      
      setTimeout(() => {
        if (this.services.has(name)) {
          this.scheduleHealthCheck(name, service);
        } else {
          this.activeHealthChecks.delete(name);
        }
      }, this.config.healthCheckInterval);

    } catch (error) {
      console.error(`Health check failed for ${name}`);
      service.healthy = false;
    }
  }

  cleanup() {
    const now = Date.now();
    if (now - this.lastCleanup >= this.config.cleanupInterval) {
      for (const [name, service] of this.services) {
        if (!service.healthy && service.lastHealthCheck && 
            now - service.lastHealthCheck > this.config.cleanupInterval) {
          this.services.delete(name);
          this.activeHealthChecks.delete(name);
        }
      }
      this.lastCleanup = now;
    }
  }

  async unregisterService(name) {
    if (!this.services.has(name)) {
      throw new Error('Service not found');
    }
    this.services.delete(name);
    this.activeHealthChecks.delete(name);
    return { status: 'unregistered', name };
  }

  getServiceStatus(name) {
    const service = this.services.get(name);
    if (!service) {
      throw new Error('Service not found');
    }
    return {
      name: service.name,
      type: service.type,
      healthy: service.healthy,
      lastHealthCheck: service.lastHealthCheck,
      resources: service.resources
    };
  }

  getAllServices() {
    this.cleanup();
    return Array.from(this.services.values()).map(service => ({
      name: service.name,
      type: service.type,
      healthy: service.healthy,
      resources: service.resources
    }));
  }
}

module.exports = ServiceOrchestrator;