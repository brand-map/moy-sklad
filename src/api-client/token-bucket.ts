// token-bucket.ts
export class TokenBucket {
  private capacity: number // max tokens per window
  private tokens: number // currently available tokens
  private windowDuration: number // in seconds (3)
  private lastRefill: number // timestamp in seconds
  private nextReset: number // known server reset timestamp (seconds)
  private mutex: Promise<void> = Promise.resolve()

  constructor(capacity: number, windowDuration = 3) {
    this.capacity = capacity
    this.tokens = capacity
    this.windowDuration = windowDuration
    this.lastRefill = Math.floor(Date.now() / 1000)
    this.nextReset = this.lastRefill + windowDuration
  }

  // Synchronise with server headers
  sync(serverRemaining: number, serverReset: number) {
    const now = Math.floor(Date.now() / 1000)
    this.nextReset = serverReset
    // If we are past the reset, the server has already refilled
    if (now >= serverReset) {
      this.tokens = this.capacity
      this.lastRefill = serverReset // new window started then
    } else {
      // Still inside the same window: use server's remaining as ground truth
      this.tokens = serverRemaining
      this.lastRefill = serverReset - this.windowDuration
    }
  }

  // Refill tokens based on elapsed time (continuous refill)
  private refill() {
    const now = Math.floor(Date.now() / 1000)
    if (now <= this.lastRefill) return
    // How many seconds passed since last refill?
    const elapsed = now - this.lastRefill
    // How many whole windows have passed? (usually zero unless we missed a reset)
    const windowsPassed = Math.floor(elapsed / this.windowDuration)
    if (windowsPassed > 0) {
      // If we missed multiple windows, just refill to full capacity (safer)
      this.tokens = this.capacity
      this.lastRefill = this.lastRefill + windowsPassed * this.windowDuration
    } else {
      // Partial refill within current window
      const refill = (elapsed / this.windowDuration) * this.capacity
      this.tokens = Math.min(this.capacity, this.tokens + refill)
      // lastRefill stays the same – we only move it on whole windows
    }
  }

  // Try to consume `weight` tokens, waiting if necessary
  async consume(weight: number): Promise<void> {
    // Use a mutex to serialise consumption decisions
    let release: () => void
    const waitForMutex = new Promise<void>((resolve) => {
      release = resolve
    })
    const previous = this.mutex
    this.mutex = this.mutex.then(() => waitForMutex)

    await previous // wait for previous consumer to finish

    try {
      while (true) {
        this.refill()
        if (this.tokens >= weight) {
          this.tokens -= weight
          return
        }
        // Not enough tokens – wait until the next reset or a reasonable time
        const now = Math.floor(Date.now() / 1000)
        const waitUntil = Math.min(this.nextReset, this.lastRefill + this.windowDuration)
        const delayMs = (waitUntil - now) * 1000 + 50 // 50ms safety margin
        await new Promise((r) => setTimeout(r, delayMs))
      }
    } finally {
      release!()
    }
  }
}
