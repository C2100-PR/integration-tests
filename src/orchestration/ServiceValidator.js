const { ServiceTypes, ResourceLimits } = require('./ServiceTypes');

class ServiceValidator {
  static validateServiceType(type) {
    if (!Object.values(ServiceTypes).includes(type)) {
      throw new Error(`Invalid service type: ${type}`);
    }
  }

  static validateResources(type, resources) {
    const limits = ResourceLimits[type];
    if (!limits) {
      throw new Error(`No resource limits defined for type: ${type}`);
    }

    for (const [key, value] of Object.entries(resources)) {
      if (!this.isResourceWithinLimit(key, value, limits[key])) {
        throw new Error(`Resource ${key} exceeds limit for ${type}`);
      }
    }
  }

  static isResourceWithinLimit(key, value, limit) {
    if (key === 'pods') {
      return parseInt(value) <= parseInt(limit);
    }

    // Convert memory/storage strings to bytes for comparison
    const valueBytes = this.convertToBytes(value);
    const limitBytes = this.convertToBytes(limit);
    return valueBytes <= limitBytes;
  }

  static convertToBytes(value) {
    const match = value.match(/^(\d+(?:\.\d+)?)(Ki|Mi|Gi|Ti)?$/);
    if (!match) return parseInt(value);

    const [, num, unit] = match;
    const bytes = parseFloat(num);
    const multipliers = {
      Ki: 1024,
      Mi: 1024 ** 2,
      Gi: 1024 ** 3,
      Ti: 1024 ** 4
    };

    return bytes * (multipliers[unit] || 1);
  }

  static validateServiceConfig(config) {
    if (!config || typeof config !== 'object') {
      throw new Error('Invalid service configuration');
    }

    const required = ['name', 'type', 'resources'];
    required.forEach(field => {
      if (!config[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    });

    this.validateServiceType(config.type);
    this.validateResources(config.type, config.resources);

    if (!/^[a-zA-Z0-9-_.]+$/.test(config.name)) {
      throw new Error('Invalid service name format');
    }

    if (config.name.length > 255) {
      throw new Error('Service name too long');
    }
  }
}

module.exports = ServiceValidator;