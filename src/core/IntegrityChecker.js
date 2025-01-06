class IntegrityChecker {
  static async verifySystemIntegrity(systems) {
    const results = [];
    for (const system of systems) {
      const integrity = await this.checkIntegrity(system);
      results.push({
        system: system.name,
        status: integrity.status,
        timestamp: new Date().toISOString(),
        hash: this.generateIntegrityHash(integrity)
      });
    }
    return results;
  }

  static generateIntegrityHash(data) {
    return require('crypto')
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
  }
}