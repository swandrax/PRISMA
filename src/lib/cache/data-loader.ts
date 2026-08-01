// DataLoader - Algorithmic Batching Engine for Eliminating N+1 Queries
// Collects concurrent single-key load requests within an execution cycle
// and consolidates them into a unified batch query using Hash Maps for O(1) correlation.

export type BatchLoadFunction<K, V> = (keys: readonly K[]) => Promise<Array<V | null | Error>>;

interface BatchRequest<K, V> {
  key: K;
  resolve: (value: V | null) => void;
  reject: (error: Error) => void;
}

/**
 * Generic DataLoader that debounces repetitive lookups and dispatches a unified batch operation.
 * Eliminates N+1 query latency across MVVM repositories and UI components.
 */
export class DataLoader<K, V> {
  private batchLoadFn: BatchLoadFunction<K, V>;
  private queue: Array<BatchRequest<K, V>> = [];
  private isBatchScheduled: boolean = false;
  private memoizedCache: Map<K, Promise<V | null>> = new Map();
  private maxBatchSize: number;

  constructor(batchLoadFn: BatchLoadFunction<K, V>, maxBatchSize: number = 100) {
    this.batchLoadFn = batchLoadFn;
    this.maxBatchSize = maxBatchSize;
  }

  /**
   * Request an item by key. Multiple concurrent calls in the same tick are aggregated.
   */
  async load(key: K): Promise<V | null> {
    if (key === null || key === undefined) {
      return null;
    }

    // Check memoized cache for immediate O(1) return without requeuing
    const cachedPromise = this.memoizedCache.get(key);
    if (cachedPromise !== undefined) {
      return cachedPromise;
    }

    const promise = new Promise<V | null>((resolve, reject) => {
      this.queue.push({ key, resolve, reject });
      if (!this.isBatchScheduled) {
        this.isBatchScheduled = true;
        // Schedule execution on the microtask queue
        Promise.resolve().then(() => this.dispatchBatch());
      }
    });

    this.memoizedCache.set(key, promise);
    return promise;
  }

  /**
   * Load multiple keys concurrently utilizing batching.
   */
  async loadMany(keys: readonly K[]): Promise<Array<V | null>> {
    return Promise.all(keys.map(key => this.load(key)));
  }

  /**
   * Purge key from internal memoization table.
   */
  clear(key: K): this {
    this.memoizedCache.delete(key);
    return this;
  }

  /**
   * Clear all cached keys in this loader instance.
   */
  clearAll(): this {
    this.memoizedCache.clear();
    return this;
  }

  /**
   * Prime the cache with an already-fetched key and value.
   */
  prime(key: K, value: V | null): this {
    if (!this.memoizedCache.has(key)) {
      this.memoizedCache.set(key, Promise.resolve(value));
    }
    return this;
  }

  /**
   * Internal execution algorithm: slices queued items into manageable batch chunks,
   * invokes the batch loader, and correlates responses via Hash Map O(1) lookups.
   */
  private async dispatchBatch(): Promise<void> {
    this.isBatchScheduled = false;
    if (this.queue.length === 0) return;

    const currentQueue = this.queue;
    this.queue = [];

    // Chunk by maxBatchSize if queue exceeds limits
    for (let i = 0; i < currentQueue.length; i += this.maxBatchSize) {
      const chunk = currentQueue.slice(i, i + this.maxBatchSize);
      this.processChunk(chunk);
    }
  }

  private async processChunk(chunk: Array<BatchRequest<K, V>>): Promise<void> {
    const keys = chunk.map(item => item.key);
    // Deduplicate requested keys for database efficiency
    const uniqueKeys = Array.from(new Set(keys));

    try {
      const results = await this.batchLoadFn(uniqueKeys);

      if (!Array.isArray(results) || results.length !== uniqueKeys.length) {
        throw new Error(
          `DataLoader batchLoadFn returned incorrect result length. Expected ${uniqueKeys.length}, got ${results?.length || 0}.`
        );
      }

      // Build Hash Map mapping Key -> Value in O(K) time
      const resultMap = new Map<K, V | null | Error>();
      for (let i = 0; i < uniqueKeys.length; i++) {
        resultMap.set(uniqueKeys[i], results[i] !== undefined ? results[i] : null);
      }

      // Distribute payloads back to requesting promises in O(1) per item
      for (const request of chunk) {
        const value = resultMap.get(request.key);
        if (value instanceof Error) {
          request.reject(value);
          this.memoizedCache.delete(request.key); // Don't cache rejected errors
        } else {
          request.resolve(value ?? null);
        }
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      for (const request of chunk) {
        request.reject(err);
        this.memoizedCache.delete(request.key);
      }
    }
  }
}
