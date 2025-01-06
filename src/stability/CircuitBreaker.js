class CircuitBreaker {
    constructor(options = {}) {
        this.failureThreshold = options.failureThreshold || 5;
        this.resetTimeout = options.resetTimeout || 60000; // 1 minute
        this.failures = 0;
        this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
        this.lastFailureTime = null;
    }

    async execute(command) {
        if (this.state === 'OPEN') {
            if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
                this.state = 'HALF_OPEN';
            } else {
                throw new Error('Circuit breaker is OPEN');
            }
        }

        try {
            const result = await command();
            if (this.state === 'HALF_OPEN') {
                this.reset();
            }
            return result;
        } catch (error) {
            this.recordFailure();
            throw error;
        }
    }

    recordFailure() {
        this.failures++;
        this.lastFailureTime = Date.now();
        
        if (this.failures >= this.failureThreshold) {
            this.state = 'OPEN';
        }
    }

    reset() {
        this.failures = 0;
        this.state = 'CLOSED';
        this.lastFailureTime = null;
    }

    getState() {
        return {
            state: this.state,
            failures: this.failures,
            lastFailureTime: this.lastFailureTime
        };
    }
}

module.exports = CircuitBreaker;