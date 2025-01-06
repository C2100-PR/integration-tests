class ResourceQuota {
  constructor(options = {}) {
    this.limits = {
      cpu: options.cpu || '2',
      memory: options.memory || '2Gi',
      storage: options.storage || '10Gi',
      pods: options.pods || 10
    };
    
    this.usage = {
      cpu: 0,
      memory: 0,
      storage: 0,
      pods: 0
    };
  }

  async allocate(resources) {
    // Convert resource strings to numbers for comparison
    const normalizedRequest = this.normalizeResources(resources);
    
    // Check if allocation would exceed limits
    for (const [resource, amount] of Object.entries(normalizedRequest)) {
      if (this.usage[resource] + amount > this.normalizeValue(this.limits[resource])) {
        throw new Error(`Resource quota exceeded for ${resource}`);
      }
    }

    // Update usage
    for (const [resource, amount] of Object.entries(normalizedRequest)) {
      this.usage[resource] += amount;
    }

    return true;
  }

  async deallocate(resources) {
    const normalizedRequest = this.normalizeResources(resources);
    
    for (const [resource, amount] of Object.entries(normalizedRequest)) {
      this.usage[resource] = Math.max(0, this.usage[resource] - amount);
    }
  }

  normalizeResources(resources) {
    const normalized = {};
    for (const [resource, value] of Object.entries(resources)) {
      normalized[resource] = this.normalizeValue(value);
    }
    return normalized;
  }

  normalizeValue(value) {
    if (typeof value === 'number') return value;
    
    // Handle CPU cores (e.g., '0.5', '2')
    if (value.match(/^\d*\.?\d+$/)) {
      return parseFloat(value);
    }

    // Handle memory/storage (e.g., '500Mi', '2Gi')
    const match = value.match(/^(\d+)([KMGTPkeimgt]i?)$/);
    if (match) {
      const [, num, unit] = match;
      const multipliers = {
        K: 1024,
        M: 1024 ** 2,
        G: 1024 ** 3,
        T: 1024 ** 4,
        P: 1024 ** 5
      };
      return parseInt(num) * multipliers[unit[0].toUpperCase()];
    }

    return parseFloat(value) || 0;
  }

  getCurrentUsage() {
    return { ...this.usage };
  }

  getLimits() {
    return { ...this.limits };
  }
}

module.exports = ResourceQuota;