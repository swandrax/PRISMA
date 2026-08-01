// Jest / Vitest Unit Test Suite for Redis Caching & O(1) LRU Algorithms
// Analogous to JUnit testing architectures with explicit verification of algorithmic properties and TTL behaviors.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MemoryLruCacheProvider, RedisCacheService, getCacheService } from './redis-cache';

describe('MemoryLruCacheProvider (O(1) LRU Algorithmic Caching)', () => {
  let cache: MemoryLruCacheProvider;

  beforeEach(() => {
    cache = new MemoryLruCacheProvider(3); // Small capacity of 3 to explicitly verify eviction logic
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should store and retrieve values in O(1) time', async () => {
    await cache.set('user:101', { name: 'Budi', role: 'Ketua RT' });
    const result = await cache.get<{ name: string; role: string }>('user:101');

    expect(result).not.toBeNull();
    expect(result?.name).toBe('Budi');
    expect(result?.role).toBe('Ketua RT');
  });

  it('should return null for non-existent cache keys (cache miss telemetry)', async () => {
    const result = await cache.get('non_existent_key');
    expect(result).toBeNull();

    const stats = cache.getStats();
    expect(stats.misses).toBe(1);
    expect(stats.hits).toBe(0);
  });

  it('should enforce O(1) LRU eviction when capacity is exceeded', async () => {
    // Insert 3 items (max capacity)
    await cache.set('item:1', 'Value 1');
    await cache.set('item:2', 'Value 2');
    await cache.set('item:3', 'Value 3');

    // Access item:1 so it becomes the Most Recently Used (MRU)
    await cache.get('item:1');

    // Inserting item:4 should trigger eviction of item:2 (now the Least Recently Used)
    await cache.set('item:4', 'Value 4');

    expect(await cache.get('item:2')).toBeNull(); // Evicted
    expect(await cache.get('item:1')).toBe('Value 1'); // Preserved due to MRU promotion
    expect(await cache.get('item:3')).toBe('Value 3');
    expect(await cache.get('item:4')).toBe('Value 4');

    const stats = cache.getStats();
    expect(stats.evictions).toBe(1);
    expect(stats.size).toBe(3);
  });

  it('should invalidate cached entries automatically after TTL expiration', async () => {
    const ttlSeconds = 5;
    await cache.set('temp:token', 'secret-token', ttlSeconds);

    // Fast-forward time by 4 seconds (should still be valid)
    vi.advanceTimersByTime(4000);
    expect(await cache.get('temp:token')).toBe('secret-token');

    // Fast-forward by another 2 seconds (exceeding 5s TTL)
    vi.advanceTimersByTime(2000);
    expect(await cache.get('temp:token')).toBeNull();
  });

  it('should support glob pattern invalidation for relational updates', async () => {
    await cache.set('warga:101', 'Data 101');
    await cache.set('warga:102', 'Data 102');
    await cache.set('keuangan:jan-2026', 'Report Jan');

    // Invalidate all 'warga:*' keys
    const deletedCount = await cache.invalidatePattern('warga:*');

    expect(deletedCount).toBe(2);
    expect(await cache.get('warga:101')).toBeNull();
    expect(await cache.get('warga:102')).toBeNull();
    expect(await cache.get('keuangan:jan-2026')).toBe('Report Jan'); // Untouched
  });

  it('should calculate accurate hit rate telemetry', async () => {
    await cache.set('hit_test', 'success');
    await cache.get('hit_test'); // hit 1
    await cache.get('hit_test'); // hit 2
    await cache.get('miss_test'); // miss 1
    await cache.get('miss_test'); // miss 2

    const stats = cache.getStats();
    expect(stats.hits).toBe(2);
    expect(stats.misses).toBe(2);
    expect(stats.hitRate).toBe(0.5); // 50% hit rate
  });
});

describe('RedisCacheService (Singleton & Fallback Validation)', () => {
  it('should furnish a robust global singleton instance', async () => {
    const service1 = getCacheService();
    const service2 = getCacheService();
    expect(service1).toBe(service2);
  });

  it('should seamlessly process caching commands via active provider', async () => {
    const service = new RedisCacheService(500);
    await service.set('test:service', { ok: true }, 60);
    const cached = await service.get<{ ok: boolean }>('test:service');

    expect(cached).not.toBeNull();
    expect(cached?.ok).toBe(true);

    const stats = service.getStats();
    expect(stats.provider).toBe('memory'); // Default fall back without active external Redis credentials in test runners
  });
});
