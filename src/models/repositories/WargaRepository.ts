// WargaRepository — Data access for Warga domain
// Refactored with Redis Caching and DataLoader N+1 query elimination for performance stability

import { BaseRepository, QueryResult } from './BaseRepository';
import { type WargaEntity, type WargaStatus, createWargaEntity, type StatistikWarga, computeStatistik } from '../entities/Warga';
import type { PengurusEntity } from '../entities/Warga';
import { cache } from '@/lib/cache/redis-cache';
import { DataLoader } from '@/lib/cache/data-loader';
import { trackCacheAccess, trackBatchExecution } from '@/lib/performance';

// Lazy imports to avoid SSR issues — these are client-side only modules
const getSqliteDB = async () => {
  if (typeof window === 'undefined') return null;
  const { SqliteDB } = await import('@/lib/sqliteDB');
  return SqliteDB;
};

const getMockDB = async () => {
  if (typeof window === 'undefined') return null;
  const { MockDB } = await import('@/lib/mockDatabase');
  return MockDB;
};

export class WargaRepository extends BaseRepository<WargaEntity> {
  private dataLoader: DataLoader<number, WargaEntity>;

  constructor() {
    super();
    this.cachePrefix = 'warga';
    this.defaultTtlSeconds = 300; // 5 minutes standard cache TTL
    this.dataLoader = new DataLoader<number, WargaEntity>(
      async (ids) => this.batchFetchByIds(ids),
      100 // max batch chunk capacity
    );
  }

  async getAll(): Promise<WargaEntity[]> {
    const cacheKey = `${this.cachePrefix}:all`;
    const cached = await cache.get<WargaEntity[]>(cacheKey);
    if (cached) {
      trackCacheAccess(true);
      return cached;
    }
    trackCacheAccess(false);

    const SqliteDB = await getSqliteDB();
    if (!SqliteDB) return [];

    await SqliteDB.init();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawData = SqliteDB.getAllWarga() as any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entities = rawData.map((row: any) => createWargaEntity({
      id: row.id as number,
      nama: row.nama as string,
      alamat: row.alamat as string,
      status: row.status as WargaStatus,
      telepon: row.telepon as string,
    }));

    await cache.set(cacheKey, entities, this.defaultTtlSeconds);
    return entities;
  }

  async getById(id: number): Promise<WargaEntity | null> {
    const cacheKey = `${this.cachePrefix}:${id}`;
    const cached = await cache.get<WargaEntity>(cacheKey);
    if (cached) {
      trackCacheAccess(true);
      return cached;
    }
    trackCacheAccess(false);

    // Delegate to DataLoader to batch concurrent lookups and eliminate N+1 latency
    const entity = await this.dataLoader.load(id);
    if (entity) {
      await cache.set(cacheKey, entity, this.defaultTtlSeconds);
    }
    return entity;
  }

  async getByIds(ids: number[]): Promise<WargaEntity[]> {
    const results = await this.dataLoader.loadMany(ids);
    return results.filter((r): r is WargaEntity => r !== null);
  }

  /**
   * Internal batch fetching mechanism executed by DataLoader to solve N+1 query loops.
   */
  private async batchFetchByIds(ids: readonly number[]): Promise<Array<WargaEntity | null>> {
    trackBatchExecution(ids.length);
    const all = await this.getAll();
    const idMap = new Map<number, WargaEntity>();
    for (const w of all) {
      idMap.set(w.id, w);
    }
    return ids.map(id => idMap.get(id) ?? null);
  }

  async create(entity: Partial<WargaEntity>): Promise<QueryResult<WargaEntity>> {
    try {
      const SqliteDB = await getSqliteDB();
      if (!SqliteDB) return { success: false, error: 'Database not available' };

      await SqliteDB.init();
      SqliteDB.addWarga(entity);
      const created = createWargaEntity(entity);

      // Invalidate cached datasets and reset DataLoader memoization
      await cache.invalidatePattern(`${this.cachePrefix}:*`);
      this.dataLoader.clearAll();

      return { success: true, data: created };
    } catch (error) {
      return { success: false, error: `Failed to create warga: ${error}` };
    }
  }

  async update(id: number, entity: Partial<WargaEntity>): Promise<QueryResult<WargaEntity>> {
    try {
      const existing = await this.getById(id);
      if (!existing) return { success: false, error: 'Warga not found' };

      const updated = { ...existing, ...entity, id };
      
      // Invalidate relevant caches on mutation
      await cache.invalidatePattern(`${this.cachePrefix}:*`);
      this.dataLoader.clear(id);

      return { success: true, data: updated };
    } catch (error) {
      return { success: false, error: `Failed to update warga: ${error}` };
    }
  }

  async delete(id: number): Promise<QueryResult<void>> {
    try {
      const exists = await this.exists(id);
      if (!exists) return { success: false, error: 'Warga not found' };

      await cache.invalidatePattern(`${this.cachePrefix}:*`);
      this.dataLoader.clear(id);

      return { success: true };
    } catch (error) {
      return { success: false, error: `Failed to delete warga: ${error}` };
    }
  }

  async search(query: string): Promise<WargaEntity[]> {
    const all = await this.getAll();
    if (!query || query.trim().length === 0) return all;

    const lowerQuery = query.toLowerCase();
    return all.filter(w =>
      w.nama.toLowerCase().includes(lowerQuery) ||
      w.alamat.toLowerCase().includes(lowerQuery) ||
      w.status.toLowerCase().includes(lowerQuery)
    );
  }

  async getStatistik(): Promise<StatistikWarga> {
    const cacheKey = `${this.cachePrefix}:statistik`;
    const cached = await cache.get<StatistikWarga>(cacheKey);
    if (cached) {
      trackCacheAccess(true);
      return cached;
    }
    trackCacheAccess(false);

    const wargaList = await this.getAll();
    const stats = computeStatistik(wargaList);
    await cache.set(cacheKey, stats, this.defaultTtlSeconds);
    return stats;
  }

  async getPengurus(): Promise<PengurusEntity[]> {
    const cacheKey = `${this.cachePrefix}:pengurus`;
    const cached = await cache.get<PengurusEntity[]>(cacheKey);
    if (cached) {
      trackCacheAccess(true);
      return cached;
    }
    trackCacheAccess(false);

    const MockDB = await getMockDB();
    if (!MockDB) return [];
    const pengurus = MockDB.getPengurus();
    await cache.set(cacheKey, pengurus, this.defaultTtlSeconds);
    return pengurus;
  }
}

// Singleton instance
let _instance: WargaRepository | null = null;

export function getWargaRepository(): WargaRepository {
  if (!_instance) {
    _instance = new WargaRepository();
  }
  return _instance;
}
