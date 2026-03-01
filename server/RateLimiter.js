/**
 * Robust Rate Limiter for managing strict API quotas (RPM/TPM).
 * Ensures requests are processed sequentially with a guaranteed minimum delay.
 */
export class RateLimiter {
  /**
   * @param {Object} options - Configuration options
   * @param {number} [options.rpm=3] - Requests per minute limit
   * @param {number} [options.bufferFactor=1.1] - Safety buffer multiplier for delay
   */
  constructor(options = {}) {
    const rpm = options.rpm || 3;
    const bufferFactor = options.bufferFactor || 1.1; // 10% safety margin
    
    // Calculate minimum delay between requests in milliseconds
    // Example: 3 RPM = 60000 / 3 = 20000ms delay
    // With buffer: 20000 * 1.1 = 22000ms
    this.minDelay = (60000 / rpm) * bufferFactor;
    
    this.lastRequestTime = 0;
    this.queue = [];
    this.isProcessing = false;
  }

  /**
   * Schedule a task to run within rate limits.
   * 
   * @template T
   * @param {() => Promise<T>} task - Async function to execute
   * @returns {Promise<T>} Promise resolving to the task result
   */
  async schedule(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.processQueue();
    });
  }

  /**
   * Internal queue processor.
   * Ensures only one request runs at a time and enforces the delay.
   * @private
   */
  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    try {
      while (this.queue.length > 0) {
        const item = this.queue[0]; // Peek at next item
        
        // Calculate required wait time
        const now = Date.now();
        const timeSinceLast = now - this.lastRequestTime;
        const waitTime = Math.max(0, this.minDelay - timeSinceLast);

        if (waitTime > 0) {
          console.log(`[RateLimiter] Throttling: Waiting ${(waitTime / 1000).toFixed(1)}s (Queue size: ${this.queue.length})`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        // Execute task
        // We shift *after* the wait to ensure the item stays in queue during the delay
        const { task, resolve, reject } = this.queue.shift();
        
        try {
          this.lastRequestTime = Date.now();
          const result = await task();
          resolve(result);
        } catch (error) {
          console.error('[RateLimiter] Task failed:', error.message);
          reject(error);
        }
      }
    } catch (criticalError) {
      console.error('[RateLimiter] Critical queue error:', criticalError);
    } finally {
      this.isProcessing = false;
      // Double check queue in case new items arrived while finishing up
      if (this.queue.length > 0) {
        this.processQueue();
      }
    }
  }

  /**
   * Get current queue status
   */
  getStatus() {
    return {
      queueLength: this.queue.length,
      isProcessing: this.isProcessing,
      timeSinceLastRequest: Date.now() - this.lastRequestTime
    };
  }
}
