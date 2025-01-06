const winston = require('winston');
const StabilityController = require('./StabilityController');
const prometheus = require('prometheus-client');
const StatsD = require('node-statsd');

class StabilityMonitor {
  constructor() {
    this.stability = new StabilityController();
    this.statsd = new StatsD();
    
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      defaultMeta: { service: 'stability-monitor' },
      transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
      ]
    });

    this.metrics = new prometheus.Registry();
    this.failureCounter = new prometheus.Counter({
      name: 'stability_failures_total',
      help: 'Total number of stability failures'
    });
    this.metrics.register(this.failureCounter);
  }

  async monitorService(serviceName) {
    try {
      const status = await this.stability.monitorService(serviceName);
      
      // Record metrics
      this.statsd.gauge(`stability.service.${serviceName}.health`, status.healthy ? 1 : 0);
      this.logger.info(`Service ${serviceName} health check`, status);

      if (!status.healthy) {
        this.failureCounter.inc();
        this.logger.error(`Service ${serviceName} unhealthy`, status);
      }

      return status;
    } catch (error) {
      this.logger.error(`Monitor error for ${serviceName}`, error);
      this.failureCounter.inc();
      throw error;
    }
  }

  getMetrics() {
    return this.metrics.metrics();
  }
}

module.exports = StabilityMonitor;