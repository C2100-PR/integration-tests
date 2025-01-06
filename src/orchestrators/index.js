const BorgOrchestrator = require('./borg');

class OrchestratorFactory {
  static create(type, config) {
    switch(type) {
      case 'borg':
        return new BorgOrchestrator(config);
      default:
        throw new Error(`Unknown orchestrator type: ${type}`);
    }
  }
}

module.exports = OrchestratorFactory;