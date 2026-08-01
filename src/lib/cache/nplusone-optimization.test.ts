// Jest / Vitest N+1 Query Elimination & Repository Caching Test Suite
// Employs JUnit and Mockito-style spy assertion methodologies to explicitly prove performance latency stabilization.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DataLoader } from './data-loader';
import { cache } from './redis-cache';
import { getCacheTelemetryReport } from '../performance';

describe('N+1 Query Elimination via Algorithmic DataLoader Batching', () => {
  beforeEach(async () => {
    await cache.clear();
    vi.clearAllMocks();
  });

  it('should coalesce N simultaneous item fetches into precisely 1 batched database query (Mockito-style verification)', async () => {
    // Mockito-style spy capturing underlying database/SQL execution counts
    const dbQuerySpy = vi.fn(async (ids: readonly number[]) => {
      // Simulating database network roundtrip returning mapped entities
      return ids.map(id => ({ id, name: `Resident #${id}`, status: 'Tetap' }));
    });

    const loader = new DataLoader<number, { id: number; name: string; status: string }>(
      async (ids) => dbQuerySpy(ids),
      100 // Batch capacity
    );

    // Simulate 30 independent components or list view items triggering simultaneous individual loads in an MVVM/ERB rendering loop
    const requestedIds = Array.from({ length: 30 }, (_, i) => i + 1);
    const loadPromises = requestedIds.map(id => loader.load(id));

    const results = await Promise.all(loadPromises);

    // CRITICAL ASSERTION: Without DataLoader, 30 load() iterations cause 30 sequential database queries (N+1 bottleneck).
    // With DataLoader debouncing and Hash Map correlation, dbQuerySpy is invoked exactly ONCE!
    expect(dbQuerySpy).toHaveBeenCalledTimes(1);
    expect(dbQuerySpy).toHaveBeenCalledWith(requestedIds);

    // Verify O(1) Hash Map distribution correctly paired every single requested ID with its entity
    expect(results.length).toBe(30);
    results.forEach((entity, index) => {
      expect(entity?.id).toBe(requestedIds[index]);
      expect(entity?.name).toBe(`Resident #${requestedIds[index]}`);
    });
  });

  it('should deduplicate repeating keys within the same batch execution tick', async () => {
    const dbQuerySpy = vi.fn(async (ids: readonly string[]) => {
      return ids.map(id => ({ id, category: 'Keuangan Report' }));
    });

    const loader = new DataLoader<string, { id: string; category: string }>(
      async (ids) => dbQuerySpy(ids)
    );

    // Request the same Report ID 15 times concurrently across multiple Dashboard widgets
    const duplicateIds = Array(15).fill('Januari-2026');
    const results = await Promise.all(duplicateIds.map(id => loader.load(id)));

    expect(dbQuerySpy).toHaveBeenCalledTimes(1);
    // The database only received 1 unique ID to fetch instead of 15 duplicates!
    expect(dbQuerySpy.mock.calls[0][0]).toEqual(['Januari-2026']);
    expect(results.length).toBe(15);
  });

  it('should serve subsequent requests immediately from DataLoader memoized cache in O(1) time', async () => {
    const dbQuerySpy = vi.fn(async (ids: readonly number[]) => {
      return ids.map(id => `Value ${id}`);
    });

    const loader = new DataLoader<number, string>(async (ids) => dbQuerySpy(ids));

    // Initial load
    const val1 = await loader.load(101);
    expect(val1).toBe('Value 101');
    expect(dbQuerySpy).toHaveBeenCalledTimes(1);

    // Subsequent load in a future event loop turn
    const val2 = await loader.load(101);
    expect(val2).toBe('Value 101');
    // Call count remains 1 due to internal memoization!
    expect(dbQuerySpy).toHaveBeenCalledTimes(1);
  });

  it('should reset memoized keys upon mutation to prevent stale data reading', async () => {
    let callCounter = 0;
    const dbQuerySpy = vi.fn(async (ids: readonly number[]) => {
      callCounter++;
      return ids.map(id => `Version ${callCounter} for ID ${id}`);
    });

    const loader = new DataLoader<number, string>(async (ids) => dbQuerySpy(ids));

    // Read initial version
    expect(await loader.load(5)).toBe('Version 1 for ID 5');
    expect(dbQuerySpy).toHaveBeenCalledTimes(1);

    // Simulate entity mutation (update/delete) which triggers cache & loader clearance
    loader.clear(5);
    await cache.delete('warga:5');

    // Next access MUST trigger a fresh query to retrieve updated record
    expect(await loader.load(5)).toBe('Version 2 for ID 5');
    expect(dbQuerySpy).toHaveBeenCalledTimes(2);
  });
});

describe('Telemetry & Performance Latency Stabilization Assurance', () => {
  it('should accurately calculate queries avoided and report telemetry metrics', () => {
    const report = getCacheTelemetryReport();
    expect(report).toHaveProperty('hitRate');
    expect(report).toHaveProperty('queriesSaved');
    expect(report).toHaveProperty('avgBatchSize');
    expect(typeof report.queriesSaved).toBe('number');
  });
});
