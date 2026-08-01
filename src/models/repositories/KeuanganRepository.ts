// KeuanganRepository — Data access for Keuangan domain
// Refactored with Redis caching and DataLoader N+1 query optimization for latency stabilization

import { BaseRepository, QueryResult } from './BaseRepository';
import {
  type MonthlyReportEntity,
  type ExpenseSummaryEntity,
  type BalanceInfo,
  computeBalance,
} from '../entities/Keuangan';
import { cache } from '@/lib/cache/redis-cache';
import { DataLoader } from '@/lib/cache/data-loader';
import { trackCacheAccess, trackBatchExecution } from '@/lib/performance';

const getMockDB = async () => {
  if (typeof window === 'undefined') return null;
  const { MockDB } = await import('@/lib/mockDatabase');
  return MockDB;
};

export class KeuanganRepository extends BaseRepository<MonthlyReportEntity, string> {
  private dataLoader: DataLoader<string, MonthlyReportEntity>;

  constructor() {
    super();
    this.cachePrefix = 'keuangan';
    this.defaultTtlSeconds = 60; // 60 seconds TTL for dynamic financial summaries
    this.dataLoader = new DataLoader<string, MonthlyReportEntity>(
      async (ids) => this.batchFetchByPeriods(ids),
      50
    );
  }

  async getAll(): Promise<MonthlyReportEntity[]> {
    const cacheKey = `${this.cachePrefix}:all`;
    const cached = await cache.get<MonthlyReportEntity[]>(cacheKey);
    if (cached) {
      trackCacheAccess(true);
      return cached;
    }
    trackCacheAccess(false);

    const MockDB = await getMockDB();
    if (!MockDB) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reports = MockDB.getFinanceReports() as any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entities: MonthlyReportEntity[] = reports.map((r: any) => ({
      bulan: r.bulan as string,
      tahun: r.tahun as number,
      saldoAwal: (r.saldo_awal ?? r.saldoAwal ?? 0) as number,
      totalPemasukan: (r.total_pemasukan ?? r.totalPemasukan ?? 0) as number,
      totalPengeluaran: (r.total_pengeluaran ?? r.totalPengeluaran ?? 0) as number,
      saldoAkhir: (r.saldo_akhir ?? r.saldoAkhir ?? 0) as number,
      transaksi: ((r.transaksi as Array<Record<string, unknown>>) ?? []).map(t => ({
        id: (t.id as string) ?? '',
        tanggal: (t.tanggal as string) ?? '',
        keterangan: (t.keterangan as string) ?? '',
        kategori: (t.kategori as string) ?? '',
        tipe: (t.tipe as 'pemasukan' | 'pengeluaran') ?? 'pengeluaran',
        jumlah: (t.jumlah as number) ?? 0,
      })),
    }));

    await cache.set(cacheKey, entities, this.defaultTtlSeconds);
    return entities;
  }

  async getById(id: string): Promise<MonthlyReportEntity | null> {
    // id = "bulan-tahun" format, e.g., "Januari-2026"
    const cacheKey = `${this.cachePrefix}:report:${id}`;
    const cached = await cache.get<MonthlyReportEntity>(cacheKey);
    if (cached) {
      trackCacheAccess(true);
      return cached;
    }
    trackCacheAccess(false);

    const report = await this.dataLoader.load(id);
    if (report) {
      await cache.set(cacheKey, report, this.defaultTtlSeconds);
    }
    return report;
  }

  async getByPeriod(bulan: string, tahun: number): Promise<MonthlyReportEntity | null> {
    return this.getById(`${bulan}-${tahun}`);
  }

  /**
   * Batch resolver called by DataLoader to eliminate N+1 queries when loading multiple monthly periods.
   */
  private async batchFetchByPeriods(ids: readonly string[]): Promise<Array<MonthlyReportEntity | null>> {
    trackBatchExecution(ids.length);
    const reports = await this.getAll();
    const map = new Map<string, MonthlyReportEntity>();
    for (const r of reports) {
      map.set(`${r.bulan}-${r.tahun}`, r);
    }
    return ids.map(id => map.get(id) ?? null);
  }

  async create(_entity: Partial<MonthlyReportEntity>): Promise<QueryResult<MonthlyReportEntity>> {
    void _entity;
    return { success: false, error: 'Keuangan data is read-only in local mode' };
  }

  async update(_id: string, _entity: Partial<MonthlyReportEntity>): Promise<QueryResult<MonthlyReportEntity>> {
    void _id;
    void _entity;
    return { success: false, error: 'Keuangan data is read-only in local mode' };
  }

  async delete(_id: string): Promise<QueryResult<void>> {
    void _id;
    return { success: false, error: 'Keuangan data is read-only in local mode' };
  }

  async getBalance(): Promise<BalanceInfo> {
    const cacheKey = `${this.cachePrefix}:balance`;
    const cached = await cache.get<BalanceInfo>(cacheKey);
    if (cached) {
      trackCacheAccess(true);
      return cached;
    }
    trackCacheAccess(false);

    const reports = await this.getAll();
    const balance = computeBalance(reports);
    await cache.set(cacheKey, balance, this.defaultTtlSeconds);
    return balance;
  }

  async getExpenseSummary(): Promise<ExpenseSummaryEntity> {
    const cacheKey = `${this.cachePrefix}:summary`;
    const cached = await cache.get<ExpenseSummaryEntity>(cacheKey);
    if (cached) {
      trackCacheAccess(true);
      return cached;
    }
    trackCacheAccess(false);

    const MockDB = await getMockDB();
    if (!MockDB) {
      return { avgMonthlyExpense: 0, categories: [] };
    }

    const summary = MockDB.getFinanceSummary();
    const entity: ExpenseSummaryEntity = {
      avgMonthlyExpense: summary.avgMonthlyExpense ?? 0,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      categories: ((summary.categories ?? []) as any[]).map((c: any) => ({
        kategori: (c.kategori as string) ?? '',
        persentase: (c.persentase as number) ?? 0,
        avgBulanan: (c.avgBulanan as number) ?? 0,
        keterangan: (c.keterangan as string) ?? '',
        kategoriNormalized: c.kategori_normalized as string | undefined,
      })),
    };

    await cache.set(cacheKey, entity, this.defaultTtlSeconds);
    return entity;
  }
}

// Singleton instance
let _instance: KeuanganRepository | null = null;

export function getKeuanganRepository(): KeuanganRepository {
  if (!_instance) {
    _instance = new KeuanganRepository();
  }
  return _instance;
}
