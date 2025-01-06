const StabilityController = require('./stability/StabilityController');
const ResourceMonitor = require('./stability/ResourceMonitor');

class WorkflowOrchestrator {
  constructor(config) {
    if (!config) throw new Error('Config is required');
    this.config = config;
    this.services = ['vetestx', 'openai', 'jenkins', 'borg'];
    this.stabilityController = new StabilityController();
    this.resourceMonitor = new ResourceMonitor();
  }

  async orchestrateWorkflow() {
    console.log('Starting workflow orchestration with stability control...');
    
    try {
      // Check system stability before proceeding
      await this.checkSystemStability();
      
      // Initialize services with resource monitoring
      await this.initializeServices();
      
      // Run pipeline with circuit breaker protection
      await this.runPipeline();
      
      // Monitor services with stability control
      await this.monitorServices();
      
      return { status: 'success' };
    } catch (error) {
      console.error('Workflow failed:', error);
      return { status: 'failed', error: error.message };
    }
  }

  async checkSystemStability() {
    for (const service of this.services) {
      await this.stabilityController.monitorService(service);
      await this.resourceMonitor.checkResources(service);
    }
  }

  async initializeService(service) {
    console.log(`Initializing ${service} with stability controls...`);
    if (!this.config[service]) {
      throw new Error(`Missing config for ${service}`);
    }
    
    // Monitor stability during initialization
    await this.stabilityController.monitorService(service);
    return true;
  }

  async monitorService(service) {
    try {
      const stability = await this.stabilityController.monitorService(service);
      const resources = await this.resourceMonitor.checkResources(service);
      
      return {
        service,
        status: 'healthy',
        stability,
        resources
      };
    } catch (error) {
      return {
        service,
        status: 'error',
        error: error.message
      };
    }
  }

  // ... rest of the original methods ...
}

module.exports = WorkflowOrchestrator;