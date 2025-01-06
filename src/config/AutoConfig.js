class AutoConfig {
    constructor() {
        this.configSteps = [];
        this.currentStep = 0;
    }

    async configureStep(stepName, configFn) {
        try {
            console.log(`Starting configuration step: ${stepName}`);
            await configFn();
            this.currentStep++;
            console.log(`Completed step ${stepName}`);
            return true;
        } catch (error) {
            console.error(`Failed at step ${stepName}:`, error);
            return false;
        }
    }

    async runConfiguration() {
        for (let step of this.configSteps) {
            const success = await this.configureStep(step.name, step.fn);
            if (!success) break;
        }
    }
}

module.exports = AutoConfig;